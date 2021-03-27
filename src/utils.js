export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5);
  });
};

export const zeroPad = (v) => (v < 10 ? "0" + v : v);
