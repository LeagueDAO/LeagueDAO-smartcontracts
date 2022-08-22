const { ethers, upgrades, hre } = require("hardhat");
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // check that .env is set correctly
    assert(
        process.env.START_AFTER_TIMESTAMP && process.env.NOMO_TOKEN_ADDRESS,
        "Set START_AFTER_TIMESTAMP value and NOMO_TOKEN_ADDRESS address in .env to deploy NomoTokenVesting"
    );
    // Deploying
    const NomoTokenVesting = await ethers.getContractFactory("NomoTokenVesting");
    const nomoTokenVesting = await upgrades.deployProxy(NomoTokenVesting, [
        process.env.NOMO_TOKEN_ADDRESS,
        process.env.START_AFTER_TIMESTAMP
    ]);
    await nomoTokenVesting.deployed();

    console.log("NomoTokenVesting deployed to:", nomoTokenVesting.address);

    // verify NomoNFT

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoTokenVesting.address,
            constructorArguments: [process.env.NOMO_TOKEN_ADDRESS, process.env.START_AFTER_TIMESTAMP]
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
