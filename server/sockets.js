'use strict';

var persistence = require('./persistence');

module.exports = function initSockets(server){
  var io = require('socket.io')(server);

  io.set('transports', ['websocket']);

  io.on('connection', function (socket) {
    persistence.getAllEvents().then((list)=>{
      socket.emit('journal', list);
    });

    receiveEvent(socket,'spawn');
    receiveEvent(socket,'aim');
    receiveEvent(socket,'shoot');

  });
};

function receiveEvent(socket, type){
  socket.on(type, function(data){
    // persistence will change/add object properties
    persistence.addEvent(type,data);

  });
}
