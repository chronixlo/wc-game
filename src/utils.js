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
