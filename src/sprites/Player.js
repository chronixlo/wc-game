import Phaser from "phaser";
import Stone from "./Stone";
import Tree from "./Tree";

export default class Player extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.logs = 0;
    this.stones = 0;

    this.destination = null;
    this.targetRotation = null;

    this.targetResource = null;
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
    this.animations.add(
      "attack",
      Phaser.Animation.generateFrameNames(
        "survivor-meleeattack_knife_",
        0,
        14,
        ".png"
      )
    );
    this.animations.play("idle", 30, true);
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
      if (this.woodcuttingTarget instanceof Tree) {
        if (Math.random() < 0.01) {
          this.logs++;
          this.woodcuttingTarget.logs--;

          if (this.woodcuttingTarget.logs < 1) {
            this.woodcuttingTarget = null;
            this.animations.play("idle", 30, true);
          }
        }
      } else if (this.woodcuttingTarget instanceof Stone) {
        if (Math.random() < 0.01) {
          this.stones++;
        }
      }
    }

    if (this.targetResource) {
      const dist = Phaser.Math.distance(
        this.body.x,
        this.body.y,
        this.targetResource.x,
        this.targetResource.y
      );

      if (dist < 100) {
        this.woodcuttingTarget = this.targetResource;
        this.destination = null;
        this.targetResource = null;
        this.animations.play("attack", 30, true);
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

        this.animations.play("move", 30, true);
      } else {
        this.destination = null;

        this.animations.play("idle", 30, true);
      }
    }
  }
}
