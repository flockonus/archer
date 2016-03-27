'use strict';

var HOST = location.origin.replace(/^http/, 'ws')
var socket = window.io.connect(HOST, {
  transports: ['websocket']
});

var allEvents = [];

// pragmatic Player draft
var playerData = {
  pId: Math.random(),
  x: null,
  y: null,
};

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
  allEvents = data.map((item)=>{
    var obj = JSON.parse(item);
    obj.__time = new Date(obj._time);
    return obj;
  });
  console.log('::journal', allEvents.length);
  console.table(allEvents, ['_id', '_type', '__time']);
  // TODO process all events before
  doSpawn();
});

function send(type,data){
  data._localTime = Date.now();
  console.log('>', type, data);
  socket.emit(type,data);
}

function doSpawn(){
  // window.spawnbtn.disabled = true;
  // window.shootbtn.disabled = false;
  playerData.x = Math.round(Math.random() * 100);
  send('spawn', playerData);
}

/*
function doShoot(){
  send('shoot', {
    pId: Math.random(),
    x: Math.random(),
    y: Math.random(),
    fX: 20,
    fY: 5,
  });
}
*/

// window.spawnbtn.onclick = doSpawn;

// window.shootbtn.onmousedown = doAim;

// window.shootbtn.onkeydown = doAim;

// window.shootbtn.onclick = doShoot; //(ev)=> console.log('onclick', ev)








var Phaser = window.Phaser;


var game;

function preload() {

    game.stage.backgroundColor = '#85b5e1';

    game.load.baseURL = 'http://examples.phaser.io/assets/';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/phaser-dude.png');
    // game.load.image('platform', 'sprites/platform.png');

}


var player;
var arrows;
// var cursors;
var shootButton;
// limit 3 arrows per second
var ARROW_COOLDOWN = 1000/3;

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  player = game.add.sprite(100, 200, 'player');

  game.physics.arcade.enable(player);

  // player.enableBody = true;

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 500;


  arrows = game.add.physicsGroup();
  game.physics.arcade.enable(arrows);
  // arrows.enableBody = true;
  // arrows.physicsBodyType = Phaser.Physics.ARCADE;

  // arrows.body.collideWorldBounds = true;

  // works?

  arrows.createMultiple(100, 'arrow');
  arrows.setAll('body.gravity.y', 300);
  arrows.setAll('body.collideWorldBounds', true);

  // platforms.create(100, 100, 'platform');
  // platforms.create(-200, 300, 'platform');
  // platforms.create(200, 250, 'platform');

  // platforms.setAll('body.immovable', true);

  // cursors = game.input.keyboard.createCursorKeys();
  // jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  shootButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

var aiming = false;
var onCooldown = false;

function update () {

  player.x = playerData.x;
  //game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)



  if( shootButton.isDown && aiming === false && !onCooldown){
    aiming = true;
    doAim();
  }

  if( shootButton.isUp && aiming === true && !onCooldown){
    doShoot();
    //
  }

  // game.physics.arcade.collide(player, platforms);

  player.body.velocity.x = 0;



  // if (cursors.left.isDown)
  // {
  //   player.body.velocity.x = -250;
  // }
  // else if (cursors.right.isDown)
  // {
  //   player.body.velocity.x = 250;
  // }

  // if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down))
  // {
  //   player.body.velocity.y = -400;
  // }
}

var arrow;

function doAim(){
  send('aim', _.extend({},playerData,{}));
}

function doShoot() {
  aiming = false;
  onCooldown = true;
  setTimeout(()=>{
    onCooldown = false;
  }, ARROW_COOLDOWN);

  arrow = arrows.getFirstExists(false);
  arrow.reset(player.x, player.y - player.height*0.66);
  arrow.body.velocity.x = 800;

  send('shoot', _.extend({},playerData,{
    fX: 800,
    fY: 0,
  }));
}


function render () {

}

game = new Phaser.Game(400, 300, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });
