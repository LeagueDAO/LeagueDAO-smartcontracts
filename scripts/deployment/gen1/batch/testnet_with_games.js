const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { parseUnits } = ethers.utils;
const { verify, sleep } = require("../../helpers/helpers");

function randomInteger(min, max) {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

async function main() {
    const gasLimitForAll = "1500000";
    const [owner, ...accounts] = await ethers.getSigners();

    const NomoNFT = (await ethers.getContractFactory("NomoNFT")).connect(owner);
    const nomoNFT = await NomoNFT.deploy();

    await nomoNFT.deployed();

    console.log("NomoNFT deployed to:", nomoNFT.address);

    await verify(nomoNFT.address, []);

    const [deployer] = await hre.ethers.getSigners();

    const ERC20Mock = (await hre.ethers.getContractFactory("ERC20Mock")).connect(owner);
    const NomoRouterV1 = (await hre.ethers.getContractFactory("NomoRouterV1")).connect(owner);
    const NomoLeagueV1 = (await hre.ethers.getContractFactory("NomoLeagueV1Mock")).connect(owner);
    const NomoPointsCalculator = (await hre.ethers.getContractFactory("NomoPointsCalculator")).connect(owner);

    const rewardToken1 = await ERC20Mock.deploy();
    await verify(rewardToken1.address, []);
    await rewardToken1.deployed();
    console.log("Reward token 1 deployed to:", rewardToken1.address);

    // deploy calculator
    const calculator = await NomoPointsCalculator.deploy(nomoNFT.address, 3601, 3600000000);
    await calculator.deployed();
    console.log("Calculator deployed to:", calculator.address);
    await verify(calculator.address, [nomoNFT.address, 3601, 3600000000]);

    // deploy router
    const routerV1 = await upgrades.deployProxy(NomoRouterV1, [
        nomoNFT.address,
        rewardToken1.address,
        deployer.address
    ]);
    await routerV1.deployed();
    console.log("NomoRouter deployed to:", routerV1.address);
    await verify(routerV1.address, [nomoNFT.address, rewardToken1.address, deployer.address]);
    await verify(await getImplementationAddress(ethers.provider, routerV1.address), []);

    await routerV1.deployed();

    // deploy leagues
    const league1Name = "NFL";

    const leagueV1 = await upgrades.deployProxy(NomoLeagueV1, [routerV1.address, league1Name, 1000, 11]);
    await leagueV1.deployed();
    console.log("NomoLeague 1 deployed to:", leagueV1.address);
    await verify(leagueV1.address, [routerV1.address, league1Name, 1000, 11]);
    await verify(await getImplementationAddress(ethers.provider, leagueV1.address), []);

    await routerV1.connect(owner).addLeague(leagueV1.address, 1);
    await routerV1.connect(owner).setCalculator(1, calculator.address);

    await leagueV1.connect(owner).setGAME_DURATION(1);
    await leagueV1.connect(owner).setSTAKING_DURATION(1);

    await calculator.connect(owner).allowParametersSets(1);
    await calculator.connect(owner).setMultiplier("p1", 1051515);
    await nomoNFT.connect(owner).createParametersSet(["p1"]);
    await nomoNFT.connect(owner).setPosition(1, "p1");

    await rewardToken1.connect(owner).mint(leagueV1.address, parseUnits("100000000"));

    const users = [];
    const tokensByUsers = {};
    for (let i = 0; i < 10; i++) {
        const account = ethers.utils.HDNode.fromMnemonic(
            "side success worth camera wash depart ostrich video toward trick smoke wheel"
        ).derivePath(`m/44'/60'/0'/0/${i}`);
        const signer = new ethers.Wallet(account, ethers.provider);
        users.push(signer);
        await owner.sendTransaction({
            to: signer.address,
            value: parseUnits("500000000000000000", "wei") // 0.5 eth
        });
    }
    const countTokensForUsers = 5;
    let countCards = 0;

    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < countTokensForUsers; j++) {
            await nomoNFT.connect(owner).createCardImage("Name", "url", 1, 1, 1, 1, { gasLimit: gasLimitForAll });
            countCards++;
            const cardImageId = countCards;
            await nomoNFT.connect(owner).mintCard(users[i].address, cardImageId, { gasLimit: gasLimitForAll });
            await nomoNFT.connect(owner).updateParameters(cardImageId, [cardImageId * 5], { gasLimit: gasLimitForAll });
            if (!tokensByUsers[users[i].address]) {
                tokensByUsers[users[i].address] = [];
            }
            tokensByUsers[users[i].address].push(countCards);
        }
    }

    const setupRandomPoints = async (forAll = true) => {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < tokensByUsers[users[i].address].length; j++) {
                if (!forAll && randomInteger(1, 10) < 5) {
                    continue;
                }
                if ((await nomoNFT.connect(users[i]).ownerOf(tokensByUsers[users[i].address][j])) != routerV1.address) {
                    continue;
                }
                await nomoNFT
                    .connect(owner)
                    .updateParameters(tokensByUsers[users[i].address][j], [randomInteger(1, 10)], {
                        gasLimit: gasLimitForAll
                    });
                await routerV1
                    .connect(owner)
                    .updatePoints(tokensByUsers[users[i].address][j], { gasLimit: gasLimitForAll });
            }
        }
    };

    const stake = async (forAll = true) => {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < tokensByUsers[users[i].address].length; j++) {
                if (!forAll && randomInteger(1, 10) < 5) {
                    continue;
                }
                if ((await nomoNFT.connect(users[i]).ownerOf(tokensByUsers[users[i].address][j])) == routerV1.address) {
                    continue;
                }
                await nomoNFT
                    .connect(users[i])
                    .approve(routerV1.address, tokensByUsers[users[i].address][j], { gasLimit: gasLimitForAll });
                await routerV1
                    .connect(users[i])
                    .stakeTokens([tokensByUsers[users[i].address][j]], { gasLimit: gasLimitForAll });
            }
        }
    };

    const unstake = async (forAll = true) => {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < tokensByUsers[users[i].address].length; j++) {
                if (!forAll && randomInteger(1, 10) < 5) {
                    continue;
                }
                if ((await nomoNFT.connect(users[i]).ownerOf(tokensByUsers[users[i].address][j])) != routerV1.address) {
                    continue;
                }
                await routerV1
                    .connect(users[i])
                    .unstakeToken(tokensByUsers[users[i].address][j], { gasLimit: gasLimitForAll });
            }
        }
    };

    const withdraw = async (league, forAll = true) => {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < tokensByUsers[users[i].address].length; j++) {
                if (!forAll && randomInteger(1, 10) < 5) {
                    continue;
                }
                await league.connect(users[i]).withdrawReward({ gasLimit: gasLimitForAll });
            }
        }
    };

    await setupRandomPoints();

    await leagueV1.connect(owner).nextGame(parseUnits("0"), { gasLimit: gasLimitForAll });

    await stake(true);

    await leagueV1.connect(owner).nextGame(parseUnits("0"), { gasLimit: gasLimitForAll });
    await sleep(1000);

    await setupRandomPoints(false);

    for (let games = 0; games < 5; games++) {
        await leagueV1
            .connect(owner)
            .nextGame(parseUnits(String(randomInteger(1000, 5000))), { gasLimit: gasLimitForAll });

        await withdraw(leagueV1, false);

        await unstake(false);

        await stake(false);

        await setupRandomPoints(false);
    }

    const rewardToken2 = await ERC20Mock.deploy();
    await rewardToken2.deployed();
    console.log("Reward token 2 deployed to:", rewardToken2.address);

    const NomoRouter = (await ethers.getContractFactory("NomoRouter")).connect(owner);
    const NomoLeague = (await ethers.getContractFactory("NomoLeagueMock")).connect(owner);

    const router = await upgrades.upgradeProxy(routerV1.address, NomoRouter);
    await router
        .connect(owner)
        .addRewardTokens([rewardToken1.address, rewardToken2.address], { gasLimit: gasLimitForAll }); // after upgrade from v1 need add and first token
    const league = await upgrades.upgradeProxy(leagueV1.address, NomoLeague);
    await league.connect(owner).updateRewardTokensList({ gasLimit: gasLimitForAll });
    await verify(await getImplementationAddress(ethers.provider, router.address), []);
    await verify(await getImplementationAddress(ethers.provider, league.address), []);

    await rewardToken2.connect(owner).mint(leagueV1.address, parseUnits("100000000"), { gasLimit: gasLimitForAll });

    for (let games = 0; games < 5; games++) {
        await league
            .connect(owner)
            .nextGame([parseUnits(String(randomInteger(1000, 5000))), parseUnits(String(randomInteger(1000, 5000)))], {
                gasLimit: gasLimitForAll
            });

        await withdraw(leagueV1, false);

        await unstake(false);

        await stake(false);

        await setupRandomPoints(false);
    }

    const leagueV2 = await upgrades.deployProxy(NomoLeague, [routerV1.address, league1Name, 1000, 11]);
    await leagueV2.deployed();
    console.log("NomoLeague 2 deployed to:", leagueV2.address);
    await routerV1.connect(owner).addLeague(leagueV2.address, 2);
    await routerV1.connect(owner).setCalculator(1, calculator.address);
    await leagueV2.connect(owner).setGAME_DURATION(1);
    await leagueV2.connect(owner).setSTAKING_DURATION(1);
    await rewardToken1.connect(owner).mint(leagueV2.address, parseUnits("100000000"));
    await rewardToken2.connect(owner).mint(leagueV2.address, parseUnits("100000000"));
    await leagueV2.connect(owner).setGAME_DURATION(1);
    await leagueV2.connect(owner).setSTAKING_DURATION(1);
    await verify(leagueV2.address, [routerV1.address, league1Name, 1000, 11]);

    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < countTokensForUsers; j++) {
            await nomoNFT.connect(owner).createCardImage("Name2", "url", 2, 1, 1, 1, { gasLimit: gasLimitForAll });
            countCards++;
            const cardImageId = countCards;
            await nomoNFT.connect(owner).mintCard(users[i].address, cardImageId, { gasLimit: gasLimitForAll });
            await nomoNFT.connect(owner).updateParameters(cardImageId, [cardImageId * 5], { gasLimit: gasLimitForAll });
            if (!tokensByUsers[users[i].address]) {
                tokensByUsers[users[i].address] = [];
            }
            tokensByUsers[users[i].address].push(countCards);
        }
    }

    await setupRandomPoints(true);

    await leagueV2.connect(owner).nextGame([parseUnits("0"), parseUnits("0")], { gasLimit: gasLimitForAll });
    await sleep(1000);

    await stake(true);

    await setupRandomPoints(true);

    await leagueV2.connect(owner).nextGame([parseUnits("0"), parseUnits("0")], { gasLimit: gasLimitForAll });
    await sleep(1000);

    await setupRandomPoints(false);

    for (let games = 0; games < 5; games++) {
        await league
            .connect(owner)
            .nextGame([parseUnits(String(randomInteger(1000, 5000))), parseUnits(String(randomInteger(1000, 5000)))]);
        await leagueV2
            .connect(owner)
            .nextGame([parseUnits(String(randomInteger(1000, 5000))), parseUnits(String(randomInteger(1000, 5000)))]);

        await withdraw(leagueV1, false);
        await withdraw(leagueV2, false);

        await unstake(false);

        await stake(false);

        await setupRandomPoints(false);
    }

    await league.connect(owner).setGAME_DURATION(30 * 60, { gasLimit: gasLimitForAll });
    await league.connect(owner).setSTAKING_DURATION(5 * 60, { gasLimit: gasLimitForAll });

    await leagueV2.connect(owner).setGAME_DURATION(30 * 60, { gasLimit: gasLimitForAll });
    await leagueV2.connect(owner).setSTAKING_DURATION(5 * 60, { gasLimit: gasLimitForAll });

    for (let i = 0; i < users.length; i++) {
        await users[i]
            .sendTransaction({
                to: owner.address,
                value: (await users[i].getBalance()) - parseUnits("500000000000000", "wei")
            })
            .catch(() => {});
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
