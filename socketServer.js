/**
 * Holds clients information
 */
let clients = {};

const fs = require('fs');
const errorJSON = JSON.parse(fs.readFileSync('./dataSample.json', 'utf8'));

module.exports.init = socket => {

  socket.on('connection', client => {

    client.on('join', name => {
      clients[client.id] = name;
      socket.sockets.emit('update', `${name} has connected to the server.`);
      console.log(`${clients[client.id]} has joined the server.`);

      setTimeout(() => {
        socket.sockets.emit('code', errorJSON);
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