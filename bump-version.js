var fs = require("fs");

const version = parseInt(fs.readFileSync("./GAME_VERSION").toString(), 10);

fs.writeFileSync("./GAME_VERSION", String(version + 1));
