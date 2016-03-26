'use strict';

var HOST = location.origin.replace(/^http/, 'ws')
var socket = window.io.connect(HOST, {
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
  allEvents.forEach((ev,i)=> console.log(i+'.',ev._type, new Date(ev._time) ));
});

function send(type,data){
  data._localTime = Date.now();
  console.log('>', type, data);
  socket.emit(type,data);
}

function doSpawn(){
  window.spawnbtn.disabled = true;
  window.shootbtn.disabled = false;
  send('spawn', {
    pId: Math.random(),
    x: Math.random(),
    y: Math.random(),
  });
}

function doAim(){
  send('aim', {
    pId: Math.random(),
    x: Math.random(),
    y: Math.random(),
  });
}

function doShoot(){
  send('shoot', {
    pId: Math.random(),
    x: Math.random(),
    y: Math.random(),
    fX: 20,
    fY: 5,
  });
}

window.spawnbtn.onclick = doSpawn;

window.shootbtn.onmousedown = doAim;

window.shootbtn.onkeydown = doAim;

window.shootbtn.onclick = doShoot; //(ev)=> console.log('onclick', ev)




