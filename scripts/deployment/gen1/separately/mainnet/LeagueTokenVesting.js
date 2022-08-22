const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // check that .env is set correctly

    // Deploying
    const NomoTokenVesting = await ethers.getContractFactory("LeagueTokenVesting");
    const startTime = 1634479200 - Math.floor(Date.now() / 1000) - 120;
    const nomoTokenVesting = await upgrades.deployProxy(NomoTokenVesting, [
        "0x7b39917f9562C8Bc83c7a6c2950FF571375D505D",
        startTime
    ]);

    await nomoTokenVesting.deployed();
    console.log("LeagueTokenVesting deployed to:", nomoTokenVesting.address);

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(60000);

        await hre.run("verify:verify", {
            address: nomoTokenVesting.address,
            constructorArguments: [],
            contract: "contracts/LeagueTokenVesting.sol:LeagueTokenVesting"
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
