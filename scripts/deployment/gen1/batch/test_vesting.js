const hre = require("hardhat");
const { ethers, upgrades } = hre;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // check that .env is set correctly
    assert(
        process.env.START_AFTER_TIMESTAMP,
        "Set START_AFTER_TIMESTAMP value and address in .env to deploy NomoTokenVesting"
    );

    const [deployer] = await ethers.getSigners();
    // We get the contract to deploy
    const NomoToken = await ethers.getContractFactory("LeagueTokenMock");
    const nomoToken = await NomoToken.deploy(deployer.address);

    await nomoToken.deployed();

    console.log("NomoTokenMock deployed to:", nomoToken.address);

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(60000);

        await hre.run("verify:verify", {
            address: nomoToken.address,
            constructorArguments: [deployer.address],
            contract: "contracts/mock/LeagueTokenMock.sol:LeagueTokenMock"
        });
    }

    // Deploying
    const NomoTokenVesting = await ethers.getContractFactory("NomoTokenVestingMock");
    const nomoTokenVesting = await NomoTokenVesting.deploy();
    await nomoTokenVesting.deployed();

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(60000);

        await hre.run("verify:verify", {
            address: nomoTokenVesting.address,
            constructorArguments: [],
            contract: "contracts/mock/NomoTokenVestingMock.sol:NomoTokenVestingMock"
        });
    }
    // await nomoTokenVesting.initialize(nomoToken.address, process.env.START_AFTER_TIMESTAMP);
    const startTime = 900;
    await nomoTokenVesting.initialize(nomoToken.address, startTime);

    const totalSupply = await nomoToken.totalSupply();
    await nomoToken.transfer(nomoTokenVesting.address, totalSupply);
    console.log("NomoTokenVestingMock deployed to:", nomoTokenVesting.address);
    await nomoTokenVesting.addVester("0xaEea9c3997Dabdd58Da143Afc941d876c12CeA34", { gasLimit: 10970621 });
    // const investors = [
    //     "0x2bBb1958C274ea8279f00972CdA52d16946754C8",
    //     "0xCafe32E515f8c6B29Fc0B817d443bDF0bb2A5aD7",
    //     "0xe0Fdb745438D137F4bfeca3f201871F8454E4934",
    // ];
    // const amounts = ["5000000000000000000000000", "2500000000000000000000000", "2500000000000000000000000"];

    // console.log("Adding investors");

    // await nomoTokenVesting.addOrUpdateInvestors(investors, amounts, { gasLimit: 10970621 });
    // // verify NomoNFT
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
