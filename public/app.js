'use strict';

var socket = window.io.connect('http://localhost:10000', {
  transports: ['websocket']
});

var allEvents = [];

socket.on('connect',function() {
  console.log('::connect');
});

socket.on('disconnect',function(reason) {
  console.log('::disconnect', reason);
});

socket.on('error',function(err) {
  console.log('::error', err);
});


socket.on('journal', function(data){
  allEvents = data.map((item)=>JSON.parse(item));
  console.log('::journal', allEvents.length);
  allEvents.forEach((ev,i)=> console.log(i+'.',ev));
});

function send(type,data){
  data._localTime = Date.now();
  socket.emit(type,data);
}

function doSpawn(){
    send('spawn', {
        pId: Math.random(),
        x: Math.random(),
        y: Math.random(),
    });
}
