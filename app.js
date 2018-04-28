require('dotenv').config();

/**
 * Constants
 */
const PORT = process.env.SERVER_PORT;

/**
 * Load necessary modules
 */
const host = `Server running on PORT : ${PORT}`;
const ZeroCrash = require('./libs/zerocrash');
const express = require('express');
const app = express();

/**
 * Initialize Listeners
 */
const EventEmitter = require('events');
const eventListener = new EventEmitter();

app.get('/', (req, res, next) => {
  try {
    throw new Error('Broke!');
  } catch (error) {
    next(error);
  }
});

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {

  ZeroCrash.parseStack(err, frames => {
    eventListener.emit('serverError', frames);
  });

  res.statusCode = 500;
  res.end('Oops, something bad happened');
});

/**
 * Setting the server listening on PORT 9191
 */
let server = app.listen(PORT, () => {
  console.log(host);

  /**
   * Initializes the socket server
   */
  const io = require('socket.io').listen(server);
  const socket = require('./socketServer').init(io, eventListener);
});