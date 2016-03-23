'use strict';

var persistence = require('./persistence');

module.exports = function initSockets(server){
  var io = require('socket.io')(server);

  io.set('transports', ['websocket']);

  io.on('connection', function (socket) {
    persistence.getAllEvents().then((list)=>{
      socket.emit('journal', list);
    });
    socket.on('spawn', function (data) {
      persistence.addEvent('spawn',data);
    });
  });
};
