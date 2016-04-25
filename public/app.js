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

  // do not pause when losing focus
  game.stage.disableVisibilityChange = true;

  game.stage.backgroundColor = '#85b5e1';

  game.load.baseURL = 'http://examples.phaser.io/assets/';
  game.load.crossOrigin = 'anonymous';

  game.load.image('player', 'sprites/phaser-dude.png');
  game.load.image('platform', 'sprites/platform.png');

}


var player;
var others;

var arrows;
var platforms;
// var cursors;
var shootButton;
// limit 3 arrows per second


function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  player = new PlayerMe(0,0);
  PlayerOthers.init();
  // making invisible things, a sure way to fuckup

  // players = game.add.physicsGroup();
  // game.physics.arcade.enable(players);

  // players.add(player);


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

  player.doSpawn();

  // listen + render other player actions
  ACTIONS.forEach((type)=> handleActionHandler(type));
}

var aiming = false;
var onCooldown = false;

function update () {

  if( shootButton.isDown && aiming === false && !onCooldown){
    aiming = true;
    doAim();
  }

  if( shootButton.isUp && aiming === true && !onCooldown){
    player.doShoot();
    //
  }

  player.sprite.body.velocity.x = 0;

  game.physics.arcade.collide(player.sprite, platforms); // phaser line 82082
  game.physics.arcade.collide(PlayerOthers.group, platforms); // phaser line 82082
  game.physics.arcade.overlap(player.arrows, platforms, evArrowOverlap); // phaser line 82023
}

var arrow;

function doAim(){
  send('aim', _.extend({}, player.publicData, {}));
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
    // ignore our own spawn
    if(data.pId === player.pId){
      return;
    }
    console.log('+',type, data);
    switch(type){
      case 'spawn':
        // why ist this position set working working?
        PlayerOthers.doSpawn(data);
        break;
      default:
        console.error('unhandled ACTION', type, data);
    }
  });
}


setInterval(function debugWhatever(){
  // console.log('=> ', player.position.x, player.position.y);
}, 250);
