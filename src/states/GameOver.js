import Phaser from "phaser";
import { CLICKABLE_TEXT_COLOR, HOUR_LENGTH } from "../config";
import GameState from "../GameState";
import { getElapsed } from "../utils";

export default class GameOver extends Phaser.State {
  init() {}

  create() {
    this.game.world.setBounds(0, 0, 300, 300);

    const text = this.add.text(
      this.game.width / 2,
      this.game.height / 2 - 50,
      "Game over",
      { font: "28px monospace", fill: "#dddddd", align: "center" }
    );
    text.anchor.setTo(0.5, 0.5);

    const seconds = GameState.gameEnd - GameState.gameStart + HOUR_LENGTH * 12;
    const elapsed = getElapsed(seconds);

    const elapsedText = this.add.text(
      this.game.width / 2,
      this.game.height / 2,
      "You survived till " + elapsed.string,
      { font: "20px monospace", fill: "#fff", align: "center" }
    );
    elapsedText.anchor.setTo(0.5, 0.5);

    const newGameText = this.add.text(
      this.game.width / 2,
      this.game.height / 2 + 50,
      "Start new game",
      { font: "20px monospace", fill: CLICKABLE_TEXT_COLOR, align: "center" }
    );
    newGameText.anchor.setTo(0.5, 0.5);
    newGameText.inputEnabled = true;

    newGameText.events.onInputDown.add(() => {
      GameState.init(this.game, true);
      this.state.start("Outdoors");
    }, this);
  }

  render() {}
}
