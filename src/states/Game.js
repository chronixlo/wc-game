/* globals __DEV__ */
import Phaser from "phaser";
import Player from "../sprites/Player";
import Tree from "../sprites/Tree";

const MAP_SIZE = 10000;

export default class extends Phaser.State {
  init() {}
  preload() {}

  create() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.stage.disableVisibilityChange = true;

    this.player = new Player({
      game: this.game,
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
      asset: "player",
    });

    this.game.add.tileSprite(0, 0, MAP_SIZE, MAP_SIZE, "ground");

    this.game.world.setBounds(0, 0, MAP_SIZE, MAP_SIZE);
    this.game.physics.p2.enable(this.player);
    this.game.camera.follow(this.player);
    this.player.body.collideWorldBounds = false;
    this.player.body.setCircle(30);

    this.game.add.existing(this.player);

    this.trees = this.game.add.group();
    this.trees.inputEnableChildren = true;

    this.trees.onChildInputDown.add((sprite) => {
      this.player.targetTree = sprite;
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

    const style = {
      font: "32px Arial",
      fill: "#fff",
      boundsAlignH: "center",
      boundsAlignV: "middle",
    };

    this.text = this.game.add.text(100, 100, "woodcutting", style);
    this.text.anchor.setTo(0.5);
    this.text.fixedToCamera = true;
    this.text.setShadow(3, 3, "rgba(0,0,0,0.5)", 2);

    this.text.visible = false;
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

    this.text.visible = !!this.player.woodcuttingTarget;
  }

  render() {}
}
