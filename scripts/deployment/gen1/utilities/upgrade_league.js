const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const LEAGUE_PROXY_ADDRESS = "0x0E6dD5Cd59c436313AAe4ebE9622F6486776E477";

    const NomoLeague = await ethers.getContractFactory("NomoLeague");

    const upgradedLeague = await upgrades.upgradeProxy(LEAGUE_PROXY_ADDRESS, NomoLeague);

    await upgradedLeague.deployed();
    console.log("League deployed to:", upgradedLeague.address);
    let limit = await upgradedLeague.tokenLimitPerPlayer();
    console.log(limit.toString());
    let name = await upgradedLeague.name();
    console.log(name);
    await upgradedLeague.setName("NFL");
    name = await upgradedLeague.name();
    console.log(name);
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
