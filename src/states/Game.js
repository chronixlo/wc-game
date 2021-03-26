import Phaser from "phaser";
import Player from "../sprites/Player";
import Stone from "../sprites/Stone";

const DAY_LENGTH = 120;
const HOUR_LENGTH = DAY_LENGTH / 24;
const MIN_LENGTH = HOUR_LENGTH / 60;

export default class Game extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);
  }

  update() {
    this.handleInput();

    this.stoneText.setText(this.player.stones);
    this.logText.setText(this.player.logs);
    this.gemText.setText(this.player.gems);
    this.ironText.setText(this.player.iron);

    this.updateDayCycle();
  }

  handleInput() {
    if (this.inventory.visible) {
      return;
    }
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
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

  initDayCycle() {
    this.dayCycleOverlay = this.game.add.graphics(0, 0);
    this.dayCycleOverlay.fixedToCamera = true;
    this.dayCycleOverlay.beginFill(0x000000);
    this.dayCycleOverlay.drawRect(0, 0, this.game.width, this.game.height);
    this.dayCycleOverlay.endFill();
    this.dayCycleOverlay.alpha = this.game.cave ? 0.3 : 0;
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

    if (this.game.state.current === "Outdoors") {
      const hourDec = hour + elapsed / MIN_LENGTH / 60;
      const alpha = hourDec === 0 ? 1 : Math.abs((hourDec - 12) % 12) / 12;

      this.dayCycleOverlay.alpha = alpha * 0.5;
    }
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
    this.inventory.visible = false;

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
        font: "20px monospace",
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
        font: "20px monospace",
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
        font: "16px monospace",
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
        font: "16px monospace",
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
        font: "20px monospace",
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
        font: "20px monospace",
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
        font: "16px monospace",
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
        font: "16px monospace",
        fill: "#ffee44",
        align: "center",
      }
    );
    this.inventory.add(this.pickaxeUpgradeStoneText);

    // hud icons
    this.logText = this.addHudIcon("log-icon", iconSize, margin, 0);
    this.stoneText = this.addHudIcon("stone-icon", iconSize, margin, 1);
    this.ironText = this.addHudIcon("iron-icon", iconSize, margin, 2);
    this.gemText = this.addHudIcon("gem-icon", iconSize, margin, 3);
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
}

const zeroPad = (v) => (v < 10 ? "0" + v : v);
