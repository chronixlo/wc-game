import Phaser from "phaser";

export default class Zombie extends Phaser.Sprite {
  constructor({ game, x, y, asset, player }) {
    super(game, x, y, asset);

    this.player = player;
    this.scale.setTo(0.3);
    this.anchor.setTo(0.5);

    this.lastAttack = 0;

    this.animations.add(
      "move",
      Phaser.Animation.generateFrameNames("skeleton-move_", 0, 16, ".png", 0)
    );
    this.animations.add(
      "attack",
      Phaser.Animation.generateFrameNames("skeleton-attack_", 0, 8, ".png")
    );
    this.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("skeleton-idle_", 0, 16, ".png", 0)
    );
    this.animations.play("idle", 30, true);
  }

  update() {
    this.body.setZeroVelocity();
    this.body.setZeroRotation();

    const dist = Phaser.Math.distance(
      this.body.x,
      this.body.y,
      this.player.body.x,
      this.player.body.y
    );

    if (dist > 500) {
      this.animations.play("idle", 30, true);
      return;
    }

    const deltaX = this.player.body.x - this.body.x;
    const deltaY = this.player.body.y - this.body.y;

    const moveX = (deltaX * 100) / dist;
    const moveY = (deltaY * 100) / dist;

    if (dist > 80) {
      this.body.velocity.x = moveX;
      this.body.velocity.y = moveY;

      this.animations.play("move", 30, true);
    } else {
      const now = this.game.time.totalElapsedSeconds();
      if (this.lastAttack + 3 < now) {
        this.lastAttack = now;
        this.animations.play("attack", 30, false);
      }
    }

    const targetRotation = Phaser.Math.angleBetweenPoints(
      new Phaser.Point(this.body.x, this.body.y),
      new Phaser.Point(this.player.body.x, this.player.body.y)
    );

    this.body.rotation = Phaser.Math.rotateToAngle(
      this.body.rotation,
      targetRotation,
      0.1
    );
  }
}
