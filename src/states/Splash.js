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
    this.load.image(
      "player",
      "assets/survivor/knife/idle/survivor-idle_knife_0.png"
    );
    this.load.image("tree00", "assets/trees/RE_00.png");
    this.load.image("ground", "assets/ground.png");
  }

  create() {
    this.state.start("Game");
  }
}
