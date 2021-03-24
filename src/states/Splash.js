import Phaser from "phaser";
import { centerGameObjects } from "../utils";

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
    this.load.image("stone-icon", "assets/stone.png");
    this.load.image("log-icon", "assets/log.png");
    this.load.image("tree00", "assets/trees/RE_00.png");
    this.load.image("stone01", "assets/stones/SM_001.png");
    this.load.image("ground", "assets/ground.png");
    this.load.atlasJSONHash(
      "player",
      "assets/player.png",
      "assets/player.json"
    );
  }

  create() {
    this.state.start("Game");
  }
}
