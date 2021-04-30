import Phaser from "phaser";
import { centerGameObjects, zeroPad } from "../utils";
import GameState from "../GameState";

export default class extends Phaser.State {
  init() {}

  preload() {
    this.loaderBg = this.add.sprite(
      this.game.world.centerX,
      this.game.world.centerY,
      "loaderBg"
    );
    this.loaderBar = this.add.sprite(
      this.game.world.centerX,
      this.game.world.centerY,
      "loaderBar"
    );
    centerGameObjects([this.loaderBg, this.loaderBar]);

    this.load.setPreloadSprite(this.loaderBar);
    //
    // load your assets
    //
    this.load.image("health-icon", "assets/health.png");
    this.load.image("stone-icon", "assets/stone.png");
    this.load.image("iron-icon", "assets/iron.png");
    this.load.image("gem-icon", "assets/gem.png");
    this.load.image("log-icon", "assets/log.png");
    this.load.image("axe-icon", "assets/axe.png");
    this.load.image("pickaxe-icon", "assets/pickaxe.png");
    this.load.image("inventory-icon", "assets/inventory.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("ground-dark", "assets/ground-dark.png");
    this.load.image("cave-entrance", "assets/cave-entrance.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("wall-icon", "assets/wall-icon.png");

    this.load.atlasJSONHash(
      "player",
      "assets/player.png",
      "assets/player.json"
    );

    this.load.atlasJSONHash(
      "zombie",
      "assets/zombie.png",
      "assets/zombie.json"
    );

    for (let i = 0; i < 13; i++) {
      const id = zeroPad(i);
      this.load.image("tree" + id, `assets/trees/RE_${id}.png`);
    }
    for (let i = 1; i < 14; i++) {
      const id = zeroPad(i);
      this.load.image("stone" + id, `assets/stones/SM_0${id}.png`);
    }

    GameState.init(this.game);
  }

  create() {
    this.state.start("Outdoors");
  }
}
