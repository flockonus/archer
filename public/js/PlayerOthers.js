// it is a factory
class PlayerOthers {

  static init() {
    this.group = game.add.physicsGroup();

    // player has control of it's arrows
    this.arrows = game.add.physicsGroup();
    game.physics.arcade.enable(this.arrows);
    // what if we run out?
    this.arrows.createMultiple(200, 'arrow');
    this.arrows.setAll('body.gravity.y', 300);
    this.arrows.setAll('body.collideWorldBounds', true);
  }

  static doSpawn(data){
    var other = game.add.sprite(data.x, data.y, 'player');
    other.alpha = 0.7;
    other.name = data.pId;
    game.physics.arcade.enable(other);
    other.body.gravity.y = 500;
    this.group.add(other);
    other.position.set(data.x, data.y);
  }

  static doShoot(data) {
    // var fX = 800*(1+Math.random());
    // var fY = 200*Math.random();

    var arrow = this.arrows.getFirstDead();
    arrow.reset(data.x, data.y);

    arrow.body.immovable = false;
    arrow.body.enable = true;

    // kinda abrupt, should make it better
    // not working! arrow.lifespan = 3*1000;
    setTimeout(()=> arrow.kill(), 3*1000);
    arrow.body.velocity.x = data.fX;
    arrow.body.velocity.y = data.fY;
  }

  static doRemove(pId) {
    var player;
    this.group.forEach(function(child, index, children) {
      if (child.name == pId) {
        player = child;
      }
    });
    game.add.tween(player).to( { alpha: 0 }, 2000, Phaser.Easing.Exponential.InOut, true, 0);
    setTimeout(()=> player.destroy(), 2000);
  }
}
