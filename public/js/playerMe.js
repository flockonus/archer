const ARROW_COOLDOWN = 1000/3;

// should be just one
class PlayerMe {
  constructor(x,y) {
    // maybe? http://examples.phaser.io/_site/view_full.html?d=sprites&f=extending+sprite+demo+1.js&t=extending%20sprite%20demo%201
    this.name = this.pId = Math.random();
    this.sprite = game.add.sprite(x, y, 'player');
    this.body = this.sprite.body;
    game.physics.arcade.enable(this.sprite);
    // player.enableBody = true;
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.gravity.y = 500;
    // we'll show when it 'respawn'
    this.sprite.kill();

    // player has control of it's arrows
    this.arrows = game.add.physicsGroup();
    game.physics.arcade.enable(this.arrows);
    // what if we run out?
    this.arrows.createMultiple(30, 'arrow');
    this.arrows.setAll('body.gravity.y', 300);
    this.arrows.setAll('body.collideWorldBounds', true);
  }

  get publicData() {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      pId: this.pId,
    }
  }

  doSpawn() {
    this.sprite.reset(Math.round(Math.random() * 140), game.world.height - 20*3);
    send('spawn', this.publicData);
  }

  doShoot() {
    var fX = 800*(1+Math.random());
    var fY = 200*Math.random();

    aiming = false;
    onCooldown = true;
    setTimeout(()=>{
      onCooldown = false;
    }, ARROW_COOLDOWN);

    // TODO pack it into a function that creates a proper arrow in case it doesn exist
    var arrow = this.arrows.getFirstDead();
    arrow.reset(player.sprite.x, player.sprite.y - player.sprite.height*0.20);
    // not working? - YES, open bug vs. https://github.com/photonstorm/phaser/blob/master/src/physics/arcade/Body.js#L662
    // arrow.body.reset();

    arrow.body.immovable = false;
    arrow.body.enable = true;

    // kinda abrupt, should make it better
    arrow.lifespan = 3*1000;
    arrow.body.velocity.x = fX;
    arrow.body.velocity.y = fY;

    send('shoot', _.extend({}, this.publicData, {
      fX,
      fY,
    }));
  }
}
