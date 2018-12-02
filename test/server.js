require('dotenv').config();

const PORT = 1333;
const host = `Server running on PORT : ${PORT}`;

const fs = require('fs');
const express = require('express');
const app = express();

const TOKEN = 'XYZ';
const ZeroCrash = require('../libs/zerocrash').install(TOKEN, {
  'alarm': true,
    'events': true,
    'benchmarks': true,
    'crashReporting': true,
});

app.use(ZeroCrash.requestHandler());

app.get('/', async (req, res, next) => {
  // console.log('req: ', req);
  // let erroredAsyncFunction = async () => {
  //   throw new Error('AN ASYNC ERROR HAS OCCURED!');
  // };

  // await erroredAsyncFunction();
  // throw new Error('A SYNC ERROR HAS OCCURED');

  // fs.readFile('somefile.txt', function (err, data) {
  //   if (err) throw err;
  //   console.log(data);
  // });
  setTimeout(() => {
    return res.status(200).json({ message: 'm' });  
  }, 2000);
});

app.use(ZeroCrash.errorHandler());
/**
 * Catch 404 and forward to error handler
 */
app.use((request, response, next) => {
  response.statusCode = 404;
  response.end('Not found');
});

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

let server = app.listen(PORT, () => { console.log(host); });