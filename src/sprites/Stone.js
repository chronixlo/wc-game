import Phaser from "phaser";

export default class Stone extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.anchor.setTo(0.5);
  }
}
