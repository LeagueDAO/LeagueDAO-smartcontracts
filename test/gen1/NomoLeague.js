const { expect, use } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
const { parseUnits } = ethers.utils;

const { time } = require("../helpers");

use(solidity);

describe("NomoLeague test", () => {
    let nft, router, league, league2, token, calculator;
    let owner, player, accounts;
    let NomoNFT, NomoRouter, NomoLeague, ERC20Mock, NomoPointsCalculatorMock;

    beforeEach(async () => {
        [owner, player, ...accounts] = await ethers.getSigners();

        ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        NomoNFT = await ethers.getContractFactory("NomoNFT");
        NomoRouter = await ethers.getContractFactory("NomoRouter");
        NomoLeague = await ethers.getContractFactory("NomoLeague");
        NomoPointsCalculatorMock = await ethers.getContractFactory("NomoPointsCalculatorMock");

        token = await ERC20Mock.deploy();
        nft = await NomoNFT.deploy();
        router = await NomoRouter.deploy();
        await router.initialize(nft.address, [token.address], owner.address);
        league = await NomoLeague.deploy();
        await league.initialize(router.address, "League", 10, 3);
        await router.addLeague(league.address, 1);
        await league.nextGame([parseUnits("1000000")]);

        calculator = await NomoPointsCalculatorMock.deploy();
        await router.setCalculator(1, calculator.address);

        await nft.setPosition(1, "Position #1");
        await nft.createCardImage("Ronaldo", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 1);
        await calculator.setPoints(1, 10);
        await nft.createCardImage("Kokorin", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 2);
        await calculator.setPoints(2, 5);
        await nft.createCardImage("Litvin", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 3);
        await calculator.setPoints(3, 3);
        await nft.createCardImage("Randomguy", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 4);
        await calculator.setPoints(4, 6);

        await nft.setApprovalForAll(router.address, true);
        await nft.connect(player).setApprovalForAll(router.address, true);
    });

    it("League name is correct", async () => {
        expect(await league.name()).to.equal("League");
    });

    it("Game is started", async () => {
        expect(await league.lastGameId()).to.equal(1);
    });

    it("Can't proceed beyond last game", async () => {
        league2 = await NomoLeague.deploy();
        await league2.initialize(router.address, "League", 2, 1);
        await router.addLeague(league2.address, 2);

        expect(await league2.lastGameId()).to.equal(0);

        await league2.nextGame([0]);
        expect(await league2.lastGameId()).to.equal(1);

        await time.increase(await league.GAME_DURATION());
        await league2.nextGame([0]);
        expect(await league2.lastGameId()).to.equal(2);

        await time.increase(await league.GAME_DURATION());
        await league2.nextGame([0]);
        expect(await league2.lastGameId()).to.equal(2);

        await expect(league2.nextGame([0])).to.be.revertedWith("NomoLeague::nextGame: league is finished");
    });

    it("Can't finish game before it's end", async () => {
        await expect(league.nextGame([0])).to.be.revertedWith(
            "NomoLeague::startNewGame: previous game isn't finished yet"
        );
    });

    it("Can't distribute non-zero reward for zero players", async () => {
        await time.increase(await league.GAME_DURATION());
        await expect(league.nextGame([1])).to.be.revertedWith(
            "NomoLeague::startNewGame: can't distribute non-zero reward with zero players"
        );
    });

    it("Can't stake unstake or update points directly (bypassing router)", async () => {
        await expect(league.stakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.unstakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.updatePoints(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");
    });

    it("Can't stake more tokens than limit per player", async () => {
        await expect(router.stakeTokens([1, 2, 3, 4])).to.be.revertedWith(
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );
    });

    it("Tokens staked to game in staking period give active points", async () => {
        await router.stakeTokens([1]);
        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(10);
        expect(player.pendingPoints).to.equal(0);
    });

    it("Tokens staked to game after staking period give pending points", async () => {
        await time.increase(await league.STAKING_DURATION());

        await router.stakeTokens([1]);
        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(0);
        expect(player.pendingPoints).to.equal(10);
    });

    it("Unstaking active and pending tokens works correct", async () => {
        await router.stakeTokens([1]);

        await time.increase(await league.STAKING_DURATION());

        await router.stakeTokens([2]);

        await router.unstakeTokens([1, 2]);

        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(0);
        expect(player.pendingPoints).to.equal(0);
    });

    it("Updating points should work for active tokens", async () => {
        await router.stakeTokens([1]);

        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(10);
        expect(await league.totalActivePoints()).to.equal(10);

        await calculator.setPoints(1, 15);
        const tx = await router.updatePoints(1);
        await expect(tx).to.emit(router, "PointsUpdated").withArgs(1);

        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(15);
        expect(await league.totalActivePoints()).to.equal(15);
    });

    it("Updating points should work for pending tokens", async () => {
        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([1]);

        player = await league.players(owner.address);
        expect(player.pendingPoints).to.equal(10);
        expect(await league.totalPendingPoints()).to.equal(10);

        await calculator.setPoints(1, 15);
        await router.updatePoints(1);

        player = await league.players(owner.address);
        expect(player.pendingPoints).to.equal(15);
        expect(await league.totalPendingPoints()).to.equal(15);
    });

    it("Rewards should be only calculated for active points", async () => {
        await nft.transferFrom(owner.address, player.address, 2);
        await router.stakeTokens([1]);
        await router.connect(player).stakeTokens([2]);

        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([3]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame([parseUnits("1000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(parseUnits("1000000").mul(1).div(3));
    });

    it("Pending points become active in next games", async () => {
        await nft.transferFrom(owner.address, player.address, 2);
        await router.connect(player).stakeTokens([2]);

        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([1]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame([parseUnits("1000000")]);

        await time.increase(await league.GAME_DURATION());
        await league.nextGame([parseUnits("1000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(
            parseUnits("1000000").add(parseUnits("1000000").mul(1).div(3))
        );

        await time.increase(await league.GAME_DURATION());
        await league.nextGame([parseUnits("1000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(
            parseUnits("1000000").mul(2).div(3).mul(2).add(1)
        );
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(
            parseUnits("1000000").add(parseUnits("1000000").mul(1).div(3).mul(2))
        );
    });

    it("Movement of pending points can be enforced", async () => {
        await router.stakeTokens([1]);
        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([2]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame([parseUnits("1000000")]);

        let playerInfo = await league.players(owner.address);
        expect(playerInfo.pendingPoints).to.equal(5);
        expect(playerInfo.activePoints).to.equal(10);

        await league.updatePlayer(owner.address);

        playerInfo = await league.players(owner.address);
        expect(playerInfo.pendingPoints).to.equal(0);
        expect(playerInfo.activePoints).to.equal(15);
    });

    it("Withdrawing rewards works correct", async () => {
        await router.stakeTokens([2]);
        await time.increase(await league.GAME_DURATION());
        await token.mint(league.address, parseUnits("1000000"));
        await league.nextGame([parseUnits("1000000")]);

        let balanceBefore = await token.balanceOf(owner.address);
        await league.withdrawReward();
        let balanceAfter = await token.balanceOf(owner.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(parseUnits("1000000"));

        await nft.transferFrom(owner.address, player.address, 1);
        await router.connect(player).stakeTokens([1]);

        await time.increase(await league.GAME_DURATION());
        await token.mint(league.address, parseUnits("1000000"));
        await league.nextGame([parseUnits("1000000")]);

        balanceBefore = await token.balanceOf(owner.address);
        await league.withdrawReward();
        balanceAfter = await token.balanceOf(owner.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(parseUnits("1000000").div(3));

        balanceBefore = await token.balanceOf(player.address);
        await league.connect(player).withdrawReward();
        balanceAfter = await token.balanceOf(player.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(parseUnits("1000000").mul(2).div(3));
    });

    it("Setting the name of the league", async () => {
        await league.setName("New name");
        expect(await league.name()).to.equal("New name");
    });
});
