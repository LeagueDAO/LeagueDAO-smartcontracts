const { expect, use } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;
const { parseUnits } = ethers.utils;

const { time } = require("../helpers");

use(solidity);

describe("NomoLeague test upgrade contract", () => {
    let nft, router, league, league2, token1, token2, calculator;
    let owner, player, accounts;
    let NomoNFT, NomoRouter, NomoLeague, NomoRouterV1, NomoLeagueV1, ERC20Mock, NomoPointsCalculatorMock;

    beforeEach(async () => {
        [owner, player, ...accounts] = await ethers.getSigners();

        ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        NomoNFT = await ethers.getContractFactory("NomoNFT");
        NomoRouterV1 = await ethers.getContractFactory("NomoRouterV1");
        NomoLeagueV1 = await ethers.getContractFactory("NomoLeagueV1");
        NomoRouter = await ethers.getContractFactory("NomoRouter");
        NomoLeague = await ethers.getContractFactory("NomoLeague");
        NomoPointsCalculatorMock = await ethers.getContractFactory("NomoPointsCalculatorMock");

        token1 = await ERC20Mock.deploy();
        token2 = await ERC20Mock.deploy();
        nft = await NomoNFT.deploy();
        router = await upgrades.deployProxy(NomoRouterV1, [nft.address, token1.address, owner.address]);
        league = await upgrades.deployProxy(NomoLeagueV1, [router.address, "League", 10, 3]);
        await router.addLeague(league.address, 1);
        await league.nextGame(parseUnits("1000000"));

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

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        expect(await league.name()).to.equal("League");
    });

    it("Game is started", async () => {
        expect(await league.lastGameId()).to.equal(1);

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        expect(await league.lastGameId()).to.equal(1);
    });

    it("Can't finish game before it's end", async () => {
        await expect(league.nextGame(0)).to.be.revertedWith(
            "NomoLeague::startNewGame: previous game isn't finished yet"
        );

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await expect(league.nextGame([0])).to.be.revertedWith(
            "NomoLeague::startNewGame: previous game isn't finished yet"
        );
    });

    it("Can't distribute non-zero reward for zero players", async () => {
        await time.increase(await league.GAME_DURATION());
        await expect(league.nextGame(1)).to.be.revertedWith(
            "NomoLeague::startNewGame: can't distribute non-zero reward with zero players"
        );

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await expect(league.nextGame([1, 2])).to.be.revertedWith(
            "NomoLeague::startNewGame: can't distribute non-zero reward with zero players"
        );
    });

    it("Owner can add ERC20 token for rewards", async () => {
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);

        await expect(router.connect(player).addRewardTokens([token2.address])).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        await expect(league.connect(player).updateRewardTokensList()).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
        await league.connect(owner).updateRewardTokensList();
        await expect(league.connect(owner).updateRewardTokensList()).to.be.revertedWith("already updated");
    });

    it("Can't stake unstake or update points directly (bypassing router)", async () => {
        await expect(league.stakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.unstakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.updatePoints(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await expect(league.stakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.unstakeToken(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");

        await expect(league.updatePoints(owner.address, 1)).to.be.revertedWith("NomoLeague: sender isn't NomoRouter");
    });

    it("Can't stake more tokens than limit per player", async () => {
        await expect(router.stakeTokens([1, 2, 3, 4])).to.be.revertedWith(
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await expect(router.stakeTokens([1, 2, 3, 4])).to.be.revertedWith(
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );
    });

    it("Tokens staked to game in staking period give active points", async () => {
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await router.stakeTokens([1]);
        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(10);
        expect(player.pendingPoints).to.equal(0);
    });

    it("Tokens staked to game after staking period give pending points", async () => {
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await time.increase(await league.STAKING_DURATION());

        await router.stakeTokens([1]);
        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(0);
        expect(player.pendingPoints).to.equal(10);
    });

    it("Unstaking active and pending tokens works correct", async () => {
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await router.stakeTokens([1]);

        await time.increase(await league.STAKING_DURATION());

        await router.stakeTokens([2]);

        await router.unstakeTokens([1, 2]);

        player = await league.players(owner.address);
        expect(player.activePoints).to.equal(0);
        expect(player.pendingPoints).to.equal(0);
    });

    it("Updating points should work for active tokens", async () => {
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add updater
        await router.connect(owner).setUpdater(owner.address, true);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

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
        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add updater
        await router.connect(owner).setUpdater(owner.address, true);

        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

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

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(owner.address))[1]).to.equal(parseUnits("2000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(parseUnits("1000000").mul(1).div(3));
        expect((await league.totalRewardsOf(player.address))[1]).to.equal(parseUnits("2000000").mul(1).div(3));
    });

    it("Pending points become active in next games", async () => {
        await nft.transferFrom(owner.address, player.address, 2);
        await router.connect(player).stakeTokens([2]);

        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([1]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame(parseUnits("1000000"));

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        await time.increase(await league.GAME_DURATION());
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(owner.address))[1]).to.equal(parseUnits("2000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(
            parseUnits("1000000").add(parseUnits("1000000").mul(1).div(3))
        );
        expect((await league.totalRewardsOf(player.address))[1]).to.equal(parseUnits("2000000").mul(1).div(3));

        await time.increase(await league.GAME_DURATION());
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(
            parseUnits("1000000").mul(2).div(3).mul(2).add(1)
        );
        expect((await league.totalRewardsOf(owner.address))[1]).to.equal(
            parseUnits("2666666666666666666666666", "wei")
        );
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(
            parseUnits("1000000").add(parseUnits("1000000").mul(1).div(3).mul(2))
        );
        expect((await league.totalRewardsOf(player.address))[1]).to.equal(
            parseUnits("1333333333333333333333333", "wei")
        );
    });

    it("Movement of pending points can be enforced", async () => {
        await router.stakeTokens([1]);
        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([2]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame(parseUnits("1000000"));

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

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
        await token1.mint(league.address, parseUnits("1000000"));
        await league.nextGame(parseUnits("1000000"));

        const balanceBefore = await token1.balanceOf(owner.address);
        await league.withdrawReward();
        const balanceAfter = await token1.balanceOf(owner.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(parseUnits("1000000"));

        await nft.transferFrom(owner.address, player.address, 1);
        await router.connect(player).stakeTokens([1]);

        await time.increase(await league.GAME_DURATION());
        await token1.mint(league.address, parseUnits("1000000"));
        await league.nextGame(parseUnits("1000000"));

        router = await upgrades.upgradeProxy(router.address, NomoRouter);
        // after upgrade from v1 need add and first token
        await router.connect(owner).addRewardTokens([token1.address, token2.address]);
        league = await upgrades.upgradeProxy(league.address, NomoLeague);
        await league.connect(owner).updateRewardTokensList();

        let balanceBefore1 = await token1.balanceOf(owner.address);
        let balanceBefore2 = await token2.balanceOf(owner.address);
        await league.withdrawReward();
        let balanceAfter1 = await token1.balanceOf(owner.address);
        let balanceAfter2 = await token2.balanceOf(owner.address);
        expect(balanceAfter1.sub(balanceBefore1)).to.equal(parseUnits("1000000").div(3));
        expect(balanceAfter2.sub(balanceBefore2)).to.equal(0);

        balanceBefore1 = await token1.balanceOf(player.address);
        balanceBefore2 = await token2.balanceOf(player.address);
        await league.connect(player).withdrawReward();
        balanceAfter1 = await token1.balanceOf(player.address);
        balanceAfter2 = await token2.balanceOf(player.address);
        expect(balanceAfter1.sub(balanceBefore1)).to.equal(parseUnits("1000000").mul(2).div(3));
        expect(balanceAfter2.sub(balanceBefore2)).to.equal(0);
    });
});
