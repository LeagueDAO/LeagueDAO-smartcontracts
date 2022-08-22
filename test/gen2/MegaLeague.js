const { expect, use } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("./../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);

//// module.exports.networks.hardhat.accounts.count = 30;
const getSigner = function (address, signers) {
    for (i = 0; i < signers.length; i++) {
        if (signers[i].address == address) return signers[i];
    }
};

const userToSigner = (user, signers) => {
    for (let i = 0; i < signers.length; i++) {
        if (signers[i].address == user) return signers[i];
    }
};
describe("MegaLeague", function () {
    let snapshotA;
    let signers;
    let deployer, users;

    let leagueAdmin;
    let league, megaLeague, teamManager, randGenerator, gen2PlayerToken, pointCalculator, rewardERC20;

    let falseStrategy, falseMultisig, falseTreasury;
    const SEASON = 0;

    before(async () => {
        signers = await ethers.getSigners();
        deployer = signers[0];

        falseTreasury = signers[1];
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

        //_____________________ Financial manager mock setup _________________________________
        const FinancialManager = await ethers.getContractFactory("FinancialManagerMock2");
        financialManager = await upgrades.deployProxy(FinancialManager, [
            falseStrategy.address,
            falseMultisig.address,
            league.address,
            [rewardERC20.address, rewardERC20.address, rewardERC20.address, rewardERC20.address]
        ]);
        await financialManager.setTreasury(falseTreasury.address, 3000);
        await league.setFinancialManager(financialManager.address);
        const REWARD_TOTAL_AMOUNT = parseEther("10000");
        await rewardERC20.mint(financialManager.address, REWARD_TOTAL_AMOUNT);
        //______________________________________________________________________________________

        const MegaLeague = await ethers.getContractFactory("MegaLeague");
        megaLeague = await upgrades.deployProxy(MegaLeague, [
            [rewardERC20.address],
            financialManager.address,
            randGenerator.address
        ]);
        await financialManager.setMegaLeague(megaLeague.address);

        // await gen2PlayerToken.setFantasyLeague(league.address)
        await league.setGen2PlayerToken(gen2PlayerToken.address);

        await leagPass.setFantasyLeague(league.address);
        await league.setLeaguePassNFT(leagPass.address);

        await teamManager.setFantasyLeague(league.address);
        await league.setTeamManager(teamManager.address);

        await megaLeague.setFantasyLeague(league.address);
        await league.setMegaLeague(megaLeague.address);
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
        //____________ 15 weeks of H2H _________________________
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
        }

        //_________________________16, 17 weeks __________________________________

        let division = await league.getDivisionUsers(SEASON, 0);

        let divisonsWithData = [];
        for (let i = 0; i < division.length; i++) {
            divisonsWithData.push([
                division[i],
                (await league.userSeasonStats(division[i], SEASON)).totalPoints.toNumber(),
                (await league.userSeasonStats(division[i], SEASON)).wins,
                (await league.userSeasonStats(division[i], SEASON)).ties
            ]);
        }
        console.log(divisonsWithData);
        divisonsWithData.sort(function (a, b) {
            if (b[1] > a[1]) return 1;
            if (b[1] < a[1]) return -1;
            if (b[2] > a[2]) return 1;
            if (b[2] < a[2]) return -1;
            if (b[3] > a[3]) return 1;
            if (b[3] < a[3]) return -1;
        });
        console.log(divisonsWithData);
        let sortedAddresses = divisonsWithData.map((el) => el[0]);
        console.log(sortedAddresses);

        //
        await league.nextGame();
        await league.addSortedPlayoffDivisions(sortedAddresses);
        console.log(await league.getGameStage());
        await league.competePlayoffs(1);
        console.log(await league.getGameStage());

        await league.nextGame();

        console.log(await league.getGameStage());
        await league.competePlayoffs(1);
        console.log(await league.getGameStage());

        let winner = (await league.getSomeDivisionWinners(SEASON, 0, 0))[0];
        winner = getSigner(winner, users);
        expect((await league.getSomeDivisionWinners(SEASON, 0, 0))[0]).to.be.equal(sortedAddresses[0]);

        // rewards
        await financialManager.supplyRewardsForPlayoffAndMegaLeague();
        console.log(await rewardERC20.balanceOf(league.address));

        await league.calculatePlayoffRewards(1);
        console.log(await league.getGameStage());
        console.log("User reward balance", await rewardERC20.balanceOf(winner.address));
        await league.connect(winner).withdrawRewards();
        console.log("User reward balance", await rewardERC20.balanceOf(winner.address));

        //____________________________________________________________
        snapshotA = await snapshot();
    });
    afterEach(async () => await snapshotA.restore());

    describe("Megaleague", async () => {
        it("main flow", async () => {
            console.log(await league.getGameStage());
            await league.nextGame();
            await megaLeague.updateRandNum();
            await megaLeague.readDivisionWinner(2);
            await megaLeague.stepToFindMegaLeagueWinners(5);
            await megaLeague.calculateMegaLeagueRewards();

            let winnerAddress = (await megaLeague.getMegaLeagueWinners(SEASON))[0].winner;
            let wineerSigner = userToSigner(winnerAddress, signers);

            console.log("winner balance before", await rewardERC20.balanceOf(winnerAddress));
            await megaLeague.connect(wineerSigner).withdrawRewards(SEASON, 0);
            console.log("winner balance after", await rewardERC20.balanceOf(winnerAddress));

            await expect(megaLeague.connect(wineerSigner).withdrawRewards(SEASON, 0)).to.be.revertedWith(
                "User have no rewards in this season"
            );

            //MegaLeague
            await league.startNewSeason();
            console.log(await league.getGameStage());
        });
    });
});
