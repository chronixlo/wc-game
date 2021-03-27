import Phaser from "phaser";

export default class Zombie extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.scale.setTo(0.3);
    this.anchor.setTo(0.5);

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
}
