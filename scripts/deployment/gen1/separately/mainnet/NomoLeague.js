const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const ROUTER_ADDRESS = "0x14ca85D26a67Be9Ef38a659ec150E9a5Ea82350a";
    const NAME = "NFT";
    const TOTAL_GAMES = 1000000;
    const TOKEN_LIMIT_PER_PLAYER = 12;

    // check that .env is set correctly
    assert(!!NAME, "Set NAME to deploy NomoRouter");
    assert(!!ROUTER_ADDRESS, "Set ROUTER_ADDRESS address to deploy NomoRouter");
    assert(!!TOTAL_GAMES, "Set UPDATER_ADDRESS address to deploy NomoRouter");
    assert(!!TOKEN_LIMIT_PER_PLAYER, "Set UPDATER_ADDRESS address to deploy NomoRouter");

    const NomoLeague = await ethers.getContractFactory("NomoLeague");

    const league = await await upgrades.deployProxy(NomoLeague, [
        ROUTER_ADDRESS,
        NAME,
        TOTAL_GAMES,
        TOKEN_LIMIT_PER_PLAYER
    ]);
    await league.deployed();
    console.log("League deployed to:", league.address);

    console.log("Adding league to router:");
    await sleep(10000);

    const NomoRouter = await ethers.getContractFactory("NomoRouter");
    const router = await NomoRouter.attach(ROUTER_ADDRESS);
    await sleep(10000);
    await router.addLeague(league.address, 1);
    await sleep(10000);

    console.log("Done");

    // if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    //     console.log("Sleeping before verification...");
    //     await sleep(30000);

    //     await hre.run("verify:verify", {
    //         address: league.address,
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
