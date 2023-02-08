const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, _req, res, _next) => {
  res.sendStatus(err.statusCode);
};

const methodNotAllowed = (_req, _res) => {
  throw new MethodNotAllowedError();
};

const notFound = (_req, _res) => {
  throw new NotFoundError();
};

class NotFoundError extends Error {
  constructor() {
    super();
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

class MethodNotAllowedError extends Error {
  constructor() {
    super();
    this.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
  }
}

class BadRequestError extends Error {
  constructor() {
    super();
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

class UnauthenticatedError extends Error {
  constructor() {
    super();
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = {
  errorHandler,
  notFound,
  methodNotAllowed,
  NotFoundError,
  MethodNotAllowedError,
  BadRequestError,
  UnauthenticatedError,
};
