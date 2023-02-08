'use strict';

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const morgan = require('morgan');

const logger = require('./logger');
const auth = require('./auth');
const { errorHandler, notFound } = require('./errors');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use('/auth/v1', auth);
app.use('/auth/v1.0', auth);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    app.listen(PORT, () =>
      logger.info(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    logger.info(error);
  }
};

start();
