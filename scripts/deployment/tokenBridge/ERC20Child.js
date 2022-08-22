const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { verify, sleep, getAddressSaver } = require("../../helpers/helpers");

const path = require("path");

async function main() {
    const [owner, ...accounts] = await ethers.getSigners();

    const LeagTokenSnapshot = (await ethers.getContractFactory("ChildERC20")).connect(owner);
    const ChildChainManager = "0xb5505a6d998549090530911180f38aC5130101c6";
    const leagTokenSnapshot = await LeagTokenSnapshot.deploy("ChildLeag", "CLEAG", ChildChainManager);
    await leagTokenSnapshot.deployed();

    console.log("contract deployed at", leagTokenSnapshot.address);
    await verify(leagTokenSnapshot.address, ["ChildLeag", "CLEAG", ChildChainManager]);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
