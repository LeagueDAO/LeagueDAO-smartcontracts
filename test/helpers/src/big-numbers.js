const { BigNumber } = require("ethers");
const { parseUnits } = require("ethers/lib/utils");

function toBN(val) {
    return BigNumber.from(val.toString());
}

function units(val, decimalsOrUnitName = 18) {
    return parseUnits(val.toString(), decimalsOrUnitName.toString());
}

module.exports = { toBN, units };
