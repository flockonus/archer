'use strict';

var HOST = location.origin.replace(/^http/, 'ws');

var Phaser = window.Phaser;
var game;

var isGameInitialized = false;

var socket = window.io.connect(HOST, {
  transports: ['websocket']
});

var ACTIONS = ['spawn', 'aim', 'shoot'];

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
  if(!isGameInitialized){
    game = new Phaser.Game(400, 300, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });
    isGameInitialized = true;
  }
}










function preload() {

    game.stage.backgroundColor = '#85b5e1';

    game.load.baseURL = 'http://examples.phaser.io/assets/';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/phaser-dude.png');
    game.load.image('platform', 'sprites/platform.png');

}


var player;
var players;

var arrows;
var platforms;
// var cursors;
var shootButton;
// limit 3 arrows per second
var ARROW_COOLDOWN = 1000/3;

function create() {

  // do not pause when losing focus
  game.stage.disableVisibilityChange = true;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  player = game.add.sprite(0, 0, 'player');
  // making invisible things, a sure way to fuckup

  game.physics.arcade.enable(player);

  // player.enableBody = true;

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 500;
  // we'll show when it 'respawn'
  player.kill();

  players = game.add.physicsGroup();
  game.physics.arcade.enable(players);

  players.add(player);


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

  // listen + render other player actions
  ACTIONS.forEach((type)=> handleActionHandler(type));
}

function doSpawn(){
  playerData.x = Math.round(Math.random() * 140);
  playerData.y = game.world.height - 20*3;
  player.reset(playerData.x, playerData.y);
  player.name = playerData.pId;
  send('spawn', playerData);
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

  game.physics.arcade.collide(players, platforms); // phaser line 82082
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

  send('shoot', _.extend({}, playerData, {
    fX,
    fY,
  }));
}



function evArrowOverlap(arrow, something){
  // console.log('--collision starts', arrow, something);
  arrow.body.immovable = true;
  arrow.body.enable = false;
  arrow.x += arrow.x *( arrow.body.velocity.x * 0.00015 );
  arrow.y += arrow.y *( arrow.body.velocity.y * 0.00015 );
  // TODO send event
}


function render () {

}

function handleActionHandler(type){
  socket.on(type, function(data){
    if(data.pId === playerData.pId){
      return;
    }
    console.log('+',type, data);
    switch(type){
      case 'spawn':
        // why ist this position set working working?
        var other = game.add.sprite(data.x, data.y, 'player');
        other.alpha = 0.7;
        other.name = data.pId;
        game.physics.arcade.enable(other);
        other.body.gravity.y = 500;
        players.add(other);
        other.position.set(data.x, data.y);
        break;
      default:
        console.error('unhandled ACTION', type, data);
    }
  });
}


setInterval(function debugWhatever(){
  // console.log('=> ', player.position.x, player.position.y);
}, 250);
