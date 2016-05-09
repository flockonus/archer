'use strict';

var persistence = require('./persistence');

// keeps track of every player connected to this server instance
var playerListById = {};

var io;
module.exports = function initSockets(server){
  io = require('socket.io')(server);

  io.set('transports', ['websocket']);

  io.on('connection', function (socket) {
    persistence.getAllEvents().then((list)=>{
      socket.emit('journal', list);
    });

    receiveEvent(socket,'spawn');
    receiveEvent(socket,'aim');
    receiveEvent(socket,'shoot');

    socket.on('disconnect', function handleDisconnect(ev) {
      console.log('broadcast!!')
      io.emit('disconnected', {pId: playerListById[socket.id]});
    });
  });
};

function receiveEvent(socket, type) {
  socket.on(type, function(data){
    // persistence will change/add object properties
    persistence.addEvent(type, data);

    switch (type) {
      case('spawn'):
            playerListById[socket.id] = data.pId;
            break;
    }

    // broadcast
    io.emit(type,data);
    // socket.broadcast.emit(type, data);
  });
}
