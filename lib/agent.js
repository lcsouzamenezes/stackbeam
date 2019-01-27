const forever = require('forever');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io-client');
const disk = require('diskusage');
const os = require('os');

let server;
const app = express();
const INTERVAL_MS = 2000;
const SERVER_PORT = 3366;
// const ENDPOINT = 'https://rtc.stackbeam.io';
const ENDPOINT = 'http://localhost:62394';
const diskPath = os.platform() === 'win32' ? 'c:' : '/';

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

// JOIN SERVER
socket.emit('join', 'lib');

const getCPUUsage = callback => {
  const stats1 = getCPUInfo();
  const startIdle = stats1.idle;
  const startTotal = stats1.total;

  setTimeout(() => {
    const stats2 = getCPUInfo();
    const endIdle = stats2.idle;
    const endTotal = stats2.total;

    const idle = endIdle - startIdle;
    const total = endTotal - startTotal;
    const perc = idle / total;

    callback((1 - perc));
  }, 1000);
}

const getCPUInfo = callback => {
  let cpus = os.cpus();
  let total = 0;

  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;

  for (let cpu in cpus) {

    user += cpus[cpu].times.user;
    nice += cpus[cpu].times.nice;
    sys += cpus[cpu].times.sys;
    irq += cpus[cpu].times.irq;
    idle += cpus[cpu].times.idle;
  }

  total = user + nice + sys + idle + irq;

  return {
    'idle': idle,
    'total': total
  };
}

forever.startServer();

app.post('/library/metrics', (request, response) => {
  socket.emit('metric', request.body);
});

app.post('/library/exceptions', (request, response) => {
  socket.emit('exception', request.body);
});

server = app.listen(SERVER_PORT, err => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${SERVER_PORT}`);
});

let statsReader = setInterval(async () => {
  const stats = {};
  const info = await disk.check(diskPath);

  stats.diskMeasure = 'GB';
  stats.diskFree = Math.round(info.free / 1024 / 1024 / 1024);
  stats.diskTotal = Math.round(info.total / 1024 / 1024 / 1024);
  stats.diskAvailable = Math.round(info.available / 1024 / 1024 / 1024);

  stats.memoryMeasure = 'MB';
  stats.memoryFree = Math.round(os.freemem() / 1024 / 1024);
  stats.memoryTotal = Math.round(os.totalmem() / 1024 / 1024);
  stats.memoryUsed = stats.memoryTotal - stats.memoryFree; 

  getCPUUsage(cpu =>
    socket.emit('stats', {
      ...stats,
      cpuUsage: Math.round(cpu * 100)
    })
  );
}, INTERVAL_MS);

const terminate = () => {
  server.close()
  clearInterval(statsReader);
}

process.on('exit', terminate);
process.on('SIGTERM', terminate);
process.on('uncaughtException', terminate);
