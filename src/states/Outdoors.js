import Phaser from "phaser";
import CaveEntrance from "../sprites/CaveEntrance";
import Tree from "../sprites/Tree";
import Game from "./Game";
import { MAP_SIZE } from "../GameState";

export default class Outdoors extends Game {
  init() {}
  preload() {}

  create() {
    this.map = {
      width: MAP_SIZE,
      height: MAP_SIZE,
    };

    super.create();

    this.game.add.tileSprite(0, 0, this.map.width, this.map.height, "ground");
    this.game.world.setBounds(0, 0, this.map.width, this.map.height);

    this.addCaves();
    this.addStones();
    this.addWalls();
    this.addZombies();
    this.addPlayer(
      this.game.cave ? CaveEntrance.nextTo(this.game.cave.entrance) : null
    );
    this.addTrees();
    this.addWallPlacer();

    this.game.cave = null;

    this.initDayCycle();
    this.initUI();

    this.spawnZombie();

    // tree spawner
    this.game.time.events.loop(
      Phaser.Timer.SECOND * 60,
      () => {
        const tree = new Tree({
          game: this.game,
          x: Phaser.Math.between(0, this.map.width),
          y: Phaser.Math.between(0, this.map.height),
          asset: "tree00",
          logs: Phaser.Math.between(50, 150),
        });

        this.game.physics.p2.enable(tree);
        tree.body.setCircle(50);
        tree.body.static = true;
        this.trees.add(tree);
      },
      this
    );
  }

  update() {
    super.update();
    const idx = this.caveEntrances.children.findIndex(
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
      this.enterCave(idx);
      return;
    }
  }

  enterCave(idx) {
    this.game.cave = this.game.caves[idx];
    this.state.start("Cave");
  }

  beforeMove(pointer) {
    const trees = this.game.physics.p2.hitTest(
      new Phaser.Point(pointer.worldX, pointer.worldY),
      this.trees.children
    );

    if (trees.length) {
      this.player.harvestResource(trees[0].parent.sprite);
      return true;
    }
  }

  addCaves() {
    this.caveEntrances = this.game.add.group();

    this.game.caves.forEach((c) => {
      const caveEntrance = new CaveEntrance({
        game: this.game,
        x: c.entrance.x,
        y: c.entrance.y,
        asset: "cave-entrance",
      });

      this.caveEntrances.add(caveEntrance);
    });
    this.game.add.existing(this.caveEntrances);
  }

  addTrees() {
    this.trees = this.game.add.group();

    this.game.trees.forEach((tree) => {
      const t = new Tree({
        game: this.game,
        x: tree.x,
        y: tree.y,
        asset: tree.asset,
        logs: tree.logs,
      });

      this.game.physics.p2.enable(t);
      t.body.setCircle(tree.body);
      t.body.static = true;
      this.trees.add(t);
    });
    this.game.add.existing(this.trees);
  }
}
