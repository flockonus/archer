// it is a factory
class PlayerOthers {

  static init() {
    PlayerOthers.group = game.add.physicsGroup();
  }

  static doSpawn(data){
    var other = game.add.sprite(data.x, data.y, 'player');
    other.alpha = 0.7;
    other.name = data.pId;
    game.physics.arcade.enable(other);
    other.body.gravity.y = 500;
    PlayerOthers.group.add(other);
    other.position.set(data.x, data.y);
  }
}
