require('dotenv').config();

/**
 * Constants
 */
const PORT = process.env.SERVER_PORT;

/**
 * Load necessary modules
 */
const host = `Server running on PORT : ${PORT}`;
const express = require('express');
const Raven = require('raven');
const app = express();

// The request handler must be the first middleware on the app
app.use(Raven.requestHandler());

app.get('/', function mainHandler(req, res) {
  throw new Error('Broke!');
});

// The error handler must be before any other error middleware
app.use(Raven.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
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
  const socket = require('./socketServer').init(io);
});