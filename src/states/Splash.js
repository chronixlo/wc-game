import Phaser from "phaser";
import { centerGameObjects, zeroPad } from "../utils";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../sprites/CaveEntrance";
import { treeTypes, stoneTypes } from "../objectTypes";

export const MAP_SIZE = 5000;

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
    this.load.image("ground", "assets/ground.png");
    this.load.image("ground-dark", "assets/ground-dark.png");
    this.load.image("cave-entrance", "assets/cave-entrance.png");

    this.load.atlasJSONHash(
      "player",
      "assets/player.png",
      "assets/player.json"
    );

    for (let i = 0; i < 13; i++) {
      const id = zeroPad(i);
      this.load.image("tree" + id, `assets/trees/RE_${id}.png`);
    }
    for (let i = 1; i < 14; i++) {
      const id = zeroPad(i);
      this.load.image("stone" + id, `assets/stones/SM_0${id}.png`);
    }

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

        const stones = new Array(Math.round((caveWidth * caveHeight) / 30000))
          .fill()
          .map(() => {
            const stoneType =
              stoneTypes[Phaser.Math.between(0, stoneTypes.length - 1)];

            return {
              x: Phaser.Math.between(0, caveWidth),
              y: Phaser.Math.between(0, caveHeight),
              asset: stoneType.asset,
              body: stoneType.body,
            };
          });

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
    this.game.stones = new Array(Math.round((MAP_SIZE * MAP_SIZE) / 50000))
      .fill()
      .map(() => {
        const stoneType =
          stoneTypes[Phaser.Math.between(0, stoneTypes.length - 1)];

        return {
          x: Phaser.Math.between(0, MAP_SIZE),
          y: Phaser.Math.between(0, MAP_SIZE),
          asset: stoneType.asset,
          body: stoneType.body,
        };
      });
  }

  generateTrees() {
    this.game.trees = new Array(Math.round((MAP_SIZE * MAP_SIZE) / 50000))
      .fill()
      .map(() => {
        const treeType =
          treeTypes[Phaser.Math.between(0, treeTypes.length - 1)];

        return {
          x: Phaser.Math.between(0, MAP_SIZE),
          y: Phaser.Math.between(0, MAP_SIZE),
          asset: treeType.asset,
          body: treeType.body,
          logs: Phaser.Math.between(treeType.body, treeType.body * 3),
        };
      });
  }
}
