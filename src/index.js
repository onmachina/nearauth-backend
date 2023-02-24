'use strict';

require('express-async-errors');

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const auth = require('./auth');
const env = require('./env');
const logger = require('./logger');
const { errorHandler, notFound } = require('./errors');

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use('/auth/v1', auth);
app.use('/auth/v1.0', auth);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    app.listen(env.SERVER_PORT, () =>
      logger.info(`Server is listening on port ${env.SERVER_PORT}...`)
    );
  } catch (error) {
    logger.info(error);
  }
};

start();
