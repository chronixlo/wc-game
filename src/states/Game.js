import Phaser from "phaser";
import { CLICKABLE_TEXT_COLOR, HOUR_LENGTH } from "../config";
import GameState from "../GameState";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";
import Wall from "../sprites/Wall";
import Zombie from "../sprites/Zombie";
import { getElapsed, getID, getUpgradeCost } from "../utils";

const BUILD_RANGE = 100;

const NINETY_DEG = Math.PI / 2;

export default class Game extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.skipInput = false;

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.input.keyboard.onPressCallback = this.onKeyPress.bind(this);

    this.input.onUp.add(() => {
      this.skipInput = false;

      if (this.wallPlaced) {
        this.placeWall();
      }
    }, this);
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
      this.wallPlacer.visible = !this.wallPlacer.visible;
      this.player.clearTargets();
    } else if (key === "b") {
      this.inventory.visible = !this.inventory.visible;
    }
  }

  toggleWallPlacer() {
    this.wallPlacer.visible = !this.wallPlacer.visible;
    this.player.clearTargets();

    this.skipInput = true;
  }

  updateWallPlacer() {
    if (!this.wallPlacer || !this.wallPlacer.visible) {
      return;
    }
    const worldX = this.input.activePointer.worldX;
    const worldY = this.input.activePointer.worldY;

    const rotation = Phaser.Math.angleBetweenPoints(
      new Phaser.Point(this.player.body.x, this.player.body.y),
      new Phaser.Point(worldX, worldY)
    );

    const dist = Phaser.Math.distance(
      this.player.body.x,
      this.player.body.y,
      worldX,
      worldY
    );

    if (dist > BUILD_RANGE) {
      const delta_x = worldX - this.player.body.x;
      const delta_y = worldY - this.player.body.y;
      const theta_radians = Math.atan2(delta_y, delta_x);

      this.wallPlacer.x =
        this.player.body.x + BUILD_RANGE * Math.cos(theta_radians);
      this.wallPlacer.y =
        this.player.body.y + BUILD_RANGE * Math.sin(theta_radians);
    } else {
      this.wallPlacer.x = worldX;
      this.wallPlacer.y = worldY;
    }

    this.wallPlacer.rotation = rotation + NINETY_DEG;
  }

  handleInput() {
    if (this.skipInput) {
      return;
    }
    if (this.inventory.visible) {
      return;
    }
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
      if (this.wallPlacer && this.wallPlacer.visible) {
        this.wallPlaced = true;
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

      const walls = this.game.physics.p2.hitTest(
        new Phaser.Point(pointer.worldX, pointer.worldY),
        this.walls.children
      );

      if (walls.length) {
        this.player.harvestResource(walls[0].parent.sprite);
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
    this.wallPlaced = false;
    this.wallPlacer.visible = false;

    if (this.game.player.resources.logs < 10) {
      return;
    }

    const id = getID();

    const w = {
      x: this.wallPlacer.x,
      y: this.wallPlacer.y,
      rotation: this.wallPlacer.rotation,
      id,
    };

    if (this.game.state.current === "Outdoors") {
      this.game.walls.push(w);
    } else {
      this.game.cave.walls.push(w);
    }

    const wall = new Wall({
      game: this.game,
      x: w.x,
      y: w.y,
      asset: "wall",
      id,
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
    const seconds =
      this.game.time.totalElapsedSeconds() -
      GameState.gameStart +
      HOUR_LENGTH * 12;

    const elapsed = getElapsed(seconds);

    this.dayText.setText(elapsed.string);

    if (this.game.state.current === "Outdoors") {
      const alpha =
        elapsed.hourDec === 0 ? 1 : Math.abs((elapsed.hourDec - 12) % 12) / 12;

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
    this.wallPlacer.tint = 0xffaaaa;
    this.game.add.existing(this.wallPlacer);
    this.wallPlacer.visible = false;
  }

  addWalls() {
    this.walls = this.game.add.group();

    let walls;

    if (this.game.state.current === "Outdoors") {
      walls = this.game.walls;
    } else {
      walls = this.game.cave.walls;
    }

    walls.forEach((w) => {
      const wall = new Wall({
        game: this.game,
        x: w.x,
        y: w.y,
        asset: "wall",
        id: w.id,
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

  toggleInventory() {
    this.inventory.visible = !this.inventory.visible;

    // skip inputs when closing
    if (!this.inventory.visible) {
      this.skipInput = true;
    }
  }

  initUI() {
    this.dayText = this.game.add.text(8, 8, "", {
      font: "20px monospace",
      fill: "#ffffff",
    });
    this.dayText.fixedToCamera = true;

    const margin = 8;
    const buttonSize = 64;
    const iconSize = 48;

    const inventoryIcon = new Phaser.Image(
      this.game,
      this.game.width - buttonSize - margin,
      this.game.height - buttonSize - margin,
      "inventory-icon"
    );
    inventoryIcon.width = inventoryIcon.height = buttonSize;
    inventoryIcon.fixedToCamera = true;
    inventoryIcon.inputEnabled = true;
    this.game.add.existing(inventoryIcon);

    inventoryIcon.events.onInputDown.add(() => {
      this.toggleInventory();
    }, this);

    const inventoryText = new Phaser.Text(
      this.game,
      this.game.width - 20 - margin,
      this.game.height - 20 - margin,
      "B",
      {
        font: "20px monospace",
        fill: "#ffee44",
      }
    );
    inventoryText.fixedToCamera = true;
    this.game.add.existing(inventoryText);

    const wallIcon = new Phaser.Image(
      this.game,
      this.game.width - buttonSize - margin,
      this.game.height - buttonSize - buttonSize - margin - margin * 2,
      "wall-icon"
    );
    wallIcon.width = wallIcon.height = buttonSize;
    wallIcon.fixedToCamera = true;
    wallIcon.inputEnabled = true;
    this.game.add.existing(wallIcon);

    wallIcon.events.onInputDown.add(() => {
      this.toggleWallPlacer();
    }, this);

    const wallText = new Phaser.Text(
      this.game,
      this.game.width - 20 - margin,
      this.game.height - 20 - buttonSize - margin - margin * 2,
      "Q",
      {
        font: "20px monospace",
        fill: "#ffee44",
      }
    );
    wallText.fixedToCamera = true;
    this.game.add.existing(wallText);

    const inventoryWidth = 400;
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
        const upgradeCost = getUpgradeCost(this.game.player.axeTier);
        this.axeText.setText("Tier " + this.game.player.axeTier);
        this.axeUpgradeLogsText.setText(upgradeCost.logs);
        this.axeUpgradeStonesText.setText(upgradeCost.stones);
        this.axeUpgradeIronText.setText(upgradeCost.iron);
        this.axeUpgradeGemsText.setText(upgradeCost.gems);
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
        const upgradeCost = getUpgradeCost(this.game.player.pickaxeTier);
        this.pickaxeText.setText("Tier " + this.game.player.pickaxeTier);
        this.pickaxeUpgradeLogsText.setText(upgradeCost.logs);
        this.pickaxeUpgradeStonesText.setText(upgradeCost.stones);
        this.pickaxeUpgradeIronText.setText(upgradeCost.iron);
        this.pickaxeUpgradeGemsText.setText(upgradeCost.gems);
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
        fill: "#ff0000",
      }
    );
    endGameText.inputEnabled = true;
    this.inventory.add(endGameText);
    endGameText.events.onInputDown.add(() => {
      this.endGame();
    }, this);

    const versionText = new Phaser.Text(
      this.game,
      this.inventoryX + this.inventoryWidth - 40,
      this.inventoryY + inventoryHeight - 10,
      "v" + GAME_VERSION,
      {
        font: "10px monospace",
        fill: "#fff",
      }
    );
    this.inventory.add(versionText);

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
    const upgradeCost = getUpgradeCost(this.game.player[name + "Tier"]);

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

    // logs
    this.addUpgradeCost(
      "log-icon",
      name,
      "Logs",
      20,
      this.inventoryX + 100,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      upgradeCost.logs
    );

    // stones
    this.addUpgradeCost(
      "stone-icon",
      name,
      "Stones",
      20,
      this.inventoryX + 100 + 60,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      upgradeCost.stones
    );

    // iron
    this.addUpgradeCost(
      "iron-icon",
      name,
      "Iron",
      20,
      this.inventoryX + 100 + 120,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      upgradeCost.iron
    );

    // gems
    this.addUpgradeCost(
      "gem-icon",
      name,
      "Gems",
      20,
      this.inventoryX + 100 + 180,
      this.inventoryY + size + size * idx * 2 + margin * nth + 15,
      upgradeCost.gems
    );
  }

  addUpgradeCost(asset, tool, resource, size, x, y, value) {
    const icon = new Phaser.Image(this.game, x, y, asset);
    icon.width = icon.height = size;
    this.inventory.add(icon);

    const text = new Phaser.Text(this.game, x + 20 + 5, y, value, {
      font: "16px monospace",
      fill: "#ffee44",
      align: "center",
    });
    this.inventory.add(text);
    this[tool + "Upgrade" + resource + "Text"] = text;
  }
}
