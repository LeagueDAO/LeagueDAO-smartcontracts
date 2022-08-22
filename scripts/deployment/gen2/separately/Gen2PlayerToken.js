const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { verify, sleep, getAddressSaver } = require("./helpers");
const { parseUnits } = ethers.utils;
const path = require("path");

async function main() {
    const [owner, ...accounts] = await ethers.getSigners();

    const Gen2PlayerToken = (await ethers.getContractFactory("Gen2PlayerToken")).connect(owner);
    const gen2PlayerToken = await Gen2PlayerToken.deploy();
    await gen2PlayerToken.deployed();

    console.log("contract deployed at", gen2PlayerToken.address);
    await verify(gen2PlayerToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
