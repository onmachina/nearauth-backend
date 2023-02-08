'use strict';

const { methodNotAllowed, BadRequestError } = require('./errors');
const express = require('express');

const router = express.Router();

const login = (req, res) => {
  const user = req.header('x-auth-user');
  const key = req.header('x-auth-key');

  if (!user || !key) {
    throw new BadRequestError();
  }

  res.send();
};

// GET method is compatible with Swift /auth/v1.0.
router.route('/').get(login).all(methodNotAllowed);

module.exports = router;
