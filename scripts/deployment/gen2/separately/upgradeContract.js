const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const CONTRACT_PROXY_ADDRESS = "0x855847537C1d34fFE7051028AC4A496e78E6a614";
    const CONTRACT_NAME = "TeamsStakingDeadlines";

    // const implementationAddressBefore = await getImplementationAddress(ethers.provider, CONTRACT_PROXY_ADDRESS);
    // console.log("Implementation address before: ", implementationAddressBefore);

    const contractFactory = await ethers.getContractFactory(CONTRACT_NAME);

    const proxyInstance = await upgrades.upgradeProxy(CONTRACT_PROXY_ADDRESS, contractFactory);

    await proxyInstance.deployed();
    console.log("Contract upgraded, proxy address:", proxyInstance.address);
    const implementationAddressAfter = await getImplementationAddress(ethers.provider, CONTRACT_PROXY_ADDRESS);
    console.log("Implementation address after:  ", implementationAddressAfter);
    // let limit = await upgradedLeague.tokenLimitPerPlayer();
    // console.log(limit.toString());
    // let name = await upgradedLeague.name();
    // console.log(name);
    // await upgradedLeague.setName("NFL");
    // name = await upgradedLeague.name();
    // console.log(name);
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
