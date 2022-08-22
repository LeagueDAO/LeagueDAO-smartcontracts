const { ethers, upgrades, hre } = require("hardhat");
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    // check that .env is set correctly
    assert(process.env.NOMO_NFT_ADDRESS, "Set NOMO_NFT_ADDRESS address in .env to deploy NomoRouter");
    assert(process.env.REWARD_TOKEN_ADDRESS, "Set REWARD_TOKEN_ADDRESS address in .env to deploy NomoRouter");
    assert(process.env.UPDATER_ADDRESS, "Set UPDATER_ADDRESS address in .env to deploy NomoRouter");

    const NomoRouter = await ethers.getContractFactory("NomoRouter");

    const router = await await upgrades.deployProxy(NomoRouter, [
        process.env.NOMO_NFT_ADDRESS,
        process.env.REWARD_TOKEN_ADDRESS,
        process.env.UPDATER_ADDRESS
    ]);
    await router.deployed();
    console.log("NomoRouter deployed to:", router.address);

    await sleep(10000);

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: router.address
        });
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
