const { expect, use } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
const { BigNumber } = require("ethers");
const { toBN, snapshot, time } = require("../helpers");

use(solidity);

const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const MAI = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
const QUICKSWAP_V2_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const WANT_LP_TOKENS = [
    "0xE89faE1B4AdA2c869f05a0C96C87022DaDC7709a",
    "0xf04adBF75cDFc5eD26eeA4bbbb991DB002036Bdd",
    "0x2cF7252e74036d1Da831d11089D326296e64a728"
]; // USDT-MAI, USDC-DAI, USDC-USDT LP tokens
const STAKING_REWARDS = [
    "0x06e49078b1900A8489462Cd2355ED8c09f507499",
    "0xACb9EB5B52F495F09bA98aC96D8e61257F3daE14",
    "0xAFB76771C98351Aa7fCA13B130c9972181612b54"
]; // Stakings for corresponding want tokens
const REWARD_TOKEN = "0xf28164A485B0B2C90639E47b0f377b4a438a16B1"; // dQuick token
const QUICK = "0x831753DD7087CaC61aB5644b308642cc1c33Dc13";
const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

const STAKING_3POOL_PID = 3;
const AMOUNT_FOR_EACH_STABLE = ethers.utils.parseEther("10000", "ether");

const setupStrategy = async (strategy, staking, deployer) => {
    // Grant roles
    await strategy.grantRole(await strategy.STRATEGIST_ROLE(), staking.address);
    await strategy.grantRole(await strategy.BACKEND_ROLE(), deployer.address);
    // Setup swap routes
    await strategy.setUnderlyingRoutes([DAI, USDC]);
    await strategy.setUnderlyingRoutes([DAI, USDC, USDT]);
    await strategy.setUnderlyingRoutes([DAI, USDC, MAI]);
    await strategy.setUnderlyingRoutes([MAI, USDC, USDT]);
    await strategy.setUnderlyingRoutes([MAI, USDC]);
    await strategy.setUnderlyingRoutes([MAI, USDC, DAI]);
    await strategy.setUnderlyingRoutes([USDT, USDC, MAI]);
    await strategy.setUnderlyingRoutes([USDT, USDC, DAI]);
    await strategy.setUnderlyingRoutes([USDT, USDC]);
    await strategy.setUnderlyingRoutes([USDC, USDT]);
    await strategy.setUnderlyingRoutes([USDC, MAI]);
    await strategy.setUnderlyingRoutes([USDC, DAI]);
    await strategy.setRewardRoutes([QUICK, USDC, MAI, DAI]);
    await strategy.setRewardRoutes([QUICK, USDC, MAI]);
    await strategy.setRewardRoutes([QUICK, USDC]);
    await strategy.setRewardRoutes([QUICK, USDC, USDT]);
    // set slippage tolerance. Currently to 100%
    await strategy.setSlippage(ethers.utils.parseEther("1", "ether"));
};

const distributeRewards = async (router) => {
    // Impersonating QuickSwap owner account
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x476307DaC3FD170166e007FCaA14F0A129721463"]
    });
    const quickSwapOwner = await ethers.getSigner("0x476307DaC3FD170166e007FCaA14F0A129721463");
    // Buy Quick
    await router.swapExactETHForTokens(0, [WMATIC, QUICK], quickSwapOwner.address, ethers.constants.MaxUint256, {
        value: ethers.utils.parseEther("100000", "ether")
    });
    // Get dQuick
    const dragonLair = await ethers.getContractAt("IdQuick", REWARD_TOKEN);
    const quick = await ethers.getContractAt("ERC20", QUICK);
    await quick.connect(quickSwapOwner).approve(dragonLair.address, await quick.balanceOf(quickSwapOwner.address));
    await dragonLair.connect(quickSwapOwner).enter(await quick.balanceOf(quickSwapOwner.address));
    // Distirbute rewards to be enough for at least 2 month.
    const dQuick = await ethers.getContractAt("ERC20", REWARD_TOKEN);
    const rewardsNotifier = await ethers.getContractAt(
        "IRewardsNotifiers",
        "0x8aAA5e259F74c8114e0a471d9f2ADFc66Bfe09ed"
    );
    await dQuick
        .connect(quickSwapOwner)
        .transfer(rewardsNotifier.address, await dQuick.balanceOf(quickSwapOwner.address));

    await rewardsNotifier
        .connect(quickSwapOwner)
        .update(WANT_LP_TOKENS[0], ethers.utils.parseEther("1.28", "ether").mul(60), time.duration.days(60));
    await rewardsNotifier
        .connect(quickSwapOwner)
        .update(WANT_LP_TOKENS[1], ethers.utils.parseEther("1.28", "ether").mul(60), time.duration.days(60));
    await rewardsNotifier
        .connect(quickSwapOwner)
        .update(WANT_LP_TOKENS[2], ethers.utils.parseEther("2.56", "ether").mul(60), time.duration.days(60));
    for (let i = 0; i < 3; i++) {
        await rewardsNotifier.notifyRewardAmount(WANT_LP_TOKENS[i]);
    }
};

describe("FinancialManager", () => {
    describe("With mock strategy", async () => {
        let deployer, user1, user2, multisigMock;
        let financialManager;
        let strategy, megaleague, league; // mocks
        let tokens = [];
        let tokensAddresses = [];
        let snapshotA;

        before(async () => {
            [deployer, user1, user2, multisigMock, treasury] = await ethers.getSigners();

            // Deploy tokens mocks
            for (let i = 0; i < 4; i++) {
                let erc20 = await (await ethers.getContractFactory("ERC20Mock")).deploy();
                tokens.push(erc20);
                tokensAddresses.push(erc20.address);
            }

            // Deploy strategy, megaleague, league mock
            strategy = await (await ethers.getContractFactory("ImpulseStrategyMock")).deploy(tokensAddresses);
            megaleague = await (await ethers.getContractFactory("MegaLeagueSimpleMock")).deploy();
            league = await (await ethers.getContractFactory("FantasyLeagueSimpleMock")).deploy();

            // Deploy financial manager
            const FinancialManager = await ethers.getContractFactory("FinancialManager");
            financialManager = await upgrades.deployProxy(FinancialManager, [
                strategy.address,
                multisigMock.address,
                league.address,
                tokensAddresses
            ]);
            await financialManager.setMegaLeague(megaleague.address);
            await financialManager.setTreasury(treasury.address, 3000);

            //Mint tokens for financial manager
            for (let i = 0; i < 4; i++) {
                await tokens[i].mint(financialManager.address, AMOUNT_FOR_EACH_STABLE);
            }

            snapshotA = await snapshot();
        });

        afterEach(async () => await snapshotA.restore());

        it("Treasury cannot be set when share is not between 0% and 100%", async () => {
            await expect(financialManager.setTreasury(treasury.address, 30000)).to.be.revertedWith(
                "Share has to be between 0% and 100%"
            );
        });
        it("deposit tokens", async () => {
            for (let i = 0; i < 4; i++) {
                expect(await tokens[i].balanceOf(financialManager.address)).to.be.equal(AMOUNT_FOR_EACH_STABLE);
            }
            //deposit
            await financialManager.depositBalance();

            for (let i = 0; i < 4; i++) {
                expect(await tokens[i].balanceOf(financialManager.address)).to.be.equal(0);
            }

            for (let i = 0; i < 4; i++) {
                console.log(await tokens[i].balanceOf(treasury.address));
            }
            console.log(await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address));

            expect(
                (await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gte(
                    AMOUNT_FOR_EACH_STABLE.mul(4 * 3).div(10)
                )
            ).to.be.true;
        });
        it("Cannot deposit tokens with zero balance", async () => {
            let newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy();
            await financialManager.setTokens(tokensAddresses.concat([newToken.address]));
            await financialManager.depositBalance();
        });
        it("yield cannot be collected when there is no yield", async () => {
            //deposit
            await financialManager.depositBalance();
            await expect(financialManager.connect(multisigMock).yield(tokens[0].address)).to.be.revertedWith(
                "No yield to be collected"
            );
        });
        it("yield cannot be collected from false address", async () => {
            await expect(financialManager.connect(multisigMock).yield(multisigMock.address)).to.be.revertedWith(
                "Invalid token"
            );
        });
        it("yield cannot be collected when there is no yield after yeild has been collected before", async () => {
            await financialManager.depositBalance();
            await strategy.earn(1);
            await financialManager.connect(multisigMock).yield(tokens[0].address);
            await expect(financialManager.connect(multisigMock).yield(tokens[0].address)).to.be.revertedWith(
                "No yield to be collected"
            );
        });
        it("Yields 10 times and leave deposit untouched ", async () => {
            let multisigBalance = await tokens[0].balanceOf(multisigMock.address);
            let userPoolAmount = await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address);
            await financialManager.depositBalance();

            for (let i = 0; i < 10; i++) {
                await strategy.earn(1);
                await financialManager.connect(multisigMock).yield(tokens[0].address);

                expect((await tokens[0].balanceOf(multisigMock.address)).gt(multisigBalance)).to.be.true;
                multisigBalance = await tokens[0].balanceOf(multisigMock.address);

                expect((await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gte(userPoolAmount))
                    .to.be.true;
            }
        });
        it("Withdraw deposit after yields 10 times", async () => {
            let multisigBalance = await tokens[0].balanceOf(multisigMock.address);

            await financialManager.depositBalance();
            let userPoolAmount = await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address);

            for (let i = 0; i < 10; i++) {
                await strategy.earn(1);
                await financialManager.connect(multisigMock).yield(tokens[0].address);
                expect((await tokens[0].balanceOf(multisigMock.address)).gt(multisigBalance)).to.be.true;
                multisigBalance = await tokens[0].balanceOf(multisigMock.address);
                expect((await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gte(userPoolAmount))
                    .to.be.true;
            }

            let playoffRewardAmount = (await financialManager.playoffRewardAmount()).mul(
                await league.getNumberOfDivisions()
            );

            await financialManager.setLastWeekOfPlayoff(1);
            await financialManager.supplyRewardsForPlayoffAndMegaLeague();

            expect((await tokens[1].balanceOf(league.address)).eq(playoffRewardAmount)).to.be.true;
            expect((await tokens[1].balanceOf(megaleague.address)).gte(userPoolAmount.sub(playoffRewardAmount))).to.be
                .true;
        });
        it("Cannot withdraw deposit at inappropriate week", async () => {
            await expect(financialManager.supplyRewardsForPlayoffAndMegaLeague()).to.be.revertedWith(
                "Impossible to send playoff rewards at this week"
            );
        });
        it("Deposit in parts correctly than yileds correctly", async () => {
            for (let j = 0; j < 5; j++) {
                await financialManager.depositBalance();

                for (let i = 0; i < 4; i++) {
                    await tokens[i].mint(financialManager.address, AMOUNT_FOR_EACH_STABLE);
                }
            }

            expect(
                (await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gte(
                    AMOUNT_FOR_EACH_STABLE.mul(4 * 5 * 3).div(10)
                )
            ).to.be.true;

            let multisigBalance = await tokens[0].balanceOf(multisigMock.address);
            let userPoolAmount = await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address);
            await financialManager.depositBalance();

            for (let i = 0; i < 10; i++) {
                await strategy.earn(1);
                await financialManager.connect(multisigMock).yield(tokens[0].address);

                expect((await tokens[0].balanceOf(multisigMock.address)).gt(multisigBalance)).to.be.true;
                multisigBalance = await tokens[0].balanceOf(multisigMock.address);

                expect((await strategy.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gte(userPoolAmount))
                    .to.be.true;
            }
        });

        describe("Setters", async () => {
            it("setPoolId()", async () => {
                await financialManager.setPoolId(1);
                expect(await financialManager.poolId()).to.be.equal(1);
            });
            it("setStrategy()", async () => {
                await financialManager.setStrategy(strategy.address);
                expect(await financialManager.strategy()).to.be.equal(strategy.address);
            });
            it("setMultisigUser()", async () => {
                await financialManager.setMultisigUser(multisigMock.address);
                expect(await financialManager.multisigUser()).to.be.equal(multisigMock.address);
            });
            it("setFantasyLeague()", async () => {
                await financialManager.setFantasyLeague(league.address);
                expect(await financialManager.fantasyLeague()).to.be.equal(league.address);
            });
            it("setTokens()", async () => {
                await financialManager.setTokens([REWARD_TOKEN]);
                expect(await financialManager.tokens(0)).to.be.equal(REWARD_TOKEN);
            });
            it("setRewardTokenAndAmount()", async () => {
                await financialManager.setRewardTokenAndAmount(10, REWARD_TOKEN);
                expect(await financialManager.playoffRewardAmount()).to.be.equal(10);
                expect(await financialManager.playoffRewardToken()).to.be.equal(REWARD_TOKEN);
            });
            it("getPlayoffRewardTokenNValue()", async () => {
                let rewardAndToken = await financialManager.getPlayoffRewardTokenNValue();
                expect(rewardAndToken[0]).to.be.equal(tokensAddresses[1]);
                expect(rewardAndToken[1]).to.be.equal(toBN("900000000000000000000"));
            });
        });
    });

    describe.skip("Fork-test with real strategy", async () => {
        let deployer, multisig, fantasyLeague;
        let staking, strategy;
        let financialManager;
        let usdc, usdt, dai, mai;
        let router;
        let snapshotA;

        before(async () => {
            [deployer, multisig, fantasyLeague] = await ethers.getSigners();

            // Get tokens instances
            usdc = await ethers.getContractAt("ERC20", USDC);
            usdt = await ethers.getContractAt("ERC20", USDT);
            dai = await ethers.getContractAt("ERC20", DAI);
            mai = await ethers.getContractAt("ERC20", MAI);
            // Get instance of Quickswap router
            router = await ethers.getContractAt("IUniswapV2Router01", QUICKSWAP_V2_ROUTER);
            // Deploy Impulse strategy
            strategy = await (await ethers.getContractFactory("ImpulseQuickSwap3pool")).deploy();
            await strategy.initialize(
                [USDC, USDT, DAI, MAI],
                WANT_LP_TOKENS,
                STAKING_REWARDS,
                REWARD_TOKEN,
                QUICKSWAP_V2_ROUTER
            );
            // Deploy Impulse staking and add pool
            staking = await (await ethers.getContractFactory("ImpulseStakingMulti")).deploy();
            await staking.initialize();
            await staking.addPool(STAKING_3POOL_PID, USDC, [], [], strategy.address);

            // Setup strategy
            await setupStrategy(strategy, staking, deployer);
            // Deploy Finance manager
            financialManager = await (await ethers.getContractFactory("FinancialManager")).deploy();
            await financialManager.initialize(staking.address, multisig.address, fantasyLeague.address, [
                USDC,
                USDT,
                DAI,
                MAI
            ]);
            // Buy USDC
            await router.swapExactETHForTokens(0, [WMATIC, USDC], deployer.address, ethers.constants.MaxUint256, {
                value: ethers.utils.parseEther("1000000", "ether")
            });
        });

        it("Should deposit", async () => {
            const amount = BigNumber.from("300000000000"); // 300k USDC
            await usdc.transfer(financialManager.address, amount);
            await financialManager.depositBalance();

            expect((await staking.userPoolAmount(STAKING_3POOL_PID, financialManager.address)).gt(0)).to.be.true;
            console.log(await staking.userPoolAmount(STAKING_3POOL_PID, financialManager.address));
        });

        it("Should deposit and withdraw yield", async () => {
            // Deposit
            const amount = BigNumber.from("300000000000"); // 300k USDC
            await usdc.transfer(financialManager.address, amount);
            await financialManager.depositBalance();
            const bodyOfDeposit = await staking.userPoolAmount(STAKING_3POOL_PID, financialManager.address);
            console.log(`Initial body of deposit in want is ${bodyOfDeposit}`);

            // Earn
            await distributeRewards(router);
            for (let i = 0; i < 60; i++) {
                await time.increase(time.duration.days(1));
                await time.advanceBlock();
                await strategy.earn();
            }

            // Withdraw yield first time
            console.log("Want locked total before yield: ", await strategy.wantLockedTotal());
            await financialManager.connect(multisig).yield(USDC);
            expect((await usdc.balanceOf(multisig.address)).gt(0)).to.be.true;
            console.log("Want locked total after yield: ", await strategy.wantLockedTotal());
            console.log(`Usdc bal after yield is ${await usdc.balanceOf(multisig.address)}`);
            console.log(
                `User pool amount after yield is ${await staking.userPoolAmount(
                    STAKING_3POOL_PID,
                    financialManager.address
                )}`
            );

            // Withdraw yield second time

            // Earn
            await distributeRewards(router);
            for (let i = 0; i < 30; i++) {
                await time.increase(time.duration.days(1));
                await time.advanceBlock();
                await strategy.earn();
            }

            await financialManager.connect(multisig).yield(USDC);

            console.log(`Usdc bal after yield is ${await usdc.balanceOf(multisig.address)}`);
            console.log(
                `User pool amount after yield is ${await staking.userPoolAmount(
                    STAKING_3POOL_PID,
                    financialManager.address
                )}`
            );

            // Withdraw yield third time
            for (let i = 0; i < 30; i++) {
                await time.increase(time.duration.days(1));
                await time.advanceBlock();
                await strategy.earn();
            }

            await financialManager.connect(multisig).yield(USDC);

            console.log(`Usdc bal after yield is ${await usdc.balanceOf(multisig.address)}`);
            console.log(
                `User pool amount after yield is ${await staking.userPoolAmount(
                    STAKING_3POOL_PID,
                    financialManager.address
                )}`
            );

            // Withdraw yield fourth time
            await distributeRewards(router);
            for (let i = 0; i < 30; i++) {
                await time.increase(time.duration.days(1));
                await time.advanceBlock();
                await strategy.earn();
            }

            await financialManager.connect(multisig).yield(USDC);

            console.log(`Usdc bal after yield is ${await usdc.balanceOf(multisig.address)}`);
            console.log(
                `User pool amount after yield is ${await staking.userPoolAmount(
                    STAKING_3POOL_PID,
                    financialManager.address
                )}`
            );

            // Withdraw yield fifth time
            await distributeRewards(router);
            for (let i = 0; i < 60; i++) {
                await time.increase(time.duration.days(1));
                await time.advanceBlock();
                await strategy.earn();
            }

            await financialManager.connect(multisig).yield(USDC);

            console.log(`Usdc bal after yield is ${await usdc.balanceOf(multisig.address)}`);
            console.log(
                `User pool amount after yield is ${await staking.userPoolAmount(
                    STAKING_3POOL_PID,
                    financialManager.address
                )}`
            );
        });
    });
});
