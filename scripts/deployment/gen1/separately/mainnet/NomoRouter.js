const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const NOMO_NFT_ADDRESS = "0x62cE8b564293dC331CE50BEE0FA7E271a5a2520E";
    const REWARD_TOKEN_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
    const CALCULATOR_ADDRESS = "0xD540492787E6a6d1D6EB2FF457B1Ff88C8F99aa1";
    const UPDATER_ADDRESS = deployer.address;
    // check that .env is set correctly
    assert(!!NOMO_NFT_ADDRESS, "Set NOMO_NFT_ADDRESS address to deploy NomoRouter");
    assert(!!REWARD_TOKEN_ADDRESS, "Set REWARD_TOKEN_ADDRESS address to deploy NomoRouter");
    assert(!!UPDATER_ADDRESS, "Set UPDATER_ADDRESS address to deploy NomoRouter");
    assert(!!CALCULATOR_ADDRESS, "Set CALCULATOR_ADDRESS address to deploy NomoRouter");

    const NomoRouter = await ethers.getContractFactory("NomoRouter");

    const router = await await upgrades.deployProxy(NomoRouter, [
        NOMO_NFT_ADDRESS,
        REWARD_TOKEN_ADDRESS,
        UPDATER_ADDRESS
    ]);
    await router.deployed();
    console.log("NomoRouter deployed to:", router.address);
    console.log("Adding calculator");
    await sleep(10000);

    await router.setCalculator(1, CALCULATOR_ADDRESS);
    await router.setCalculator(2, CALCULATOR_ADDRESS);

    console.log("Done");
    // if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    //     console.log("Sleeping before verification...");
    //     await sleep(30000);

    //     await hre.run("verify:verify", {
    //         address: router.address,
    //     });
    // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
