const { expect, use } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("../../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);

describe("Staker", function () {
    const DIVISION_SIZE = 12;
    const NUMBER_OF_USERS = 24; // for test
    const TOKEN_COUNT = 10; // for each user in test

    let snapshotA;

    let deployer, users, usersAddresses;

    let leagueAdmin, randomSigner;
    let league, randGenerator, gen2PlayerToken, pointCalculator, rewardERC20;
    let falseStrategy, falseMultisig;

    const SEASON = 0;

    before(async () => {
        const signers = await ethers.getSigners();
        deployer = signers[0];
        const userArrSize = DIVISION_SIZE * 2;
        users = signers.slice(1, userArrSize + 1);
        usersAddresses = users.map((el) => el.address);

        // For the initialization of the Fantasy League contract
        falseStrategy = signers[userArrSize + 1];
        falseMultisig = signers[userArrSize + 2];
        randomSigner = signers[userArrSize + 3];
        // contract deploy
        const RandGeneratorMock = await ethers.getContractFactory("RandGeneratorMock");
        randGenerator = await RandGeneratorMock.deploy();
        await randGenerator.deployTransaction.wait();

        const Gen2PlayerTokenMock = await ethers.getContractFactory("Gen2PlayerTokenMock2");
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

        leagueAdmin = deployer;
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

        //_________________________
        // Mint 10 tokens for user
        const POSITION = 1;
        const POSSITION_COUNT = 10;
        await teamManager.setPositionNumber(POSITION, POSSITION_COUNT);

        const TEAM_ID = 1;
        const DEAD_LINE = (await time.latest()) + 24 * 3600 * 100;
        await teamsStakingDeadlines.setTeamDeadline(TEAM_ID, DEAD_LINE);

        let tokenId;
        for (let i = 0; i < NUMBER_OF_USERS; i++) {
            await leagPass.connect(users[i]).joinTheLeague();
            for (let j = 1; j <= TOKEN_COUNT; j++) {
                tokenId = i * 10 + j;

                await gen2PlayerToken.mint(users[i].address);
                await gen2PlayerToken.setTokenPosition(tokenId, POSITION);

                await nomoNFT.setCardImageToExistence(tokenId, true); // this is a mock trick
                await teamsStakingDeadlines.setCardImageToTeam(tokenId, TEAM_ID);
            }
        }
        //shuffle

        await league.updateRandNum();
        await league.shuffleUsers(NUMBER_OF_USERS);

        //__________________________
        snapshotA = await snapshot();
    });
    afterEach(async () => await snapshotA.restore());

    describe("[StakeValidator]", () => {
        it("Only admin can setERC721", async () => {
            const REVERT_STR =
                "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
            await expect(teamManager.connect(users[1]).setGen2PlayerToken(users[0].address)).to.be.revertedWith(
                REVERT_STR
            );

            let tx = await teamManager.setGen2PlayerToken(users[0].address);
            await expect(tx).to.emit(teamManager, "Gen2PlayerTokenSet").withArgs(users[0].address);
        });
        it("ERC721 cannot be set as zero address", async () => {
            await expect(teamManager.setGen2PlayerToken(AddressZero)).to.be.revertedWith("Zero address");
        });
        it("Only admin can set position number", async () => {
            const POSITION = 1;
            const POSITION_NUMBER = 2;
            const SEASON = 0;
            const REVERT_STR =
                "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
            await expect(teamManager.connect(users[1]).setPositionNumber(POSITION, POSITION_NUMBER)).to.be.revertedWith(
                REVERT_STR
            );

            let tx = await teamManager.setPositionNumber(POSITION, POSITION_NUMBER);
            await expect(tx).to.emit(teamManager, "PositionNumberSet").withArgs(SEASON, POSITION, POSITION_NUMBER);

            expect(await teamManager.positionNumber(SEASON, POSITION)).to.be.equal(POSITION_NUMBER);
        });
        it("Position number cannot be zero", async () => {
            await expect(teamManager.setPositionNumber(0, 1)).to.be.revertedWith(
                "position code is 0, check position code"
            );
        });
        it("Only admin can set flex position", async () => {
            const POSITION = 1;
            const IS_FLEX = true;
            const SEASON = 0;
            const REVERT_STR =
                "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
            await expect(teamManager.connect(users[1]).setFlexPosition(POSITION, IS_FLEX)).to.be.revertedWith(
                REVERT_STR
            );

            let tx = await teamManager.setFlexPosition(POSITION, IS_FLEX);
            await expect(tx).to.emit(teamManager, "FlexPositionSet").withArgs(SEASON, POSITION, IS_FLEX);
        });
        it("Flex position cannot be set with present value", async () => {
            const POSITION = 1;
            const IS_FLEX = false;
            await expect(teamManager.setFlexPosition(POSITION, IS_FLEX)).to.be.revertedWith(
                "passed _position is already with passed bool value"
            );
        });
        it("Flex position cannot be zero", async () => {
            const POSITION = 0;
            const IS_FLEX = true;
            await expect(teamManager.setFlexPosition(POSITION, IS_FLEX)).to.be.revertedWith(
                "position code is 0, check position code"
            );
        });
        it("Only admin can set flex position number", async () => {
            const POSITION_NUMBER = 2;
            const SEASON = 0;
            const REVERT_STR =
                "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
            await expect(teamManager.connect(users[1]).setFlexPositionNumber(POSITION_NUMBER)).to.be.revertedWith(
                REVERT_STR
            );

            let tx = await teamManager.setFlexPositionNumber(POSITION_NUMBER);
            await expect(tx).to.emit(teamManager, "FlexPositionNumberSet").withArgs(SEASON, POSITION_NUMBER);
        });
    });
    describe("[Staker]", () => {
        const TOKEN_ID = 1;
        it("Stake player", async () => {
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            let tx = await teamManager.connect(users[0]).stakePlayer(TOKEN_ID);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_ID);
        });
        it("Stake players", async () => {
            const TOKEN_IDS = [1, 2, 3, 4];
            await gen2PlayerToken.connect(users[0]).setApprovalForAll(teamManager.address, true);
            let tx = await teamManager.connect(users[0]).stakePlayers(TOKEN_IDS);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[0]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[1]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[2]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[3]);
        });
        it("Unstake players", async () => {
            const TOKEN_IDS = [1, 2, 3, 4];
            await gen2PlayerToken.connect(users[0]).setApprovalForAll(teamManager.address, true);
            await teamManager.connect(users[0]).stakePlayers(TOKEN_IDS);

            let tx = await teamManager.connect(users[0]).unstakePlayers(TOKEN_IDS);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_IDS[0]);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_IDS[1]);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_IDS[2]);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_IDS[3]);
        });
        it("Cannot unstake players of another user", async () => {
            const TOKEN_IDS = [1, 2, 3, 4];
            await gen2PlayerToken.connect(users[0]).setApprovalForAll(teamManager.address, true);
            await teamManager.connect(users[0]).stakePlayers(TOKEN_IDS);

            await expect(teamManager.connect(users[1]).unstakePlayers(TOKEN_IDS)).to.be.revertedWith(
                "This player is not staked"
            );
        });
        it("Cannot stake same player twice", async () => {
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await teamManager.connect(users[0]).stakePlayer(TOKEN_ID);

            await expect(teamManager.connect(users[0]).stakePlayer(TOKEN_ID)).to.be.revertedWith(
                "This player has already been staked"
            );
        });
        it("Cannot stake player with zero position code", async () => {
            const POSITION = 0;
            await gen2PlayerToken.setTokenPosition(TOKEN_ID, POSITION);
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await expect(teamManager.connect(users[0]).stakePlayer(TOKEN_ID)).to.be.revertedWith(
                "Position code can't be zero"
            );
        });
        it("Cannot stake player when position is reached and player is not flex", async () => {
            const POSITION = 2;
            await gen2PlayerToken.setTokenPosition(TOKEN_ID, POSITION);
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await expect(teamManager.connect(users[0]).stakePlayer(TOKEN_ID)).to.be.revertedWith(
                "Simple limit is reached and can't stake in flex"
            );
        });
        it("Cannot stake player when position and flex limit are reached", async () => {
            const POSITION = 2;
            const POSITION_COUNT = 1;
            const TOKENS = [1, 2];
            await teamManager.setFlexPosition(POSITION, true);
            await teamManager.setFlexPositionNumber(POSITION_COUNT);
            await gen2PlayerToken.setTokenPosition(TOKENS[0], POSITION);
            await gen2PlayerToken.setTokenPosition(TOKENS[1], POSITION);

            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKENS[0]);
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKENS[1]);
            await teamManager.connect(users[0]).stakePlayer(TOKENS[0]);
            await expect(teamManager.connect(users[0]).stakePlayer(TOKENS[1])).to.be.revertedWith(
                "Simple and flex limits reached"
            );
        });
        it("Cannot stake player in wrong division", async () => {
            const DIVISION_0 = await league.getDivisionUsers(0, 0);
            const DIVISION_1 = await league.getDivisionUsers(0, 1);

            const USER_0_INDEX = usersAddresses.indexOf(DIVISION_0[0]);
            const USER_0 = users[USER_0_INDEX];
            const USER_1_INDEX = usersAddresses.indexOf(DIVISION_1[0]);
            const USER_1 = users[USER_1_INDEX];

            const USER_0_FIRST_NFT_ID = USER_0_INDEX * 10 + 1;

            //get user tokens ids
            await gen2PlayerToken.connect(USER_0).transferFrom(USER_0.address, USER_1.address, USER_0_FIRST_NFT_ID);

            await gen2PlayerToken.connect(USER_1).approve(teamManager.address, USER_0_FIRST_NFT_ID);

            await expect(teamManager.connect(USER_1).stakePlayer(USER_0_FIRST_NFT_ID)).to.be.revertedWith(
                "Token from another division"
            );
        });
        it("Only teamManager user can stake player", async () => {
            const NOT_USER_TOKEN_ID = NUMBER_OF_USERS * 10 + 1;
            const TOKEN_POSITION = 1;
            await gen2PlayerToken.mint(randomSigner.address);
            await gen2PlayerToken.setTokenPosition(NOT_USER_TOKEN_ID, TOKEN_POSITION);

            await gen2PlayerToken.connect(randomSigner).approve(teamManager.address, NOT_USER_TOKEN_ID);
            await expect(teamManager.connect(randomSigner).stakePlayer(NOT_USER_TOKEN_ID)).to.be.revertedWith(
                "Unknown user"
            );
        });
        it("Unstake player", async () => {
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await teamManager.connect(users[0]).stakePlayer(TOKEN_ID);

            let tx = await teamManager.connect(users[0]).unstakePlayer(TOKEN_ID);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_ID);
        });
        it("Unstake player from flex possition", async () => {
            const POSITION = 1;
            POSSITION_COUNT = 0;
            FLEX_COUNT = 1;
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await teamManager.setPositionNumber(POSITION, POSSITION_COUNT);
            await teamManager.setFlexPosition(POSITION, true);
            await teamManager.setFlexPositionNumber(FLEX_COUNT);

            await teamManager.connect(users[0]).stakePlayer(TOKEN_ID);
            tx = await teamManager.connect(users[0]).unstakePlayer(TOKEN_ID);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_ID);
        });
        it("Only teamManager user can unstake player", async () => {
            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID);
            await teamManager.connect(users[0]).stakePlayer(TOKEN_ID);

            await expect(teamManager.connect(randomSigner).unstakePlayer(TOKEN_ID)).to.be.revertedWith("Unknown user");
        });
        it("League user can unstake only player he owns", async () => {
            const TOKEN_ID_1 = 1;
            const TOKEN_ID_2 = 11;

            await gen2PlayerToken.connect(users[0]).approve(teamManager.address, TOKEN_ID_1);
            await teamManager.connect(users[0]).stakePlayer(TOKEN_ID_1);
            await gen2PlayerToken.connect(users[1]).approve(teamManager.address, TOKEN_ID_2);
            await teamManager.connect(users[1]).stakePlayer(TOKEN_ID_2);

            await expect(teamManager.connect(users[1]).unstakePlayer(TOKEN_ID_1)).to.be.revertedWith(
                "This player is not staked"
            );
        });
        /// geters
        it("Gets users division id", async () => {
            let divisionCount0 = 0;
            let divisionCount1 = 0;
            for (let i = 0; i < 24; i++) {
                if ((await teamManager.getUserDivisionId(SEASON, users[i].address)) == 0) divisionCount0++;
                if ((await teamManager.getUserDivisionId(SEASON, users[i].address)) == 1) divisionCount1++;
            }
            expect(divisionCount0).to.be.equal(DIVISION_SIZE);
            expect(divisionCount1).to.be.equal(DIVISION_SIZE);
        });
    });
    describe("[Scenario]", () => {
        it("Scenario 1", async () => {
            const TOKEN_IDS = [1, 2, 3, 4];
            await gen2PlayerToken.connect(users[0]).setApprovalForAll(teamManager.address, true);
            const POSITION_1 = 1; // by defaulf all token with position 1
            const POSSITION_COUNT = 2;
            const FLEX_COUNT = 2;
            await teamManager.setFlexPosition(POSITION_1, true);
            await teamManager.setPositionNumber(POSITION_1, POSSITION_COUNT);
            await teamManager.setFlexPositionNumber(FLEX_COUNT);

            let tx = await teamManager.connect(users[0]).stakePlayers(TOKEN_IDS);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[0]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[1]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[2]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[3]);

            expect(await teamManager.isPlayerInFlexPosition(SEASON, TOKEN_IDS[0])).to.be.false;
            expect(await teamManager.isPlayerInFlexPosition(SEASON, TOKEN_IDS[1])).to.be.false;
            expect(await teamManager.isPlayerInFlexPosition(SEASON, TOKEN_IDS[2])).to.be.true;
            expect(await teamManager.isPlayerInFlexPosition(SEASON, TOKEN_IDS[3])).to.be.true;

            //unstake player from flex position and stake as usual player

            tx = await teamManager.connect(users[0]).unstakePlayer(TOKEN_IDS[2]);
            await expect(tx).to.emit(teamManager, "PlayerUnstaked").withArgs(0, users[0].address, TOKEN_IDS[2]);
            await teamManager.setPositionNumber(POSITION_1, POSSITION_COUNT + 1);
            tx = await teamManager.connect(users[0]).stakePlayer(TOKEN_IDS[2]);
            await expect(tx).to.emit(teamManager, "PlayerStaked").withArgs(0, users[0].address, TOKEN_IDS[2]);
            expect(await teamManager.isPlayerInFlexPosition(SEASON, TOKEN_IDS[2])).to.be.false;
        });
    });
});
