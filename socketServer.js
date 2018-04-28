/**
 * Holds clients information
 */
let clients = {};

module.exports.init = (socket, errorListener) => {

  socket.on('connection', client => {

    client.on('join', name => {
      clients[client.id] = name;
      socket.sockets.emit('update', `${name} has connected to the server.`);
      console.log(`${clients[client.id]} has joined the server.`);

      errorListener.on('serverError', (errorJSON) => {
        socket.sockets.emit('error', errorJSON);
      });
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