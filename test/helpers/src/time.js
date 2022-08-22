const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const MAX_SAFE_INT = 0x1fffffffffffff; // 2 ** 53 - 1 == 9007199254740991
const MAX_INT = MAX_SAFE_INT - 1;
function isGreaterThanMaxInt(val) {
    return BigNumber.from(val.toString()).gt(MAX_INT);
}

// Returns the time of the last mined block in seconds
async function latest() {
    return (await ethers.provider.getBlock("latest")).timestamp;
}

async function latestBlock() {
    return (await ethers.provider.getBlock("latest")).number;
}

// Increases time by the passed duration in seconds
async function increase(seconds) {
    if (isGreaterThanMaxInt(seconds)) throw Error("Cannot increase time by a value which is greater than 2 ** 53 - 2");
    seconds = +seconds;

    if (seconds < 0) throw Error(`Cannot increase time by a negative amount (${seconds})`);
    await ethers.provider.send("evm_increaseTime", [seconds]);
}

async function increaseTo(target) {
    if (isGreaterThanMaxInt(target)) throw Error("Cannot increase time by a value which is greater than 2 ** 53 - 2");
    target = +target;

    const now = await latest();
    if (target < now) throw Error(`Cannot increase current time (${now}) to a moment in the past (${target})`);
    await ethers.provider.send("evm_setNextBlockTimestamp", [target]);
}

async function advanceBlock() {
    return await ethers.provider.send("evm_mine", []);
}

// Advance the block to the passed height
async function advanceBlockTo(target) {
    if (isGreaterThanMaxInt(target)) throw Error("Cannot increase time by a value which is greater than 2 ** 53 - 2");
    target = +target;

    const currentBlock = await latestBlock();
    if (target < currentBlock) throw Error(`Target block #(${target}) is lower than current block #(${currentBlock})`);

    const number = target - currentBlock;

    const start = Date.now();
    await advanceBlock();
    if ((Date.now() - start) * number >= 5000)
        console.log("[test-helpers] (WARN) advanceBlockTo: Advancing many blocks is causing this test to be slow.");

    for (let i = 1; i < number; ++i) await advanceBlock();
}

function toNum(val) {
    if (isGreaterThanMaxInt(val)) throw Error("A value is greater than 2 ** 53 - 2");
    return +val;
}

const duration = {
    seconds: (val) => toNum(val),
    minutes: (val) => toNum(val) * duration.seconds(60),
    hours: (val) => toNum(val) * duration.minutes(60),
    days: (val) => toNum(val) * duration.hours(24),
    weeks: (val) => toNum(val) * duration.days(7),
    years: (val) => toNum(val) * duration.days(365)
};

module.exports = {
    latest,
    latestBlock,
    increase,
    increaseTo,
    advanceBlock,
    advanceBlockTo,
    duration
};
