const { StatusCodes } = require('http-status-codes');

const logger = require('./logger');

const errorHandler = (err, _req, res, _next) => {
  if (err.message) {
    logger.debug(err.message);
    logger.silly(err.stack);
  }

  res.sendStatus(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
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
  constructor(message) {
    super(message);
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
