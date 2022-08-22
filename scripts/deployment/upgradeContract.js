const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const CONTRACT_PROXY_ADDRESS = "0xeb0cF806B1A4091EAa96c2f6dD76E8315Cd3c435";
    const CONTRACT_NAME = "MegaLeague";

    // const implementationAddressBefore = await getImplementationAddress(ethers.provider, CONTRACT_PROXY_ADDRESS);
    // console.log("Implementation address before: ", implementationAddressBefore);

    const contractFactory = await ethers.getContractFactory(CONTRACT_NAME);

    const proxyInstance = await upgrades.upgradeProxy(CONTRACT_PROXY_ADDRESS, contractFactory, {
        gasLimit: 3000000,
        timeout: 0,
        pollingInterval: 1000
    });

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

// npx hardhat run scripts/deployment/upgradeContract.js --network mumbai

// 0x2C75c8122443714ffb9eB2A29899841084Afa25B new imp
// npx hardhat verify "0x143e4a998cf85f7a80ab66fb9754e0260ff2d393" --network mumbai
