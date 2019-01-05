const forever = require("forever");
const express = require("express");
const socketIO = require('socket.io-client');
const app = express();
const server_port = 3366;
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
  query: { token: process.argv[2] }, // Should come from dashboard
  host: endpoint,
  reconnection: true,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 7000,
  reconnectionAttempts: 5,
  auth: {
    headers: {
      authorization: token
    },
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

socket.on('connect', data => {
  console.log('data: ', data);
  socket.emit('join', ''); // Connect to user's private channel
});

socket.on('event', function (data) {
  console.log('data: ', data);
  
});
socket.on('disconnect', function () {
  console.log('disconnect: ');
  
});

forever.startServer();

app.get("/", (request, response) => {
  response.send("Hello from Express!");
});

app.post("/test", (request, response) => {
  console.log("request: ", request.body);
  response.send("Hello from Express!");
});

// app.post("/library/metrics", (request, response) => {
//   socket.emit('metric', request.body);
// });


app.post("/library/exceptions", (request, response) => {
  console.log("request123213: ", request.body);
  socket.emit('exception', request.body);
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

