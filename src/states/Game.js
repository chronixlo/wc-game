import Phaser from "phaser";
import { CLICKABLE_TEXT_COLOR } from "../config";
import GameState from "../GameState";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";
import Wall from "../sprites/Wall";
import Zombie from "../sprites/Zombie";
import { zeroPad } from "../utils";

const DAY_LENGTH = 120;
const HOUR_LENGTH = DAY_LENGTH / 24;
const MIN_LENGTH = HOUR_LENGTH / 60;

const NINETY_DEG = Math.PI / 2;

export default class Game extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.input.keyboard.onPressCallback = this.onKeyPress.bind(this);
  }

  update() {
    if (this.game.player.health <= 0) {
      this.endGame();
    }

    this.updateWallPlacer();
    this.handleInput();

    this.stoneText.setText(this.game.player.resources.stones);
    this.logText.setText(this.game.player.resources.logs);
    this.gemText.setText(this.game.player.resources.gems);
    this.ironText.setText(this.game.player.resources.iron);
    this.healthText.setText(this.game.player.health);

    this.updateDayCycle();
  }

  endGame() {
    GameState.gameEnd = this.game.time.totalElapsedSeconds();
    this.state.start("GameOver");
  }

  onKeyPress(k) {
    const key = k.toLowerCase();

    if (key === "q") {
      if (this.game.state.current !== "Outdoors") {
        return;
      }
      this.wallPlacer.visible = !this.wallPlacer.visible;
      this.player.clearTargets();
    } else if (key === "b") {
      this.inventory.visible = !this.inventory.visible;
    }
  }

  updateWallPlacer() {
    if (!this.wallPlacer || !this.wallPlacer.visible) {
      return;
    }
    const worldX = this.input.mousePointer.worldX;
    const worldY = this.input.mousePointer.worldY;

    const rotation = Phaser.Math.angleBetweenPoints(
      new Phaser.Point(this.player.body.x, this.player.body.y),
      new Phaser.Point(worldX, worldY)
    );

    this.wallPlacer.rotation = rotation + NINETY_DEG;
    this.wallPlacer.x = worldX;
    this.wallPlacer.y = worldY;
  }

  handleInput() {
    if (this.inventory.visible) {
      return;
    }
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
      if (this.wallPlacer && this.wallPlacer.visible) {
        this.placeWall();
        return;
      }

      if (this.beforeMove) {
        const stop = this.beforeMove(pointer);
        if (stop) {
          return;
        }
      }

      const stones = this.game.physics.p2.hitTest(
        new Phaser.Point(pointer.worldX, pointer.worldY),
        this.stones.children
      );

      if (stones.length) {
        this.player.harvestResource(stones[0].parent.sprite);
        return;
      }

      this.player.moveTo(
        new Phaser.Point(
          this.game.camera.x + pointer.clientX,
          this.game.camera.y + pointer.clientY
        )
      );
    }
  }

  placeWall() {
    this.wallPlacer.visible = false;

    if (this.game.player.resources.logs < 10) {
      return;
    }

    const w = {
      x: this.wallPlacer.x,
      y: this.wallPlacer.y,
      rotation: this.wallPlacer.rotation,
    };
    this.game.walls.push(w);

    const wall = new Wall({
      game: this.game,
      x: w.x,
      y: w.y,
      asset: "wall",
    });

    this.game.physics.p2.enable(wall);
    wall.body.setRectangleFromSprite(wall);
    wall.body.rotation = w.rotation;
    wall.body.static = true;
    this.walls.add(wall);

    this.game.player.resources.logs -= 10;
  }

  initDayCycle() {
    this.dayCycleOverlay = this.game.add.graphics(0, 0);
    this.dayCycleOverlay.fixedToCamera = true;
    this.dayCycleOverlay.beginFill(0x000000);
    this.dayCycleOverlay.drawRect(0, 0, this.game.width, this.game.height);
    this.dayCycleOverlay.endFill();
    this.dayCycleOverlay.alpha = this.game.cave ? 0.3 : 0;
  }

  updateDayCycle() {
    let elapsed =
      this.game.time.totalElapsedSeconds() -
      GameState.gameStart +
      HOUR_LENGTH * 12;
    const day = Math.floor(elapsed / DAY_LENGTH);
    elapsed -= day * DAY_LENGTH;
    const hour = Math.floor(elapsed / HOUR_LENGTH);
    elapsed -= hour * HOUR_LENGTH;
    this.dayText.setText(
      `Day ${day + 1}, ${zeroPad(hour)}:${zeroPad(
        Math.floor(elapsed / MIN_LENGTH)
      )}`
    );

    if (this.game.state.current === "Outdoors") {
      const hourDec = hour + elapsed / MIN_LENGTH / 60;
      const alpha = hourDec === 0 ? 1 : Math.abs((hourDec - 12) % 12) / 12;

      this.dayCycleOverlay.alpha = alpha * 0.5;
    }
  }

  addWallPlacer() {
    this.wallPlacer = new Wall({
      game: this.game,
      x: 2500,
      y: 2500,
      asset: "wall",
    });
    this.game.add.existing(this.wallPlacer);
    this.wallPlacer.visible = false;
  }

  addWalls() {
    this.walls = this.game.add.group();

    this.game.walls.forEach((w) => {
      const wall = new Wall({
        game: this.game,
        x: w.x,
        y: w.y,
        asset: "wall",
      });

      this.game.physics.p2.enable(wall);
      wall.body.setRectangleFromSprite(wall);
      wall.body.rotation = w.rotation;
      wall.body.static = true;
      this.walls.add(wall);
    });
    this.game.add.existing(this.walls);
  }

  addPlayer(coords) {
    this.player = new Player({
      game: this.game,
      x: coords ? coords.x : this.map.width / 2,
      y: coords ? coords.y : this.map.height / 2,
      asset: "player",
    });
    this.game.physics.p2.enable(this.player);
    this.game.camera.follow(this.player);
    this.game.camera.bounds = null;
    this.player.body.collideWorldBounds = false;
    this.player.body.setCircle(30);

    this.game.add.existing(this.player);
  }

  addZombies() {
    this.zombies = this.game.add.group();
  }

  spawnZombie() {
    const zombie = new Zombie({
      game: this.game,
      x: Phaser.Math.between(0, this.map.width),
      y: Phaser.Math.between(0, this.map.height),
      asset: "zombie",
      player: this.player,
    });
    this.game.physics.p2.enable(zombie);
    this.game.camera.bounds = null;
    zombie.body.setCircle(30);

    this.zombies.add(zombie);
  }

  addStones() {
    const state = this.game.state.current;
    let stones;

    if (state === "Outdoors") {
      stones = this.game.stones;
    } else if (state === "Cave") {
      stones = this.game.cave.stones;
    }

    this.stones = this.game.add.group();

    stones.forEach((stone) => {
      const s = new Stone({
        game: this.game,
        x: stone.x,
        y: stone.y,
        asset: stone.asset,
      });

      this.game.physics.p2.enable(s);
      s.body.setCircle(stone.body);
      s.body.static = true;
      this.stones.add(s);
    });
    this.game.add.existing(this.stones);
  }

  initUI() {
    this.dayText = this.game.add.text(8, 8, "", {
      font: "20px monospace",
      fill: "#ffffff",
    });
    this.dayText.fixedToCamera = true;

    const margin = 8;
    const inventoryIconSize = 64;
    const iconSize = 48;

    const inventoryIcon = new Phaser.Image(
      this.game,
      this.game.width - inventoryIconSize - margin,
      this.game.height - inventoryIconSize - margin,
      "inventory-icon"
    );
    inventoryIcon.width = inventoryIcon.height = inventoryIconSize;
    inventoryIcon.fixedToCamera = true;
    inventoryIcon.inputEnabled = true;
    this.game.add.existing(inventoryIcon);

    inventoryIcon.events.onInputDown.add(() => {
      this.inventory.visible = !this.inventory.visible;
    }, this);

    const inventoryWidth = 300;
    const inventoryHeight = 300;
    const inventoryX = this.game.width / 2 - inventoryWidth / 2;
    const inventoryY = this.game.height / 2 - inventoryHeight / 2;
    this.inventoryWidth = inventoryWidth;
    this.inventoryHeight = inventoryHeight;
    this.inventoryX = inventoryX;
    this.inventoryY = inventoryY;

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
    this.inventory.visible = false;

    // axe
    this.addInventoryItem(
      "axe-icon",
      "axe",
      iconSize,
      margin,
      () => {
        this.player.upgradeAxe();
        this.axeText.setText("Tier " + this.game.player.axeTier);
        this.axeUpgradeLogText.setText(this.game.player.axeTier * 10);
        this.axeUpgradeStoneText.setText(this.game.player.axeTier * 20);
      },
      0
    );

    // pickaxe
    this.addInventoryItem(
      "pickaxe-icon",
      "pickaxe",
      iconSize,
      margin,
      () => {
        this.player.upgradePickaxe();
        this.pickaxeText.setText("Tier " + this.game.player.pickaxeTier);
        this.pickaxeUpgradeLogText.setText(this.game.player.pickaxeTier * 10);
        this.pickaxeUpgradeStoneText.setText(this.game.player.pickaxeTier * 20);
      },
      1
    );

    const endGameText = new Phaser.Text(
      this.game,
      this.inventoryX + 5,
      this.inventoryY + inventoryHeight - 30,
      "End game",
      {
        font: "20px monospace",
        fill: CLICKABLE_TEXT_COLOR,
        align: "center",
      }
    );
    endGameText.inputEnabled = true;
    this.inventory.add(endGameText);
    endGameText.events.onInputDown.add(() => {
      this.endGame();
    }, this);

    // hud icons
    this.logText = this.addHudIcon("log-icon", iconSize, margin, 0);
    this.stoneText = this.addHudIcon("stone-icon", iconSize, margin, 1);
    this.ironText = this.addHudIcon("iron-icon", iconSize, margin, 2);
    this.gemText = this.addHudIcon("gem-icon", iconSize, margin, 3);

    this.healthText = this.addHudIcon("health-icon", iconSize, margin, 5);
  }

  addHudIcon(asset, size, margin, idx) {
    const nth = idx;
    const icon = new Phaser.Image(
      this.game,
      margin + size * nth + margin * nth,
      this.game.height - size - margin - 8,
      asset
    );
    icon.width = icon.height = size;
    icon.fixedToCamera = true;
    this.game.add.existing(icon);

    const text = new Phaser.Text(
      this.game,
      margin + size * nth + margin * nth,
      this.game.height - size - margin - 8,
      "0",
      {
        font: "20px monospace",
        fill: "#ffee44",
        align: "center",
      }
    );
    text.fixedToCamera = true;
    this.game.add.existing(text);

    return text;
  }

  addInventoryItem(asset, name, size, margin, onInputDown, idx) {
    const nth = idx + 1;
    const icon = new Phaser.Image(
      this.game,
      this.inventoryX + margin,
      this.inventoryY + size * idx * 2 + margin * nth,
      asset
    );
    icon.width = icon.height = size;
    this.inventory.add(icon);

    const text = new Phaser.Text(
      this.game,
      this.inventoryX + size + margin * 2 + 5,
      this.inventoryY + size * idx * 2 + margin * nth + 15,
      "Tier " + this.game.player[name + "Tier"],
      {
        font: "20px monospace",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(text);
    this[name + "Text"] = text;

    const upgradeText = new Phaser.Text(
      this.game,
      this.inventoryX + 5,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      "Upgrade",
      {
        font: "20px monospace",
        fill: CLICKABLE_TEXT_COLOR,
        align: "center",
      }
    );
    upgradeText.inputEnabled = true;
    this.inventory.add(upgradeText);
    upgradeText.events.onInputDown.add(onInputDown, this);
    this[name + "UpgradeText"] = upgradeText;

    const axeUpgradeLogIcon = new Phaser.Image(
      this.game,
      this.inventoryX + 100,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      "log-icon"
    );
    axeUpgradeLogIcon.width = axeUpgradeLogIcon.height = 20;
    this.inventory.add(axeUpgradeLogIcon);

    const axeUpgradeLogText = new Phaser.Text(
      this.game,
      this.inventoryX + 100 + 20 + 5,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      this.game.player[name + "Tier"] * 10,
      {
        font: "16px monospace",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(axeUpgradeLogText);
    this[name + "UpgradeLogText"] = axeUpgradeLogText;

    const axeUpgradeStoneIcon = new Phaser.Image(
      this.game,
      this.inventoryX + 100 + 20 + 40,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      "stone-icon"
    );
    axeUpgradeStoneIcon.width = axeUpgradeStoneIcon.height = 20;
    this.inventory.add(axeUpgradeStoneIcon);

    const axeUpgradeStoneText = new Phaser.Text(
      this.game,
      this.inventoryX + 100 + 20 + 40 + 20 + 5,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      this.game.player[name + "Tier"] * 20,
      {
        font: "16px monospace",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(axeUpgradeStoneText);
    this[name + "UpgradeStoneText"] = axeUpgradeStoneText;
  }
}
