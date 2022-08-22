/* eslint-disable max-len */
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
    const addresses = require(addressesPath)[network].new;

    const ERC20Mock = (await hre.ethers.getContractFactory("ERC20Mock")).connect(owner);

    const rewardToken2 = await ERC20Mock.deploy();
    const rewardToken1 = await ERC20Mock.attach(addresses.rewardToken1);
    await rewardToken2.deployed();
    saveAddress("rewardToken2", rewardToken2.address);

    const NomoRouter = (await ethers.getContractFactory("NomoRouter")).connect(owner);
    const NomoLeague = (await ethers.getContractFactory("NomoLeagueMock")).connect(owner);

    const router = await upgrades.upgradeProxy(addresses.router, NomoRouter);
    await router
        .connect(owner)
        .addRewardTokens([addresses.rewardToken1, rewardToken2.address], { gasLimit: gasLimitForAll }); // after upgrade from v1 need add and first token
    const league = await upgrades.upgradeProxy(addresses.league1, NomoLeague);
    await league.connect(owner).updateRewardTokensList({ gasLimit: gasLimitForAll });
    await verify(await getImplementationAddress(ethers.provider, router.address), []);
    await verify(await getImplementationAddress(ethers.provider, league.address), []);

    await rewardToken2.connect(owner).mint(addresses.league1, parseUnits("100000000"), { gasLimit: gasLimitForAll });

    const league2Name = "Fantasy Basketball";
    const leagueV2 = await upgrades.deployProxy(NomoLeague, [addresses.router, league2Name, 1000, 11]);
    await leagueV2.deployed();
    console.log(saveAddress("league2", leagueV2.address));
    await router.connect(owner).addLeague(leagueV2.address, 2);
    await router.connect(owner).setCalculator(1, addresses.calculator);
    await leagueV2.connect(owner).setGAME_DURATION(1);
    await leagueV2.connect(owner).setSTAKING_DURATION(1);
    await rewardToken1.connect(owner).mint(leagueV2.address, parseUnits("100000000"));
    await rewardToken2.connect(owner).mint(leagueV2.address, parseUnits("100000000"));
    await leagueV2.connect(owner).setGAME_DURATION(1);
    await leagueV2.connect(owner).setSTAKING_DURATION(1);
    await verify(leagueV2.address, [addresses.router, league2Name, 1000, 11]);

    await leagueV2.connect(owner).setGAME_DURATION(60 * 60, { gasLimit: gasLimitForAll });
    await leagueV2.connect(owner).setSTAKING_DURATION(30 * 60, { gasLimit: gasLimitForAll });
    console.log("done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
