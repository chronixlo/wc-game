import { SPRITE_HEIGHT, SPRITE_WIDTH } from "./sprites/CaveEntrance";
import { treeTypes, stoneTypes } from "./objectTypes";
import { loadStorage, saveStorage } from "./utils";

export const MAP_SIZE = 2000;

class GameState {
  init(game, startNew) {
    this.game = game;

    // load saved game if exists
    if (!startNew) {
      const savedState = loadStorage("state");
      if (savedState) {
        this.loadState(savedState);
        return;
      }
    }

    this.game.walls = [];
    this.game.zombies = [];
    this.initPlayer();
    this.generateCaves();
    this.generateStones();
    this.generateTrees();
    this.gameStart = this.game.time.totalElapsedSeconds();
    this.gameEnd = null;
  }

  saveState() {
    const state = {
      walls: this.game.walls,
      zombies: this.game.zombies,
      player: Object.assign(this.game.player, {
        x: this.game.playerSprite.x,
        y: this.game.playerSprite.y,
      }),
      caves: this.game.caves,
      stones: this.game.stones,
      trees: this.game.trees,
      gameStart: this.gameStart,
      gameEnd: this.gameEnd,
    };

    saveStorage("state", state);
  }

  loadState(state) {
    this.game.walls = state.walls;
    this.game.zombies = state.zombies;
    this.game.player = state.player;
    this.game.caves = state.caves;
    this.game.stones = state.stones;
    this.game.trees = state.trees;
    this.gameStart = state.gameStart;
    this.gameEnd = state.gameEnd;
  }

  initPlayer() {
    this.game.player = {
      resources: {
        logs: 40,
        stones: 0,
        iron: 0,
        gems: 0,
      },
      pickaxeTier: 1,
      axeTier: 1,
      health: 100,
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
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
          walls: [],
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

export default new GameState();
