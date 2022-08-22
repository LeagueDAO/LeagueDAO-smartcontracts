const { toBN, units } = require("./src/big-numbers");
const { ADDR_FIRST, URL_EXAMPLE } = require("./src/constants");
const { snapshot } = require("./src/snapshots");
const { getRandomInt, shuffleArray } = require("./src/random");
const { stopMining, startMining } = require("./src/old");

module.exports = {
    // Big numbers
    toBN,
    units,
    // Constants
    ADDR_FIRST,
    URL_EXAMPLE,
    // Time
    get time() {
        return require("./src/time");
    },
    // Snapshots
    snapshot,
    // Old utilities
    stopMining,
    startMining,
    // random
    getRandomInt,
    shuffleArray
};
