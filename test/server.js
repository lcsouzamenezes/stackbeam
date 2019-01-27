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

  t.heyThereFunction();

  let text = 'some text';
  let code = 'some code that runs';

  console.log('this is the line');
  let z = x + Math.sin(n);

  console.log('our result', z);
};

const TOKEN = 'E61D3DBD71939F8C877B1981C553F246D4A1C0DCEE41C58B8C4F86222B639E58';
const StackBeam = require('../').install(TOKEN);

app.use(StackBeam.requestHandler());

app.post('/hithere', runEndpointFunction);

app.use(StackBeam.errorHandler());

app.use(function on404(request, response, next) {
  response.statusCode = 404;
  response.end('Not found');
});

app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

let server = app.listen(PORT, () => { console.log(host); });