const forever = require("forever");
const express = require("express");
const socketIO = require('socket.io-client');
const app = express();
const server_port = 3333;
const endpoint = 'https://rtc.stackbeam.io';
const token = process.getuid();

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // Support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // Support URL-encoded bodies
    extended: true
  })
);

const socket = socketIO(endpoint, {
  broadcaster: 'socket.io',
  upgrade: false,
  transports: ['websocket'],
  path: '/connect',
  query: { token: token }, // Should come from dashboard
  host: endpoint,
  reconnection: true,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 7000,
  reconnectionAttempts: 5,
  auth: {
    headers: {},
    meta: {
    }
  }
});

const privateChannelConfig = {
  channel: token,
  headers: {},
  auth: {
    headers: {},
    meta: {
    }
  }
};

this.socket.on('connect', data => {
  this.socket.emit('subscribe', privateChannelConfig); // Connect to user's private channel
});

socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

forever.startServer();

app.get("/", (request, response) => {
  response.send("Hello from Express!");
});

app.post("/test", (request, response) => {
  console.log("request: ", request.body);
  response.send("Hello from Express!");
});

app.listen(server_port, err => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${server_port}`);
});

function emitSocketEvent(message, body) {
  sock.emit(message, body);
}
