const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { verify, sleep, getAddressSaver } = require("../helpers/helpers");
const { parseUnits } = ethers.utils;
const path = require("path");

async function main() {
    const gasLimitForAll = "1500000";
    const [owner, ...accounts] = await ethers.getSigners();

    const network = (await ethers.getDefaultProvider().getNetwork()).name;
    const addressesPath = path.join(__dirname, "deploymentAddresses.json");
    const saveAddress = getAddressSaver(addressesPath, network, true);

    const NomoNFT = (await ethers.getContractFactory("NomoNFT")).connect(owner);
    const nomoNFT = await NomoNFT.deploy();
    await nomoNFT.deployed();

    saveAddress("nomoNFT", nomoNFT.address, true);

    await verify(nomoNFT.address, []);

    const [deployer] = await hre.ethers.getSigners();

    const ERC20Mock = (await hre.ethers.getContractFactory("ERC20Mock")).connect(owner);
    const NomoRouterV1 = (await hre.ethers.getContractFactory("NomoRouterV1")).connect(owner);
    const NomoLeagueV1 = (await hre.ethers.getContractFactory("NomoLeagueV1Mock")).connect(owner);
    const NomoPointsCalculator = (await hre.ethers.getContractFactory("NomoPointsCalculator")).connect(owner);

    const rewardToken1 = await ERC20Mock.deploy();
    await verify(rewardToken1.address, []);
    await rewardToken1.deployed();
    saveAddress("rewardToken1", rewardToken1.address);

    // deploy calculator
    const calculator = await NomoPointsCalculator.deploy(nomoNFT.address, 3601, 3600000000);
    await calculator.deployed();
    saveAddress("calculator", calculator.address);
    await verify(calculator.address, [nomoNFT.address, 3601, 3600000000]);

    // deploy router
    const routerV1 = await upgrades.deployProxy(NomoRouterV1, [
        nomoNFT.address,
        rewardToken1.address,
        deployer.address
    ]);
    await routerV1.deployed();
    saveAddress("router", routerV1.address);
    await verify(routerV1.address, [nomoNFT.address, rewardToken1.address, deployer.address]);
    await verify(await getImplementationAddress(ethers.provider, routerV1.address), []);

    // deploy leagues
    const league1Name = "Fantasy Football";

    const leagueV1 = await upgrades.deployProxy(NomoLeagueV1, [routerV1.address, league1Name, 1000, 11]);
    await leagueV1.deployed();
    console.log(saveAddress("league1", leagueV1.address));
    await verify(leagueV1.address, [routerV1.address, league1Name, 1000, 11]);
    await verify(await getImplementationAddress(ethers.provider, leagueV1.address), []);

    await routerV1.connect(owner).addLeague(leagueV1.address, 1);
    await routerV1.connect(owner).setCalculator(1, calculator.address);
    await routerV1.connect(owner).setCalculator(2, calculator.address);
    await routerV1.connect(owner).setCalculator(3, calculator.address);

    await leagueV1.connect(owner).setGAME_DURATION(60 * 60);
    await leagueV1.connect(owner).setSTAKING_DURATION(30 * 60);

    await calculator.connect(owner).allowParametersSets(1);
    await calculator.connect(owner).allowParametersSets(2);
    await calculator.connect(owner).allowParametersSets(3);

    await rewardToken1.connect(owner).mint(leagueV1.address, parseUnits("100000000"));
    console.log("done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
