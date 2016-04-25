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
  }

  spawn() {
    this.sprite.reset(Math.round(Math.random() * 140), game.world.height - 20*3);
  }

  get publicData() {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      pId: this.pId,
    }
  }
}
