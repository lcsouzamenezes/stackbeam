require('dotenv').config();
const http = require('http');
const PORT = process.env.SERVER_PORT;
const host = `Server running on PORT : ${PORT}`;

const EventEmitter = require('events');
const eventListener = new EventEmitter();

let server = http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    eventListener.emit('serverError', JSON.parse(body).data);
    response.end();
  });
}).listen(PORT, () => {
  console.log(host);
  const io = require('socket.io').listen(server);
  const socket = require('./socketServer').init(io, eventListener);
});