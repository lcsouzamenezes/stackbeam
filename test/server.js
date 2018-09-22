require('dotenv').config();

const PORT = 1333;
const host = `Server running on PORT : ${PORT}`;

const fs = require('fs');
const express = require('express');
const app = express();

const TOKEN = 'XYZ';
const ZeroCrash = require('../libs/zerocrash').install(TOKEN);

app.use(ZeroCrash.requestHandler());

app.get('/', async (req, res, next) => {
  let erroredAsyncFunction = async () => {
    throw new Error('AN ASYNC ERROR HAS OCCURED!');
  };

  await erroredAsyncFunction();
  // throw new Error('A SYNC ERROR HAS OCCURED');

  // fs.readFile('somefile.txt', function (err, data) {
  //   if (err) throw err;
  //   console.log(data);
  // });
});

app.use(ZeroCrash.errorHandler());

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

let server = app.listen(PORT, () => { console.log(host); });