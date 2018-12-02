const PORT = 1333;
const host = `Server running on PORT : ${PORT}`;

const fs = require('fs');
const express = require('express');
const app = express();

let runEndpointFunction = (req, res, next) => {
  let x = 5;
  let n = 3;

  setTimeout(() => {
    res.status(202).json({ 'message': 'done' });
  }, Math.random() * 50);

  console.log(x);
  console.log(n);

  let sum = x + n;

  // t.heyThereFunction();

  let text = 'some text';
  let code = 'some code that runs';

  console.log('this is the line');
  let z = x + Math.sin(n);

  console.log('our result', z);
};

const TOKEN = 'XYZ';
const ZeroCrash = require('../').install(TOKEN);

app.use(ZeroCrash.requestHandler());

app.post('/hithere', runEndpointFunction);

app.use(ZeroCrash.errorHandler());

app.use(function on404(request, response, next) {
  response.statusCode = 404;
  response.end('Not found');
});

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

let server = app.listen(PORT, () => { console.log(host); });