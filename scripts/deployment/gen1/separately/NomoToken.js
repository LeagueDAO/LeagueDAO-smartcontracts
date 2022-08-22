const hre = require("hardhat");
const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // check that .env is set correctly
    assert(process.env.INITIAL_MINT_RECEIVER, "Set INITIAL_MINT_RECEIVER address in .env to deploy NomoToken");
    // We get the contract to deploy
    const NomoToken = await ethers.getContractFactory("NomoToken");
    const nomoToken = await NomoToken.deploy(process.env.INITIAL_MINT_RECEIVER);

    await nomoToken.deployed();

    console.log("NomoNFT deployed to:", nomoToken.address);

    // verify NomoNFT

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoToken.address,
            constructorArguments: [process.env.INITIAL_MINT_RECEIVER]
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
