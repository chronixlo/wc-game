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

    this.player = new Player({
      game: this.game,
      x: MAP_SIZE / 2,
      y: MAP_SIZE / 2,
      asset: "player",
    });

    this.player.animations.add(
      "move",
      Phaser.Animation.generateFrameNames("survivor-move_knife_", 0, 19, ".png")
    );
    this.player.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("survivor-idle_knife_", 0, 19, ".png")
    );
    this.player.animations.play("idle", 60, true);

    game.add.tileSprite(0, 0, MAP_SIZE, MAP_SIZE, "ground");

    this.game.world.setBounds(0, 0, MAP_SIZE, MAP_SIZE);
    this.game.physics.p2.enable(this.player);
    this.game.camera.follow(this.player);
    this.player.body.collideWorldBounds = false;
    this.player.body.setCircle(30);

    this.game.add.existing(this.player);

    this.trees = this.game.add.group();
    this.trees.inputEnableChildren = true;

    this.trees.onChildInputDown.add((sprite) => {
      const dist = Phaser.Math.distance(
        this.player.body.x,
        this.player.body.y,
        sprite.x,
        sprite.y
      );

      if (dist < 100) {
        sprite.kill();
      }
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

  update() {
    const pointer = this.game.input.activePointer;
    if (pointer.isDown) {
      const destination = new Phaser.Point(
        this.game.camera.x + pointer.clientX,
        this.game.camera.y + pointer.clientY
      );

      this.player.destination = destination;

      this.player.targetRotation = Phaser.Math.angleBetweenPoints(
        new Phaser.Point(this.player.body.x, this.player.body.y),
        destination
      );
    }
  }

  render() {}
}
