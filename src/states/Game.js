/* globals __DEV__ */
import Phaser from "phaser";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";
import Tree from "../sprites/Tree";

const MAP_SIZE = 10000;

const DAY_LENGTH = 120;
const HOUR_LENGTH = DAY_LENGTH / 24;
const MIN_LENGTH = HOUR_LENGTH / 60;

export default class extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.stage.disableVisibilityChange = true;

    this.game.add.tileSprite(0, 0, MAP_SIZE, MAP_SIZE, "ground");
    this.game.world.setBounds(0, 0, MAP_SIZE, MAP_SIZE);

    this.addStones();
    this.addPlayer();
    this.addTrees();

    this.graphics = this.game.add.graphics(0, 0);
    this.graphics.fixedToCamera = true;
    this.graphics.beginFill(0x000000);
    this.graphics.drawRect(0, 0, this.game.width, this.game.height);
    this.graphics.endFill();
    this.graphics.alpha = 0;

    this.dayText = this.game.add.text(0, 0, "", {
      font: "20px Arial",
      fill: "#ffffff",
    });
    this.dayText.fixedToCamera = true;

    const logIcon = new Phaser.Image(
      this.game,
      0,
      this.game.height - 50,
      "log-icon"
    );
    logIcon.width = logIcon.height = 50;
    logIcon.fixedToCamera = true;
    this.game.add.existing(logIcon);

    this.logText = this.game.add.text(50 + 5, this.game.height - 50 + 15, "0", {
      font: "20px Arial",
      fill: "#ffee44",
      align: "center",
    });
    this.logText.fixedToCamera = true;

    const stoneIcon = new Phaser.Image(
      this.game,
      0,
      this.game.height - 50 - 50,
      "stone-icon"
    );
    stoneIcon.width = stoneIcon.height = 50;
    stoneIcon.fixedToCamera = true;
    this.game.add.existing(stoneIcon);

    this.stoneText = this.game.add.text(
      50 + 5,
      this.game.height - 50 - 50 + 15,
      "0",
      {
        font: "20px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.stoneText.fixedToCamera = true;
  }

  update() {
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
      const destination = new Phaser.Point(
        this.game.camera.x + pointer.clientX,
        this.game.camera.y + pointer.clientY
      );

      this.player.destination = destination;
      this.player.woodcuttingTarget = null;

      this.player.targetRotation = Phaser.Math.angleBetweenPoints(
        new Phaser.Point(this.player.body.x, this.player.body.y),
        destination
      );
    }

    this.stoneText.setText(this.player.stones);
    this.logText.setText(this.player.logs);

    this.updateDayCycle();
  }

  render() {}

  updateDayCycle() {
    let elapsed = this.game.time.totalElapsedSeconds() + HOUR_LENGTH * 12;
    const day = Math.floor(elapsed / DAY_LENGTH);
    elapsed -= day * DAY_LENGTH;
    const hour = Math.floor(elapsed / HOUR_LENGTH);
    elapsed -= hour * HOUR_LENGTH;
    this.dayText.setText(
      `Day ${day + 1}, ${zeroPad(hour)}:${zeroPad(
        Math.floor(elapsed / MIN_LENGTH)
      )}`
    );
    const hourDec = hour + elapsed / MIN_LENGTH / 60;

    const alpha = hourDec === 0 ? 1 : Math.abs((hourDec - 12) % 12) / 12;

    this.graphics.alpha = alpha * 0.8;
  }

  addStones() {
    this.stones = this.game.add.group();
    this.stones.inputEnableChildren = true;

    this.stones.onChildInputDown.add((sprite) => {
      this.player.targetResource = sprite;
    });

    new Array(1000).fill().forEach(() => {
      const stone = new Stone({
        game: this.game,
        x: Phaser.Math.between(0, MAP_SIZE),
        y: Phaser.Math.between(0, MAP_SIZE),
        asset: "stone01",
      });

      this.game.physics.p2.enable(stone);
      stone.body.setCircle(30);
      stone.body.static = true;
      this.stones.add(stone);
    });
    this.game.add.existing(this.stones);
  }

  addTrees() {
    this.trees = this.game.add.group();
    this.trees.inputEnableChildren = true;

    this.trees.onChildInputDown.add((sprite) => {
      this.player.targetResource = sprite;
    });

    new Array(1000).fill().forEach(() => {
      const tree = new Tree({
        game: this.game,
        x: Phaser.Math.between(0, MAP_SIZE),
        y: Phaser.Math.between(0, MAP_SIZE),
        asset: "tree00",
      });

      this.game.physics.p2.enable(tree);
      tree.body.setCircle(30);
      tree.body.static = true;
      this.trees.add(tree);
    });
    this.game.add.existing(this.trees);
  }

  addPlayer() {
    this.player = new Player({
      game: this.game,
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
      asset: "player",
    });
    this.game.physics.p2.enable(this.player);
    this.game.camera.follow(this.player);
    this.player.body.collideWorldBounds = false;
    this.player.body.setCircle(30);

    this.game.add.existing(this.player);
  }
}

const zeroPad = (v) => (v < 10 ? "0" + v : v);
