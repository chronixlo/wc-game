import "pixi";
import "p2";
import Phaser from "phaser";

import BootState from "./states/Boot";
import SplashState from "./states/Splash";
import OutdoorsState from "./states/Outdoors";
import CaveState from "./states/Cave";
import GameOverState from "./states/GameOver";

import config from "./config";

class Game extends Phaser.Game {
  constructor() {
    const docElement = document.documentElement;
    const width =
      docElement.clientWidth > config.gameWidth
        ? config.gameWidth
        : docElement.clientWidth;
    const height =
      docElement.clientHeight > config.gameHeight
        ? config.gameHeight
        : docElement.clientHeight;

    super(width, height, Phaser.CANVAS, "content", null);

    this.state.add("Boot", BootState, false);
    this.state.add("Splash", SplashState, false);
    this.state.add("Outdoors", OutdoorsState, false);
    this.state.add("Cave", CaveState, false);
    this.state.add("GameOver", GameOverState, false);

    // with Cordova with need to wait that the device is ready so we will call the Boot state in another file
    if (!window.cordova) {
      this.state.start("Boot");
    }
  }
}

window.game = new Game();

if (window.cordova) {
  var app = {
    initialize: function () {
      document.addEventListener(
        "deviceready",
        this.onDeviceReady.bind(this),
        false
      );
    },

    // deviceready Event Handler
    //
    onDeviceReady: function () {
      this.receivedEvent("deviceready");

      // When the device is ready, start Phaser Boot state.
      window.game.state.start("Boot");
    },

    receivedEvent: function (id) {
      console.log("Received Event: " + id);
    },
  };

  app.initialize();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration && registration.unregister());
    // navigator.serviceWorker
    //   .register("/service-worker.js")
    //   .then((registration) => {
    //     console.log("SW registered: ", registration);
    //   })
    //   .catch((registrationError) => {
    //     console.log("SW registration failed: ", registrationError);
    //   });
  });
}
