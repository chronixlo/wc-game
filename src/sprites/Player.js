import Phaser from "phaser";

export default class Player extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.logs = 0;

    this.destination = null;
    this.targetRotation = null;

    this.targetTree = null;
    this.woodcuttingTarget = null;

    this.scale.setTo(0.3);
    this.anchor.setTo(0.5);

    this.animations.add(
      "move",
      Phaser.Animation.generateFrameNames("survivor-move_knife_", 0, 19, ".png")
    );
    this.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("survivor-idle_knife_", 0, 19, ".png")
    );
    this.animations.play("idle", 60, true);
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

    if (this.woodcuttingTarget) {
      if (Math.random() < 0.01) {
        this.logs++;
        this.woodcuttingTarget.logs--;

        if (this.woodcuttingTarget.logs < 1) {
          this.woodcuttingTarget = null;
        }
      }
    }

    if (this.targetTree) {
      const dist = Phaser.Math.distance(
        this.body.x,
        this.body.y,
        this.targetTree.x,
        this.targetTree.y
      );

      if (dist < 100) {
        this.woodcuttingTarget = this.targetTree;
        this.destination = null;
        this.targetTree = null;
        this.animations.play("idle", 60, true);
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
