import Phaser from "phaser";

export default class Tree extends Phaser.Sprite {
  constructor({ game, x, y, asset, logs }) {
    super(game, x, y, asset);

    this.logs = logs;

    this.anchor.setTo(0.5);
  }

  update() {
    if (this.logs < 1) {
      this.destroy();
    }
  }
}
