import Phaser from "phaser";

export default class Player extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.destination = null;
    this.targetRotation = null;

    this.scale.setTo(0.3);
    this.anchor.setTo(0.5);
  }

  update() {
    this.body.setZeroVelocity();
    this.body.setZeroRotation();

    if (this.targetRotation != null) {
      this.body.rotation = Phaser.Math.rotateToAngle(
        this.body.rotation,
        this.targetRotation,
        0.1
      );

      if (this.targetRotation === this.body.rotation) {
        this.targetRotation = null;
      }
    }

    if (this.destination) {
      const dist = Phaser.Math.distance(
        this.body.x,
        this.body.y,
        this.destination.x,
        this.destination.y
      );

      const deltaX = this.destination.x - this.body.x;
      const deltaY = this.destination.y - this.body.y;

      const moveX = (deltaX * 200) / dist;
      const moveY = (deltaY * 200) / dist;

      if (dist > 10) {
        this.body.velocity.x = moveX;
        this.body.velocity.y = moveY;

        this.animations.play("move", 60, true);
      } else {
        this.destination = null;

        this.animations.play("idle", 60, true);
      }
    }
  }
}
