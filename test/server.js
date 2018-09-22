require('dotenv').config();

/**
 * Constants
 */
const PORT = 1333;

/**
 * Load necessary modules
 */
const host = `Server running on PORT : ${PORT}`;
const ZeroCrash = require('../libs/zerocrash');
const express = require('express');
const app = express();

app.use()

app.get('/', (req, res, next) => {
  throw new Error('AN ERROR HAS OCCURED!');
});

app.use(ZeroCrash.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

let server = app.listen(PORT, () => { console.log(host); });