import Phaser from "phaser";
import CaveEntrance from "../sprites/CaveEntrance";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";
import Game from "./Game";

export default class Cave extends Game {
  init() {}
  preload() {}

  create() {
    this.map = {
      width: this.game.cave.width,
      height: this.game.cave.height,
    };

    super.create();

    this.game.add.tileSprite(
      0,
      0,
      this.map.width,
      this.map.height,
      "ground-dark"
    );
    this.game.world.setBounds(0, 0, this.map.width, this.map.height);

    this.addExits();
    this.addStones();
    this.addWalls();
    this.addZombies();
    this.addPlayer(CaveEntrance.nextTo(this.game.cave.exit));
    this.addWallPlacer();

    this.initDayCycle();
    this.initUI();
  }

  update() {
    super.update();
    const idx = this.caveExits.children.findIndex(
      (entrance) =>
        entrance.inCamera &&
        Phaser.Rectangle.containsPoint(
          new Phaser.Rectangle(
            entrance.position.x - entrance.width / 2,
            entrance.position.y - entrance.height / 2,
            entrance.width,
            entrance.height
          ),
          this.player.position
        )
    );
    if (idx != -1) {
      this.exitCave();
      return;
    }
  }

  exitCave() {
    this.state.start("Outdoors");
  }

  addExits() {
    this.caveExits = this.game.add.group();
    const caveExit = new CaveEntrance({
      game: this.game,
      x: this.game.cave.exit.x,
      y: this.game.cave.exit.y,
      asset: "cave-entrance",
    });

    this.caveExits.add(caveExit);
    this.game.add.existing(this.caveExits);
  }
}
