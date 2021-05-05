import Phaser from "phaser";

export default class Wall extends Phaser.Sprite {
  constructor({ game, x, y, asset, id }) {
    super(game, x, y, asset);

    this.id = id;

    this.anchor.setTo(0.5);
  }
}
