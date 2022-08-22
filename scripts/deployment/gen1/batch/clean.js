const hre = require("hardhat");
const { ethers, upgrades } = hre;

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
        try {
            await hre.run("verify:verify", {
                address: nomoNFT.address,
                constructorArguments: []
            });
        } catch (error) {
            console.log("Can't verify");
        }
    }

    //-------------- Deploy Router and leagues --------------

    const [deployer] = await hre.ethers.getSigners();

    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const NomoRouter = await hre.ethers.getContractFactory("NomoRouter");
    const NomoLeague = await hre.ethers.getContractFactory("NomoLeague");
    const NomoPointsCalculator = await hre.ethers.getContractFactory("NomoPointsCalculator");

    let token = await ERC20Mock.deploy();
    await token.deployed();
    console.log("Reward token deployed to:", token.address);

    // deploy calculator
    let calculator = await NomoPointsCalculator.deploy(nomoNFT.address, 3601, 3600000000);
    await calculator.deployed();
    console.log("Calculator deployed to:", calculator.address);

    // deploy router
    let router = await upgrades.deployProxy(NomoRouter, [nomoNFT.address, token.address, deployer.address]);
    await router.deployed();
    console.log("NomoRouter deployed to:", router.address);

    await router.deployed();
    await sleep(10000);

    // deploy leagues
    const league1Name = "NFL";

    let league1 = await upgrades.deployProxy(NomoLeague, [router.address, league1Name, 1000, 11]);
    await league1.deployed();
    console.log("NomoLeague 1 deployed to:", league1.address);

    // // verify router and leagues
    // if (
    //     hre.network.name !== "hardhat" &&
    //     hre.network.name !== "localhost" &&
    //     (!process.env.NOMO_ROUTER || !process.env.NOMO_LEAGUE1 || !process.env.NOMO_LEAGUE2)
    // ) {
    //     console.log("Sleeping before verification...");
    //     await sleep(30000);

    //     await hre.run("verify:verify", {
    //         address: router.address,
    //     });
    //     await hre.run("verify:verify", {
    //         address: calculator.address,
    //         constructorArguments: [nomoNFT.address],
    //     });
    //     await hre.run("verify:verify", {
    //         address: league1.address,
    //     });
    // }

    console.log("Adding leagues to router");
    await router.addLeague(league1.address, 1);

    await router.setCalculator(1, calculator.address);

    console.log("Everything ready");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
