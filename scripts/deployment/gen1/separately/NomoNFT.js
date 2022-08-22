const hre = require("hardhat");
const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // We get the contract to deploy
    const NomoNFT = await ethers.getContractFactory("NomoNFT");
    const nomoNFT = await NomoNFT.deploy();

    await nomoNFT.deployed();

    console.log("NomoNFT deployed to:", nomoNFT.address);

    // verify NomoNFT

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoNFT.address,
            constructorArguments: []
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
