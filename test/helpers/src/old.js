const { ethers } = require("hardhat");

function expectEvent(receipt, contractAddress, eventName, args) {
    const event = receipt.events.find((e) => e.address == contractAddress && e.event == eventName);
    expect(event).not.to.equal(undefined);
    if (args) {
        expect(event.args, "No arguments in emitted event");
        for (const arg in args) {
            expect(event.args[arg]).to.equal(args[arg], `Argument ${arg} differs from expected`);
        }
    }
    return event ? event.args : null;
}

async function mineBlock(count = 1) {
    for (var i = 0; i < count; i++) {
        await ethers.provider.send("evm_mine", []);
    }
}

async function stopMining() {
    await ethers.provider.send("evm_setAutomine", [false]);
    await ethers.provider.send("evm_setIntervalMining", [1e9]);
}

async function startMining(mineNow = true) {
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_setIntervalMining", [0]);
    if (mineNow) {
        await ethers.provider.send("evm_mine", []);
    }
}

async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
}

module.exports = { expectEvent, mineBlock, stopMining, startMining, increaseTime };
