/**
 * Holds clients information
 */
let clients = {};

module.exports.init = socket => {

  socket.on('connection', client => {

    client.on('join', name => {
      clients[client.id] = name;
      socket.sockets.emit('update', `${name} has connected to the server.`);
      console.log(`${clients[client.id]} has joined the server.`);

      setTimeout(() => {
        socket.sockets.emit('code', `
          // Optional fallthrough error handler
          app.use(function onError(err, req, res, next) {
            // The error id is attached to \`res.sentry\` to be returned
            // and optionally displayed to the user for support.
            res.statusCode = 500;
            res.end(res.sentry + '\\n');
          });
        `);
      }, 1000);
    });

    client.on('disconnect', reason => {
      if (!clients[client.id]) {
        socket.sockets.emit('update', `${clients[client.id]} has left the server.`);
        console.log(`${clients[client.id]} has left the server.`);
        delete clients[client.id];
      }
    });

  });

}