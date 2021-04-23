import Phaser from "phaser";
import { CLICKABLE_TEXT_COLOR } from "../config";
import GameState from "../GameState";

export default class GameOver extends Phaser.State {
  init() {}

  create() {
    this.game.world.setBounds(0, 0, 300, 300);

    const text = this.add.text(
      this.game.width / 2,
      this.game.height / 2,
      "Game over",
      { font: "20px monospace", fill: "#dddddd", align: "center" }
    );
    text.anchor.setTo(0.5, 0.5);

    const newGameText = this.add.text(
      this.game.width / 2,
      this.game.height / 2 + 50,
      "Start new game",
      { font: "20px monospace", fill: CLICKABLE_TEXT_COLOR, align: "center" }
    );
    newGameText.anchor.setTo(0.5, 0.5);
    newGameText.inputEnabled = true;

    newGameText.events.onInputDown.add(() => {
      GameState.init(this.game);
      this.state.start("Outdoors");
    }, this);
  }

  render() {}
}
