import { DAY_LENGTH, HOUR_LENGTH, MIN_LENGTH } from "./config";

let ID = 1;

export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5);
  });
};

export const zeroPad = (v) => (v < 10 ? "0" + v : v);

export const getUpgradeCost = (tier) => {
  return {
    logs: tier * 10,
    stones: tier * 20,
    iron: Math.floor(tier * 0.3) * 10,
    gems: Math.floor(tier * 0.2) * 5,
  };
};

export const getElapsed = (seconds) => {
  const day = Math.floor(seconds / DAY_LENGTH);
  seconds -= day * DAY_LENGTH;
  const hour = Math.floor(seconds / HOUR_LENGTH);
  seconds -= hour * HOUR_LENGTH;

  const hourDec = hour + seconds / MIN_LENGTH / 60;

  const string = `Day ${day + 1}, ${zeroPad(hour)}:${zeroPad(
    Math.floor(seconds / MIN_LENGTH)
  )}`;

  return {
    hourDec,
    string,
  };
};

export const getID = () => ID++;

export const saveStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
