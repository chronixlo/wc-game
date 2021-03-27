import Phaser from "phaser";
import Stone from "./Stone";
import Tree from "./Tree";

const HARVEST_INTERVAL = 0.2;
const BASE_WC_CHANCE = 0.2;
const BASE_MINING_CHANCE = 0.2;
const IRON_MULTIPLIER = 0.2;
const GEM_MULTIPLIER = 0.03;

export default class Player extends Phaser.Sprite {
  constructor({ game, x, y, asset }) {
    super(game, x, y, asset);

    this.destination = null;
    this.targetRotation = null;

    this.targetResource = null;
    this.destinationResource = null;

    this.nextHarvest = null;

    this.scale.setTo(0.3);
    this.anchor.setTo(0.5);

    this.animations.add(
      "move",
      Phaser.Animation.generateFrameNames("survivor-move_knife_", 0, 19, ".png")
    );
    this.animations.add(
      "idle",
      Phaser.Animation.generateFrameNames("survivor-idle_knife_", 0, 19, ".png")
    );
    this.animations.add(
      "attack",
      Phaser.Animation.generateFrameNames(
        "survivor-meleeattack_knife_",
        0,
        14,
        ".png"
      )
    );
    this.animations.play("idle", 30, true);
  }

  update() {
    this.body.setZeroVelocity();
    this.body.setZeroRotation();

    if (this.targetRotation != null) {
      this.body.rotation = Phaser.Math.rotateToAngle(
        this.body.rotation,
        this.targetRotation,
        0.1
      );

      if (this.targetRotation === this.body.rotation) {
        this.targetRotation = null;
      }
    }

    if (this.targetResource) {
      const elapsed = this.game.time.totalElapsedSeconds();

      if (elapsed < this.nextHarvest) {
        return;
      }

      const roll = Math.random();

      if (this.targetResource instanceof Tree) {
        const wcChance = BASE_WC_CHANCE + 0.08 * (this.game.player.axeTier - 1);
        if (roll < wcChance) {
          this.game.player.resources.logs++;
          this.targetResource.logs--;

          if (this.targetResource.logs < 1) {
            this.targetResource = null;
            this.animations.play("idle", 30, true);
          }
        }
      } else if (this.targetResource instanceof Stone) {
        const miningChance =
          BASE_MINING_CHANCE + 0.08 * (this.game.player.pickaxeTier - 1);
        if (roll < miningChance) {
          if (roll < miningChance * GEM_MULTIPLIER) {
            this.game.player.resources.gems++;
          }
          if (roll < miningChance * IRON_MULTIPLIER) {
            this.game.player.resources.iron++;
          }
          this.game.player.resources.stones++;
        }
      }

      this.nextHarvest = elapsed + HARVEST_INTERVAL;
      return;
    }

    if (this.destinationResource) {
      const dist = Phaser.Math.distance(
        this.body.x,
        this.body.y,
        this.destinationResource.x,
        this.destinationResource.y
      );

      if (dist < 100) {
        this.targetResource = this.destinationResource;
        this.nextHarvest =
          this.game.time.totalElapsedSeconds() + HARVEST_INTERVAL;
        this.destination = null;
        this.destinationResource = null;
        this.animations.play("attack", 30, true);
        return;
      }
    }

    if (!this.destination && !this.destinationResource) {
      return;
    }

    const destination = this.destinationResource
      ? this.destinationResource.position
      : this.destination;

    const dist = Phaser.Math.distance(
      this.body.x,
      this.body.y,
      destination.x,
      destination.y
    );

    const deltaX = destination.x - this.body.x;
    const deltaY = destination.y - this.body.y;

    const moveX = (deltaX * 200) / dist;
    const moveY = (deltaY * 200) / dist;

    if (dist > 10) {
      this.body.velocity.x = moveX;
      this.body.velocity.y = moveY;

      this.animations.play("move", 30, true);
    } else {
      this.destination = null;

      this.animations.play("idle", 30, true);
    }

    this.targetRotation = Phaser.Math.angleBetweenPoints(
      new Phaser.Point(this.body.x, this.body.y),
      destination
    );
  }

  harvestResource(resource) {
    if (resource === this.targetResource) {
      return;
    }
    this.targetRotation = Phaser.Math.angleBetweenPoints(
      new Phaser.Point(this.body.x, this.body.y),
      resource.position
    );
    this.targetResource = null;
    this.destinationResource = resource;
  }

  moveTo(point) {
    this.destinationResource = null;
    this.targetResource = null;
    this.destination = point;
  }

  upgradePickaxe() {
    if (
      this.game.player.resources.logs >= this.game.player.pickaxeTier * 10 &&
      this.game.player.resources.stones >= this.game.player.pickaxeTier * 20
    ) {
      this.game.player.resources.logs -= this.game.player.pickaxeTier * 10;
      this.game.player.resources.stones -= this.game.player.pickaxeTier * 20;
      this.game.player.pickaxeTier += 1;
    }
  }

  upgradeAxe() {
    if (
      this.game.player.resources.logs >= this.game.player.axeTier * 10 &&
      this.game.player.resources.stones >= this.game.player.axeTier * 20
    ) {
      this.game.player.resources.logs -= this.game.player.axeTier * 10;
      this.game.player.resources.stones -= this.game.player.axeTier * 20;
      this.game.player.axeTier += 1;
    }
  }
}
