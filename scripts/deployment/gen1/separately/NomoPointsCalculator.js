const hre = require("hardhat");
const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // check that .env is set correctly
    assert(process.env.NOMO_NFT_ADDRESS, "Set NOMO_NFT_ADDRESS address in .env to deploy NomoPointsCalculator");

    // We get the contract to deploy
    const NomoPointsCalculator = await ethers.getContractFactory("NomoPointsCalculator");
    const nomoPointsCalculator = await NomoPointsCalculator.deploy(process.env.NOMO_NFT_ADDRESS);

    await nomoPointsCalculator.deployed();

    console.log("NomoPointsCalculator deployed to:", nomoPointsCalculator.address);

    // verify

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoPointsCalculator.address,
            constructorArguments: [process.env.NOMO_NFT_ADDRESS]
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
