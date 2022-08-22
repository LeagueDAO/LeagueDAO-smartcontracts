const { expect, use, util } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("../../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);

//// module.exports.networks.hardhat.accounts.count = 30;

describe("H2HCompetition", function () {
    let snapshotA;

    let deployer, users;

    let leagueAdmin;
    let league, teamManager, randGenerator, gen2PlayerToken, pointCalculator, rewardERC20;

    let falseStrategy;
    let NOT_A_USER;
    const SEASON = 0;

    before(async () => {
        const signers = await ethers.getSigners();
        deployer = signers[0];
        NOT_A_USER = signers[1];
        falseMultisig = signers[2];
        falseStrategy = signers[3];

        const userArrSize = 12;
        users = signers.slice(4, userArrSize + 1 + 3);
        // contract deploy
        const RandGeneratorMock = await ethers.getContractFactory("RandGeneratorMock");
        randGenerator = await RandGeneratorMock.deploy();
        await randGenerator.deployTransaction.wait();

        const Gen2PlayerTokenMock = await ethers.getContractFactory("Gen2PlayerTokenMock");
        gen2PlayerToken = await Gen2PlayerTokenMock.deploy();
        await gen2PlayerToken.deployTransaction.wait();

        const Gen2PointsCalculatorMock = await ethers.getContractFactory("Gen2PointsCalculatorMock");
        pointCalculator = await Gen2PointsCalculatorMock.deploy();
        await pointCalculator.deployTransaction.wait();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        rewardERC20 = await ERC20Mock.deploy();
        await rewardERC20.deployTransaction.wait();

        const Scheduler = await ethers.getContractFactory("Scheduler");
        scheduler = await Scheduler.deploy();
        await scheduler.deployTransaction.wait();

        const LeagPassMock = await ethers.getContractFactory("LeagPassMock");
        leagPass = await LeagPassMock.deploy();
        await leagPass.deployTransaction.wait();

        const NomoNFTMock = await ethers.getContractFactory("NomoNFTMock");
        nomoNFT = await NomoNFTMock.deploy();
        await nomoNFT.deployTransaction.wait();

        const TeamsStakingDeadlines = await ethers.getContractFactory("TeamsStakingDeadlines");
        teamsStakingDeadlines = await upgrades.deployProxy(TeamsStakingDeadlines, [nomoNFT.address]);
        await teamsStakingDeadlines.deployTransaction.wait();

        const TeamManager = await ethers.getContractFactory("TeamManager");
        teamManager = await upgrades.deployProxy(TeamManager, [
            gen2PlayerToken.address,
            teamsStakingDeadlines.address,
            pointCalculator.address
        ]);
        await teamManager.deployTransaction.wait();

        const FantasyLeague = await ethers.getContractFactory("FantasyLeague");
        league = await upgrades.deployProxy(FantasyLeague, [
            randGenerator.address,
            scheduler.address,
            falseMultisig.address,
            [rewardERC20.address]
        ]);
        await league.deployed();

        await leagPass.setFantasyLeague(league.address);
        await league.setLeaguePassNFT(leagPass.address);

        await teamManager.setFantasyLeague(league.address);
        await league.setTeamManager(teamManager.address);

        //________________________________________
        //____________PLAYERS SETUP_______________
        //________________________________________
        const NUMBER_OF_USERS = 12;
        // set Number of Player type 1 in team
        const POSITION = 1;
        const POSSITION_COUNT = 14;
        await teamManager.setPositionNumber(POSITION, POSSITION_COUNT);
        //add users to league
        for (let i = 0; i < 12; i++) {
            await leagPass.connect(users[i]).joinTheLeague();
        }
        //shuffle
        await league.updateRandNum();
        await league.shuffleUsers(NUMBER_OF_USERS);
        //mint 14 players for 12 users
        let tokenId;
        const TEAM_ID = 1;
        const DEAD_LINE = (await time.latest()) + 24 * 3600 * 100;
        await teamsStakingDeadlines.setTeamDeadline(TEAM_ID, DEAD_LINE);
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 14; j++) {
                tokenId = i * 14 + j;
                await gen2PlayerToken.mint(users[i].address);
                //set all players to one team for staking deadlines
                await nomoNFT.setCardImageToExistence(tokenId, true); // this is a mock trick
                await teamsStakingDeadlines.setCardImageToTeam(tokenId, TEAM_ID);
                //set token score
                if (tokenId < 28) {
                    await pointCalculator.setPoints(tokenId, 5);
                } else {
                    await pointCalculator.setPoints(tokenId, Math.floor(Math.random() * 10));
                }
                await gen2PlayerToken.setTokenPosition(tokenId, POSITION);
                //stake
                await gen2PlayerToken.connect(users[i]).approve(teamManager.address, tokenId);
                await teamManager.connect(users[i]).stakePlayer(tokenId);
            }
        }
        //__________________________
        snapshotA = await snapshot();
    });
    afterEach(async () => await snapshotA.restore());

    describe("[H2HCompetition]", async () => {
        describe("competeH2Hs", async () => {
            it("number of competing division cannot be zero", async () => {
                await league.nextGame();
                await expect(league.competeH2Hs(0)).to.be.revertedWith("DivisionNumberIsZero()");
            });
            it("compete", async () => {
                const WEEK_REWARDS = [1000000];
                //mint reward tokens for multisig
                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                await league.nextGame();
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(1);

                await league.calculateRewardPerPoint();
                await league.updateRewardsForUsers(12);

                let rewartPaidTotal = 0;
                for (let i = 0; i < 12; i++) {
                    await league.connect(users[i]).withdrawRewards();
                    console.log(await rewardERC20.balanceOf(users[i].address));
                    rewartPaidTotal += (await rewardERC20.balanceOf(users[i].address)).toNumber();
                }
                console.log(rewartPaidTotal);
                const DUST = WEEK_REWARDS[0] * 0.01;
                expect(rewartPaidTotal).to.be.not.lessThan(WEEK_REWARDS[0] - DUST);
            });
            it("compete 15 weeks + withdraw all rewards after", async () => {
                const WEEK_REWARDS = [1000000];
                for (let i = 0; i < 15; i++) {
                    await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                    await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                    await league.nextGame();
                    await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                    await league.competeH2Hs(1);

                    await league.calculateRewardPerPoint();
                    await league.updateRewardsForUsers(12);
                }
                let totalRewards = 0;
                for (let i = 0; i < users.length; i++) {
                    await league.connect(users[i]).withdrawRewards();
                    console.log("user", i, " ", await rewardERC20.balanceOf(users[i].address));
                    totalRewards = totalRewards + parseInt(await rewardERC20.balanceOf(users[i].address));
                }
                console.log(totalRewards);
                console.log(await rewardERC20.balanceOf(league.address));
                const ACCURACY = (WEEK_REWARDS[0] * 15) / 100; // 1%
                expect(WEEK_REWARDS[0] * 15 - totalRewards).to.be.lessThan(ACCURACY);
            });
            it("compete 15 weeks + withdraw rewards after each week", async () => {
                const WEEK_REWARDS = [1000000];

                for (let i = 0; i < 15; i++) {
                    await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                    await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                    await league.nextGame();
                    await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                    await league.competeH2Hs(1);

                    await league.calculateRewardPerPoint();
                    await league.updateRewardsForUsers(12);
                    for (let i = 0; i < users.length; i++) {
                        await league.connect(users[i]).withdrawRewards();
                    }
                }

                let totalRewards = 0;
                for (let i = 0; i < users.length; i++) {
                    console.log("user", i, " ", await rewardERC20.balanceOf(users[i].address));
                    totalRewards = totalRewards + parseInt(await rewardERC20.balanceOf(users[i].address));
                }

                console.log(totalRewards);
                console.log(await rewardERC20.balanceOf(league.address));
                const ACCURACY = (WEEK_REWARDS[0] * 15) / 100; // 1%
                expect(WEEK_REWARDS[0] * 15 - totalRewards).to.be.lessThan(ACCURACY);
            });
        });
        describe("updateRewardsForUsers()", async () => {
            it("Update rewards one by one", async () => {
                const WEEK_REWARDS = [1000000];

                await league.nextGame();

                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(1);

                await league.calculateRewardPerPoint();

                for (let i = 0; i < users.length; i++) {
                    await league.updateRewardsForUsers(1);
                }
                for (let i = 0; i < users.length; i++) {
                    await league.connect(users[i]).withdrawRewards();
                    expect(await rewardERC20.balanceOf(users[i].address)).to.be.not.equal(0);
                }
            });
            it("Update rewards all together", async () => {
                const WEEK_REWARDS = [1000000];

                await league.nextGame();

                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(1);

                await league.calculateRewardPerPoint();

                await league.updateRewardsForUsers(users.length);

                for (let i = 0; i < users.length; i++) {
                    await league.connect(users[i]).withdrawRewards();
                    expect(await rewardERC20.balanceOf(users[i].address)).to.be.not.equal(0);
                }
            });
            it("Update rewards with TOO MANY USERS", async () => {
                const WEEK_REWARDS = [1000000];

                await league.nextGame();

                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(1);

                await league.calculateRewardPerPoint();

                await league.updateRewardsForUsers(users.length + 100);

                for (let i = 0; i < users.length; i++) {
                    await league.connect(users[i]).withdrawRewards();
                    expect(await rewardERC20.balanceOf(users[i].address)).to.be.not.equal(0);
                }
            });
            it("Cannot update reward for zero users", async () => {
                const WEEK_REWARDS = [1000000];
                await league.nextGame();
                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);
                await league.competeH2Hs(1);
                await league.calculateRewardPerPoint();

                await expect(league.updateRewardsForUsers(0)).to.be.revertedWith("NumberOfUsersIsZero()");
            });
        });
        describe("withdrawRewards()", async () => {
            it("Not a user cannot withdraw rewards", async () => {
                const WEEK_REWARDS = [1000000];
                await league.nextGame();

                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);
                await league.competeH2Hs(1);
                await league.calculateRewardPerPoint();
                await league.updateRewardsForUsers(users.length);

                await expect(league.connect(NOT_A_USER).withdrawRewards()).to.be.revertedWith("UnknownUser()");
                expect(await rewardERC20.balanceOf(NOT_A_USER.address)).to.be.equal(0);
            });
        });
        describe("calculateRewardPerPoint()", async () => {
            it("Reward per point is zero, when all users have zero points", async () => {
                const WEEK = 1;
                await league.nextGame();
                for (let tokenId = 0; tokenId < 12 * 14; tokenId++) {
                    await pointCalculator.setPoints(tokenId, 0);
                }
                await league.competeH2Hs(1);

                await league.calculateRewardPerPoint();
                expect(await league.getTotalWeekRewards(SEASON, WEEK, rewardERC20.address)).to.be.equal(0);
            });
        });
        describe("Getters and setters", () => {
            it("Add reward token", async () => {
                await expect(league.addRewardToken(rewardERC20.address)).to.be.revertedWith("TokenAlreadyInTheList()");

                const TOKEN_ADDRESS = users[0].address;
                let tx = await league.addRewardToken(TOKEN_ADDRESS);
                await expect(tx).to.emit(league, "RewardTokenAdded").withArgs(TOKEN_ADDRESS);
            });
            it("Cannot set total week reward at wrong game stage", async () => {
                const REWARD_AMOUNT = 1000;
                await expect(
                    league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, REWARD_AMOUNT)
                ).to.be.revertedWith("OnlyH2HStage()");
            });
            it("Cannot set total week reward in wrong token", async () => {
                const REWARD_AMOUNT = 1000;
                const NOT_A_REWARD_TOKEN = "0xc6dCcF1326cC57AdBF0C0208602aA641E4bb8765";
                await league.nextGame();
                await expect(
                    league.connect(falseMultisig).setTotalWeekReward(NOT_A_REWARD_TOKEN, REWARD_AMOUNT)
                ).to.be.revertedWith("UnknownRewardToken()");
            });
            it("Set scheduler", async () => {
                const SCHEDULER_ADDRESS = users[0].address;
                let tx = await league.setScheduler(SCHEDULER_ADDRESS);
                await expect(tx).to.emit(league, "SchedulerSet").withArgs(SCHEDULER_ADDRESS);
            });
            it("Set calculator", async () => {
                const CALCULATOR_ADDR = users[10].address;
                let tx = await teamManager.setCalculator(CALCULATOR_ADDR);
                await expect(tx).to.emit(teamManager, "CalculatorSet").withArgs(CALCULATOR_ADDR);
            });
            it("Only admin can set calculator", async () => {
                const CALCULATOR_ADDR = users[10].address;
                const REVERT_STR =
                    "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
                await expect(teamManager.connect(users[1]).setCalculator(CALCULATOR_ADDR)).to.be.revertedWith(
                    REVERT_STR
                );
            });
            it("getCurrentWeek", async () => {
                expect(await league.getCurrentWeek()).to.be.equal(0);
            });
            it("getTotalWeekRewards", async () => {
                const WEEK = 1;
                expect(await league.getTotalWeekRewards(SEASON, WEEK, rewardERC20.address)).to.be.equal(0);
            });
            it("getRewardPerPoint", async () => {
                const WEEK = 1;
                expect(await league.getRewardPerPoint(SEASON, WEEK, rewardERC20.address)).to.be.equal(0);
            });
            it("getUserWeekReward", async () => {
                const WEEK = 1;
                expect(await league.getUserWeekReward(users[0].address, SEASON, WEEK, rewardERC20.address)).to.be.equal(
                    0
                );
            });
            it("getRewardTokens", async () => {
                expect((await league.getRewardTokens())[0]).to.be.equal(rewardERC20.address);
            });
            describe("Remove reward token", () => {
                it("Admin can remove reward token when there is one token", async () => {
                    expect(await league.rewardTokens(0)).to.be.equal(rewardERC20.address);
                    await league.connect(deployer).removeRewardToken(rewardERC20.address);
                    expect(await league.isRewardToken(rewardERC20.address)).to.be.false;
                    await expect(league.rewardTokens(0)).to.be.reverted;
                });
                it("Admin can remove first reward token when there are two tokens", async () => {
                    const secondRewardToken = users[0];

                    await league.connect(deployer).addRewardToken(secondRewardToken.address);

                    expect(await league.rewardTokens(0)).to.be.equal(rewardERC20.address);
                    await league.connect(deployer).removeRewardToken(rewardERC20.address);
                    expect(await league.isRewardToken(rewardERC20.address)).to.be.false;
                    await expect(league.rewardTokens(1)).to.be.reverted;
                });
                it("Admin can remove second reward token when there are two tokens", async () => {
                    const SECOND_REWARD_TOKEN = users[0].address;

                    await league.connect(deployer).addRewardToken(SECOND_REWARD_TOKEN);

                    expect(await league.rewardTokens(1)).to.be.equal(SECOND_REWARD_TOKEN);
                    await league.connect(deployer).removeRewardToken(SECOND_REWARD_TOKEN);
                    expect(await league.isRewardToken(SECOND_REWARD_TOKEN)).to.be.false;
                    await expect(league.rewardTokens(1)).to.be.reverted;
                });
                it("Cannot remove nonexistent token", async () => {
                    const NONEXISTENT = users[0].address;
                    await expect(league.connect(deployer).removeRewardToken(NONEXISTENT)).to.be.reverted;
                });
            });
        });
    });
});
