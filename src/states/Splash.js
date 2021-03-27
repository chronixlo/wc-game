import Phaser from "phaser";
import { centerGameObjects } from "../utils";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../sprites/CaveEntrance";

export const MAP_SIZE = 10000;

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
    this.load.image("iron-icon", "assets/iron.png");
    this.load.image("gem-icon", "assets/gem.png");
    this.load.image("log-icon", "assets/log.png");
    this.load.image("axe-icon", "assets/axe.png");
    this.load.image("pickaxe-icon", "assets/pickaxe.png");
    this.load.image("inventory-icon", "assets/inventory.png");
    this.load.image("tree00", "assets/trees/RE_00.png");
    this.load.image("stone01", "assets/stones/SM_001.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("ground-dark", "assets/ground-dark.png");
    this.load.image("cave-entrance", "assets/cave-entrance.png");
    this.load.atlasJSONHash(
      "player",
      "assets/player.png",
      "assets/player.json"
    );

    this.generateMap();
  }

  create() {
    this.state.start("Outdoors");
  }

  generateMap() {
    this.initPlayer();
    this.generateCaves();
    this.generateStones();
    this.generateTrees();
  }

  initPlayer() {
    this.game.player = {
      resources: {
        logs: 0,
        stones: 0,
        iron: 0,
        gems: 0,
      },
      pickaxeTier: 1,
      axeTier: 1,
    };
  }

  generateCaves() {
    this.game.caves = new Array(Math.round((MAP_SIZE * MAP_SIZE) / 1000000))
      .fill()
      .map(() => {
        const entranceX = Phaser.Math.between(
          SPRITE_WIDTH / 2,
          MAP_SIZE - SPRITE_WIDTH / 2
        );
        const entranceY = Phaser.Math.between(
          SPRITE_HEIGHT / 2,
          MAP_SIZE - SPRITE_HEIGHT / 2
        );

        const caveWidth = Phaser.Math.between(600, 2000);
        const caveHeight = Phaser.Math.between(600, 2000);

        const exitX = Phaser.Math.between(
          SPRITE_WIDTH / 2,
          caveWidth - SPRITE_WIDTH / 2
        );

        const exitY = Phaser.Math.between(
          SPRITE_HEIGHT / 2,
          caveHeight - SPRITE_HEIGHT / 2
        );

        const stones = new Array(Math.round((caveWidth * caveHeight) / 100000))
          .fill()
          .map(() => ({
            x: Phaser.Math.between(0, caveWidth),
            y: Phaser.Math.between(0, caveHeight),
            asset: "stone01",
            body: 30,
          }));

        return {
          stones,
          width: caveWidth,
          height: caveHeight,
          exit: {
            x: exitX,
            y: exitY,
          },
          entrance: {
            x: entranceX,
            y: entranceY,
          },
        };
      });
  }

  generateStones() {
    this.game.stones = new Array(Math.round((MAP_SIZE * MAP_SIZE) / 100000))
      .fill()
      .map(() => ({
        x: Phaser.Math.between(0, MAP_SIZE),
        y: Phaser.Math.between(0, MAP_SIZE),
        asset: "stone01",
        body: 30,
      }));
  }

  generateTrees() {
    this.game.trees = new Array(Math.round((MAP_SIZE * MAP_SIZE) / 100000))
      .fill()
      .map(() => ({
        x: Phaser.Math.between(0, MAP_SIZE),
        y: Phaser.Math.between(0, MAP_SIZE),
        asset: "tree00",
        body: 50,
        logs: Phaser.Math.between(50, 150),
      }));
  }
}
