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

    let shuffledSigners = [];

    const SEASON = 0;
    const NUMBER_OF_DIVISIONS = 4;
    const NUMBER_OF_USERS_IN_DIVISION = 12;
    const NUMBER_OF_USERS = NUMBER_OF_DIVISIONS * NUMBER_OF_USERS_IN_DIVISION;
    const NUMBER_OF_PLAYERS_IN_TEAM = 2;

    const H2H_NUMBER_OF_WEEKS = 15;

    before(async () => {
        const userToSigner = (user) => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].address == user) return users[i];
            }
        };

        const signers = await ethers.getSigners();
        deployer = signers[0];
        NOT_A_USER = signers[1];
        falseMultisig = signers[2];
        falseStrategy = signers[3];

        users = signers.slice(signers.length - NUMBER_OF_USERS, signers.length);

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

        // set Number of Player type 1 in team

        const POSITION = 1;
        const POSSITION_COUNT = NUMBER_OF_PLAYERS_IN_TEAM;
        await teamManager.setPositionNumber(POSITION, POSSITION_COUNT);
        //add users to league
        for (let i = 0; i < users.length; i++) {
            await leagPass.connect(users[i]).joinTheLeague();
        }
        //shuffle all users
        await league.updateRandNum();
        await league.shuffleUsers(NUMBER_OF_USERS);
        let shuffledUsers = [];

        for (let i = 0; i < NUMBER_OF_DIVISIONS; i++) {
            shuffledUsers.push(await league.getDivisionUsers(SEASON, i));
        }
        // turn users into usersSigners

        for (let i = 0; i < NUMBER_OF_DIVISIONS; i++) {
            let divisionSigners = [];
            for (let j = 0; j < NUMBER_OF_USERS_IN_DIVISION; j++) {
                divisionSigners.push(userToSigner(shuffledUsers[i][j]));
            }
            shuffledSigners.push(divisionSigners);
        }

        const TEAM_ID = 1; // all players belong to one team
        const DEAD_LINE = (await time.latest()) + 24 * 3600 * 100;
        await teamsStakingDeadlines.setTeamDeadline(TEAM_ID, DEAD_LINE);

        //mint NUMBER_OF_PLAYERS_IN_TEAM players for each user
        for (let division = 0; division < NUMBER_OF_DIVISIONS; division++) {
            for (let userIdInDivision = 0; userIdInDivision < NUMBER_OF_USERS_IN_DIVISION; userIdInDivision++) {
                for (let token = 0; token < NUMBER_OF_PLAYERS_IN_TEAM; token++) {
                    let tokenId =
                        division * NUMBER_OF_USERS_IN_DIVISION * NUMBER_OF_PLAYERS_IN_TEAM +
                        userIdInDivision * NUMBER_OF_PLAYERS_IN_TEAM +
                        token;
                    await gen2PlayerToken.mint(shuffledSigners[division][userIdInDivision].address);
                    //set all players to one team for staking deadlines
                    await nomoNFT.setCardImageToExistence(tokenId, true); // this is a mock trick
                    await teamsStakingDeadlines.setCardImageToTeam(tokenId, TEAM_ID);
                    //set token score
                    if (tokenId < NUMBER_OF_PLAYERS_IN_TEAM * 4) {
                        // trick to have some team with same total points
                        await pointCalculator.setPoints(tokenId, 5);
                    } else {
                        await pointCalculator.setPoints(tokenId, Math.floor(Math.random() * 10));
                    }
                    await gen2PlayerToken.setTokenPosition(tokenId, POSITION);
                    //stake
                    // console.log(shuffledSigners[division][userIdInDivision].address)
                    // console.log(tokenId)
                    // console.log()
                    await gen2PlayerToken.setNftIdToDivisionId(tokenId, division); // mock trick
                    await gen2PlayerToken
                        .connect(shuffledSigners[division][userIdInDivision])
                        .approve(teamManager.address, tokenId);
                    await teamManager.connect(shuffledSigners[division][userIdInDivision]).stakePlayer(tokenId);
                }
            }
        }
        //__________________________
        snapshotA = await snapshot();
    });
    afterEach(async () => await snapshotA.restore());

    describe("[H2HCompetition]", async () => {
        describe("competeH2Hs", async () => {
            it("compete", async () => {
                const WEEK_REWARDS = [1000000];
                //mint reward tokens for multisig
                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                await league.nextGame();
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(NUMBER_OF_DIVISIONS);

                await league.calculateRewardPerPoint();
                await league.updateRewardsForUsers(NUMBER_OF_USERS);

                let rewardPaidTotal = 0;
                for (let division = 0; division < NUMBER_OF_DIVISIONS; division++) {
                    for (let userIdInDivision = 0; userIdInDivision < NUMBER_OF_USERS_IN_DIVISION; userIdInDivision++) {
                        let user = shuffledSigners[division][userIdInDivision];
                        await league.connect(user).withdrawRewards();
                        rewardPaidTotal += (await rewardERC20.balanceOf(user.address)).toNumber();
                        // console.log(await rewardERC20.balanceOf(user.address))
                    }
                }
                // console.log(rewartPaidTotal);
                const DUST = WEEK_REWARDS[0] * 0.01;
                // console.log("dust percentage ", (WEEK_REWARDS[0] - rewardPaidTotal) / WEEK_REWARDS[0] * 100)
                expect(rewardPaidTotal).to.be.not.lessThan(WEEK_REWARDS[0] - DUST);
            });
            it("compete when number of passed divisions exceed number of existing divisions", async () => {
                const WEEK_REWARDS = [1000000];
                //mint reward tokens for multisig
                await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                await league.nextGame();
                await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                await league.competeH2Hs(NUMBER_OF_DIVISIONS + 10);

                await league.calculateRewardPerPoint();
                await league.updateRewardsForUsers(NUMBER_OF_USERS);

                let rewardPaidTotal = 0;
                for (let division = 0; division < NUMBER_OF_DIVISIONS; division++) {
                    for (let userIdInDivision = 0; userIdInDivision < NUMBER_OF_USERS_IN_DIVISION; userIdInDivision++) {
                        let user = shuffledSigners[division][userIdInDivision];
                        await league.connect(user).withdrawRewards();
                        rewardPaidTotal += (await rewardERC20.balanceOf(user.address)).toNumber();
                        // console.log(await rewardERC20.balanceOf(user.address))
                    }
                }
                // console.log(rewartPaidTotal);
                const DUST = WEEK_REWARDS[0] * 0.01;
                // console.log("dust percentage ", (WEEK_REWARDS[0] - rewardPaidTotal) / WEEK_REWARDS[0] * 100)
                expect(rewardPaidTotal).to.be.not.lessThan(WEEK_REWARDS[0] - DUST);
            });
            it("compete 15 weeks + withdraw all rewards after", async () => {
                const WEEK_REWARDS = [1000000];
                for (let i = 0; i < H2H_NUMBER_OF_WEEKS; i++) {
                    await rewardERC20.mint(falseMultisig.address, WEEK_REWARDS[0]);
                    await rewardERC20.connect(falseMultisig).increaseAllowance(league.address, WEEK_REWARDS[0]);

                    await league.nextGame();
                    await league.connect(falseMultisig).setTotalWeekReward(rewardERC20.address, WEEK_REWARDS[0]);

                    for (let i = 0; i < NUMBER_OF_DIVISIONS; i++) {
                        await league.competeH2Hs(1);
                    }

                    await league.calculateRewardPerPoint();
                    await league.updateRewardsForUsers(NUMBER_OF_USERS);
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
        });
    });
});
