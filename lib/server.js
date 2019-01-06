const forever = require('forever');
const express = require('express');
const socketIO = require('socket.io-client');
const bodyParser = require('body-parser');
const pidusage = require('pidusage');

const app = express();
const INTERVAL_MS = 2000;
const SERVER_PORT = 3366;
// const ENDPOINT = 'https://rtc.stackbeam.io';
const ENDPOINT = 'http://localhost:62394';

const MEM_COMMAND = 'free -m';
const CPU_COMMAND = 'grep \'cpu \' /proc/stat | awk \'{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}\'';

// Support JSON-encoded bodies
app.use(bodyParser.json());

// Support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const socket = socketIO(ENDPOINT, {
  broadcaster: 'socket.io',
  upgrade: false,
  transports: ['websocket'],
  path: '/connect',
  query: { token: process.argv[2] }, // Should come from dashboard
  host: ENDPOINT,
  reconnection: true,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 7000,
  reconnectionAttempts: 5,
  auth: {
    headers: {},
    meta: {}
  }
});

socket.on('connect', data => {
  console.log('data: ', data);
  socket.emit('join', ''); // Connect to user's private channel
});

socket.on('event', (data) => {
  console.log('data: ', data);
});

socket.on('disconnect', () => {
  console.log('disconnect: ');
});

forever.startServer();

app.post('/library/metrics', (request, response) => {
  socket.emit('metric', request.body);
});

app.post('/library/exceptions', (request, response) => {
  socket.emit('exception', request.body);
});

app.listen(SERVER_PORT, err => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${SERVER_PORT}`);
});

const sendServerStats = (command, event) => {
  const { exec } = require('child_process');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return console.error(error);
    }

    console.info(stdout);
    socket.emit(event, stdout);
  });
}

let statsReader = setInterval(() => {
  sendServerStats(MEM_COMMAND, 'memstat');
  sendServerStats(CPU_COMMAND, 'cpustat');
  pidusage(process.argv[3], (error, stats) => {
    if (error) {
      return console.error(error);
    }

    console.info(stats);
    socket.emit('stats', stats);
  });
}, INTERVAL_MS);