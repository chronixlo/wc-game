import Phaser from "phaser";

export const SPRITE_WIDTH = 64;
export const SPRITE_HEIGHT = 256;

export default class CaveEntrance extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.anchor.setTo(0.5);
  }

  static nextTo(coords) {
    return {
      x: coords.x + (SPRITE_WIDTH / 2 + 10) * (Math.random() < 0.5 ? -1 : 1),
      y: Phaser.Math.between(
        coords.y - SPRITE_HEIGHT / 2,
        coords.y + SPRITE_HEIGHT / 2
      ),
    };
  }
}
