/* globals __DEV__ */
import Phaser from "phaser";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";
import Tree from "../sprites/Tree";

const MAP_SIZE = 10000;

const DAY_LENGTH = 120;
const HOUR_LENGTH = DAY_LENGTH / 24;
const MIN_LENGTH = HOUR_LENGTH / 60;

export default class Game extends Phaser.State {
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

    this.initUI();

    // tree spawner
    this.game.time.events.loop(
      Phaser.Timer.SECOND * 10,
      () => {
        const tree = new Tree({
          game: this.game,
          x: Phaser.Math.between(0, MAP_SIZE),
          y: Phaser.Math.between(0, MAP_SIZE),
          asset: "tree00",
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
    this.handleInput();

    this.stoneText.setText(this.player.stones);
    this.logText.setText(this.player.logs);

    this.updateDayCycle();
  }

  handleInput() {
    if (this.inventory.visible) {
      return;
    }
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
      const trees = this.game.physics.p2.hitTest(
        new Phaser.Point(pointer.worldX, pointer.worldY),
        this.trees.children
      );

      if (trees.length) {
        this.player.destinationResource = trees[0].parent.sprite;
        return;
      }

      const stones = this.game.physics.p2.hitTest(
        new Phaser.Point(pointer.worldX, pointer.worldY),
        this.stones.children
      );

      if (stones.length) {
        this.player.destinationResource = stones[0].parent.sprite;
        return;
      }

      const destination = new Phaser.Point(
        this.game.camera.x + pointer.clientX,
        this.game.camera.y + pointer.clientY
      );

      this.player.destinationResource = null;
      this.player.targetResource = null;
      this.player.destination = destination;
    }
  }

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

    this.graphics.alpha = alpha * 0.5;
  }

  addStones() {
    this.stones = this.game.add.group();

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

    new Array(1000).fill().forEach(() => {
      const tree = new Tree({
        game: this.game,
        x: Phaser.Math.between(0, MAP_SIZE),
        y: Phaser.Math.between(0, MAP_SIZE),
        asset: "tree00",
      });

      this.game.physics.p2.enable(tree);
      tree.body.setCircle(50);
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

  initUI() {
    this.dayText = this.game.add.text(0, 0, "", {
      font: "20px Arial",
      fill: "#ffffff",
    });
    this.dayText.fixedToCamera = true;

    const inventoryIcon = new Phaser.Image(
      this.game,
      this.game.width - 50,
      this.game.height - 50,
      "inventory-icon"
    );
    inventoryIcon.width = inventoryIcon.height = 50;
    inventoryIcon.fixedToCamera = true;
    inventoryIcon.inputEnabled = true;
    this.game.add.existing(inventoryIcon);

    inventoryIcon.events.onInputDown.add(() => {
      this.inventory.visible = !this.inventory.visible;
    }, this);

    const inventoryWidth = 200;
    const inventoryHeight = 200;
    const inventoryX = this.game.width / 2 - inventoryWidth / 2;
    const inventoryY = this.game.height / 2 - inventoryHeight / 2;

    this.inventory = this.game.add.group();
    this.inventory.fixedToCamera = true;
    this.inventoryBg = new Phaser.Graphics(this.game, 0, 0);
    this.inventoryBg.beginFill(0x000000);
    this.inventoryBg.drawRect(
      inventoryX,
      inventoryY,
      inventoryWidth,
      inventoryHeight
    );
    this.inventoryBg.endFill();
    this.inventoryBg.alpha = 0.5;
    this.inventory.add(this.inventoryBg);
    // this.inventory.visible = false;

    const axeIcon = new Phaser.Image(
      this.game,
      inventoryX,
      inventoryY,
      "axe-icon"
    );
    axeIcon.width = axeIcon.height = 50;
    this.inventory.add(axeIcon);

    this.axeText = new Phaser.Text(
      this.game,
      inventoryX + 50 + 5,
      inventoryY + 15,
      "Tier " + this.player.axeTier,
      {
        font: "20px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.axeText);

    this.axeUpgradeText = new Phaser.Text(
      this.game,
      inventoryX + 5,
      inventoryY + 50 + 15,
      "Upgrade",
      {
        font: "20px Arial",
        fill: "#44eeee",
        align: "center",
      }
    );
    this.axeUpgradeText.inputEnabled = true;
    this.inventory.add(this.axeUpgradeText);
    this.axeUpgradeText.events.onInputDown.add(() => {
      this.player.upgradeAxe();
      this.axeText.setText("Tier " + this.player.axeTier);
      this.axeUpgradeLogText.setText(this.player.axeTier * 10);
      this.axeUpgradeStoneText.setText(this.player.axeTier * 20);
    }, this);

    const axeUpgradeLogIcon = new Phaser.Image(
      this.game,
      inventoryX + 90 + 5,
      inventoryY + 50 + 15,
      "log-icon"
    );
    axeUpgradeLogIcon.width = axeUpgradeLogIcon.height = 20;
    this.inventory.add(axeUpgradeLogIcon);

    this.axeUpgradeLogText = new Phaser.Text(
      this.game,
      inventoryX + 90 + 20 + 5,
      inventoryY + 50 + 15,
      this.player.axeTier * 10,
      {
        font: "16px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.axeUpgradeLogText);

    const axeUpgradeStoneIcon = new Phaser.Image(
      this.game,
      inventoryX + 90 + 50 + 5,
      inventoryY + 50 + 15,
      "stone-icon"
    );
    axeUpgradeStoneIcon.width = axeUpgradeStoneIcon.height = 20;
    this.inventory.add(axeUpgradeStoneIcon);

    this.axeUpgradeStoneText = new Phaser.Text(
      this.game,
      inventoryX + 90 + 50 + 20 + 5,
      inventoryY + 50 + 15,
      this.player.axeTier * 20,
      {
        font: "16px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.axeUpgradeStoneText);

    const pickaxeIcon = new Phaser.Image(
      this.game,
      inventoryX,
      inventoryY + 100,
      "pickaxe-icon"
    );
    pickaxeIcon.width = pickaxeIcon.height = 50;
    this.inventory.add(pickaxeIcon);

    this.pickaxeText = new Phaser.Text(
      this.game,
      inventoryX + 50 + 5,
      inventoryY + 100 + 15,
      "Tier " + this.player.pickaxeTier,
      {
        font: "20px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.pickaxeText);

    this.pickaxeUpgradeText = new Phaser.Text(
      this.game,
      inventoryX + 5,
      inventoryY + 150 + 15,
      "Upgrade",
      {
        font: "20px Arial",
        fill: "#44eeee",
        align: "center",
      }
    );
    this.pickaxeUpgradeText.inputEnabled = true;
    this.inventory.add(this.pickaxeUpgradeText);
    this.pickaxeUpgradeText.events.onInputDown.add(() => {
      this.player.upgradePickaxe();
      this.pickaxeText.setText("Tier " + this.player.pickaxeTier);
      this.pickaxeUpgradeLogText.setText(this.player.pickaxeTier * 10);
      this.pickaxeUpgradeStoneText.setText(this.player.pickaxeTier * 20);
    }, this);

    const pickaxeUpgradeLogIcon = new Phaser.Image(
      this.game,
      inventoryX + 90 + 5,
      inventoryY + 100 + 50 + 15,
      "log-icon"
    );
    pickaxeUpgradeLogIcon.width = pickaxeUpgradeLogIcon.height = 20;
    this.inventory.add(pickaxeUpgradeLogIcon);

    this.pickaxeUpgradeLogText = new Phaser.Text(
      this.game,
      inventoryX + 90 + 20 + 5,
      inventoryY + 100 + 50 + 15,
      this.player.pickaxeTier * 10,
      {
        font: "16px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.pickaxeUpgradeLogText);

    const pickaxeUpgradeStoneIcon = new Phaser.Image(
      this.game,
      inventoryX + 90 + 50 + 5,
      inventoryY + 100 + 50 + 15,
      "stone-icon"
    );
    pickaxeUpgradeStoneIcon.width = pickaxeUpgradeStoneIcon.height = 20;
    this.inventory.add(pickaxeUpgradeStoneIcon);

    this.pickaxeUpgradeStoneText = new Phaser.Text(
      this.game,
      inventoryX + 90 + 50 + 20 + 5,
      inventoryY + 100 + 50 + 15,
      this.player.pickaxeTier * 20,
      {
        font: "16px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.pickaxeUpgradeStoneText);

    const logIcon = new Phaser.Image(
      this.game,
      0,
      this.game.height - 50,
      "log-icon"
    );
    logIcon.width = logIcon.height = 50;
    logIcon.fixedToCamera = true;
    this.game.add.existing(logIcon);

    this.logText = new Phaser.Text(
      this.game,
      50 + 5,
      this.game.height - 50 + 15,
      "0",
      {
        font: "20px Arial",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.logText.fixedToCamera = true;
    this.game.add.existing(this.logText);

    const stoneIcon = new Phaser.Image(
      this.game,
      0,
      this.game.height - 50 - 50,
      "stone-icon"
    );
    stoneIcon.width = stoneIcon.height = 50;
    stoneIcon.fixedToCamera = true;
    this.game.add.existing(stoneIcon);

    this.stoneText = new Phaser.Text(
      this.game,
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
    this.game.add.existing(this.stoneText);
  }
}

const zeroPad = (v) => (v < 10 ? "0" + v : v);
