'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
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
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
