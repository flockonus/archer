'use strict';

var HOST = location.origin.replace(/^http/, 'ws');

var Phaser = window.Phaser;
var game;

var socket = window.io.connect(HOST, {
  transports: ['websocket']
});

var allEvents = [];

// pragmatic Player draft (it's all sent throguh network)
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
  startGameLoad();
});

function send(type,data){
  data._localTime = Date.now();
  console.log('>', type, data);
  socket.emit(type,data);
}

function startGameLoad(){
  game = new Phaser.Game(400, 300, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });
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













function preload() {

    game.stage.backgroundColor = '#85b5e1';

    game.load.baseURL = 'http://examples.phaser.io/assets/';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/phaser-dude.png');
    game.load.image('platform', 'sprites/platform.png');

}


var player;

function doSpawn(){
  // window.spawnbtn.disabled = true;
  // window.shootbtn.disabled = false;
  playerData.x = Math.round(Math.random() * 100);
  playerData.y = game.world.height - 20*2;
  player.reset(playerData.x, player.y);
  send('spawn', playerData);
}


var arrows;
var platforms;
// var cursors;
var shootButton;
// limit 3 arrows per second
var ARROW_COOLDOWN = 1000/3;

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  player = game.add.sprite(100, 200, 'player');
  // making invisible things, a sure way to fuckup
  player.visible = false;

  game.physics.arcade.enable(player);

  // player.enableBody = true;

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 500;
  // we'll show when it 'respawn'
  player.kill();


  arrows = game.add.physicsGroup();
  game.physics.arcade.enable(arrows);

  // we'll need more but lets create just a few so we can detect bugs faster
  arrows.createMultiple(100, 'arrow');
  arrows.setAll('body.gravity.y', 300);
  arrows.setAll('body.collideWorldBounds', true);

  platforms = game.add.physicsGroup();

  var p = platforms.create(0, game.world.height-20, 'platform');
  p.width = game.width*2;
  // platforms.create(-200, 300, 'platform');
  // platforms.create(200, 250, 'platform');

  platforms.setAll('body.immovable', true);
  game.physics.arcade.enable(platforms);

  // cursors = game.input.keyboard.createCursorKeys();
  // jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  shootButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  // TODO v2: apply all events to game

  doSpawn();

  // not working(?)..  game.camera.follow(player)
}

var aiming = false;
var onCooldown = false;

function update () {

  if( shootButton.isDown && aiming === false && !onCooldown){
    aiming = true;
    doAim();
  }

  if( shootButton.isUp && aiming === true && !onCooldown){
    doShoot();
    //
  }

  player.body.velocity.x = 0;

  game.physics.arcade.collide(player, platforms); // phaser line 82082
  game.physics.arcade.overlap(arrows, platforms, evArrowOverlap); // phaser line 82023
}

var arrow;

function doAim(){
  send('aim', _.extend({},playerData,{}));
}

function doShoot() {
  var fX = 800*(1+Math.random());
  var fY = 200*Math.random();

  aiming = false;
  onCooldown = true;
  setTimeout(()=>{
    onCooldown = false;
  }, ARROW_COOLDOWN);

  // TODO pack it into a function that creates a proper arrow in case it doesn exist
  arrow = arrows.getFirstExists(false);
  arrow.reset(player.x, player.y - player.height*0.20);
  // not working? - YES, open bug vs. https://github.com/photonstorm/phaser/blob/master/src/physics/arcade/Body.js#L662
  // arrow.body.reset();

  arrow.body.immovable = false;
  arrow.body.enable = true;

  // kinda abrupt, should make it better
  arrow.lifespan = 3*1000;
  arrow.body.velocity.x = fX;
  arrow.body.velocity.y = fY;

  send('shoot', _.extend({},playerData,{
    fX,
    fY,
  }));
}



function evArrowOverlap(arrow, something){
  console.log('--collision starts', arrow, something);
  arrow.body.immovable = true;
  arrow.body.enable = false;
  arrow.x += arrow.x *( arrow.body.velocity.x * 0.00015 );
  arrow.y += arrow.y *( arrow.body.velocity.y * 0.00015 );
  // arrow.y += arrow.y + arrow.body.velocity.y * 0.01;
  // TODO send event
}


function render () {

}
