const hre = require("hardhat");
const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const NFT_ADDRESS = "0x62cE8b564293dC331CE50BEE0FA7E271a5a2520E";
    assert(!!NFT_ADDRESS);
    const NomoPointsCalculator = await ethers.getContractFactory("NomoPointsCalculator");
    const nomoPointsCalculator = await NomoPointsCalculator.deploy(NFT_ADDRESS, 518400, 86400);

    await nomoPointsCalculator.deployed();

    console.log("NomoCalculator deployed to:", nomoPointsCalculator.address);

    // verify NomoNFT

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoPointsCalculator.address,
            constructorArguments: [NFT_ADDRESS, 518400, 86400]
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
