const { expect, use } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

const { time } = require("../helpers");

use(solidity);

describe("NomoRouter test", () => {
    let nft, router, league, token, calculator;
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
        calculator = await NomoPointsCalculatorMock.deploy();
        await router.initialize(nft.address, [token.address], owner.address);
        await router.setCalculator(1, calculator.address);
    });

    describe("General", () => {
        it("NFT is correct", async () => {
            expect(await router.nft()).to.equal(nft.address);
        });

        it("Reward token is correct", async () => {
            expect(await router.rewardTokens(0)).to.equal(token.address);
        });
    });

    describe("Configuration", () => {
        it("Only owner can set updater", async () => {
            await expect(router.connect(player).setUpdater(player.address, true)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Owner can set updater correct", async () => {
            const tx = await router.setUpdater(player.address, true);
            await expect(tx).to.emit(router, "UpdaterUpdated").withArgs(player.address, true);
            await expect(await router.updaters(player.address)).to.be.true;
        });

        it("Only owner can set calculator", async () => {
            await expect(router.connect(player).setCalculator(2, player.address)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Owner can set calculator correct", async () => {
            const tx = await router.setCalculator(2, player.address);
            await expect(tx).to.emit(router, "CalculatorUpdated").withArgs(2, player.address);
            expect(await router.calculator(2)).to.equal(player.address);
        });
    });

    describe("Total reward", () => {
        beforeEach(async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);
            await league.nextGame([0]);

            await nft.setPosition(1, "Position #1");
            await nft.createCardImage("Jordan", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 1);
            await calculator.setPoints(1, 10);

            await nft.connect(player).setApprovalForAll(router.address, true);
            await router.connect(player).stakeTokens([1]);

            await time.increase(7 * 24 * 60 * 60);
        });

        it("Initial total reward is zero", async () => {
            expect((await router.totalRewardsOf(player.address))[0]).to.equal(0);
        });

        it("After distribution total reward is updated", async () => {
            await league.nextGame([1000]);
            expect((await router.totalRewardsOf(player.address))[0]).to.equal(1000);
        });

        it("Should withdraw rewards", async () => {
            await league.nextGame([1000]);
            await token.transfer(league.address, 1000);
            await router.connect(player).withdrawRewards();
            expect(await token.balanceOf(player.address)).to.be.equal(1000);
        });
    });

    describe("Updating points", () => {
        beforeEach(async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            await nft.setPosition(1, "Position #1");
            await nft.createCardImage("Jordan", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 1);
            await calculator.setPoints(1, 10);

            await nft.connect(player).setApprovalForAll(router.address, true);
            await router.connect(player).stakeTokens([1]);

            await calculator.setPoints(1, 15);
        });

        it("Only updater can update points", async () => {
            await expect(router.connect(player).updatePoints(1)).to.be.revertedWith(
                "NomoRouter: caller is not the updater"
            );
        });

        it("Only updater can update points batch", async () => {
            await expect(router.connect(player).updatePointsBatch([1])).to.be.revertedWith(
                "NomoRouter: caller is not the updater"
            );
        });

        it("Updater can update points correct", async () => {
            await router.updatePoints(1);
        });

        it("Updater can update points batch correct", async () => {
            await router.updatePointsBatch([1]);
        });

        it("Updating points for non-staked token works", async () => {
            await nft.createCardImage("Other", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 2);

            await router.updatePoints(2);
        });
    });

    describe("Leagues management", () => {
        it("Initially league array is empty", async () => {
            const leagueIds = await router.leagueIds();
            expect(leagueIds.length).to.equal(0);
        });

        it("Only owner can add league", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await expect(router.connect(player).addLeague(league.address, 1)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Owner can add new league", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            const leagueIds = await router.leagueIds();
            expect(leagueIds.length).to.equal(1);
            expect(leagueIds[0]).to.equal(1);
        });

        it("Can't add league with duplicating ID", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            await expect(router.addLeague(league.address, 1)).to.be.revertedWith(
                "NomoRouter::addLeague: can't add league with the same id"
            );
        });

        it("Only owner can remove league", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            await expect(router.connect(player).removeLeague(1)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Owner can remove league", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            await router.removeLeague(1);

            const leagueIds = await router.leagueIds();
            expect(leagueIds.length).to.equal(0);
        });

        it("Can remove not only league", async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            let league2 = await NomoLeague.deploy();
            await league2.initialize(router.address, "Another League", 10, 10);
            await router.addLeague(league2.address, 2);

            await router.removeLeague(2);

            const leagueIds = await router.leagueIds();
            expect(leagueIds.length).to.equal(1);
            expect(leagueIds[0]).to.equal(1);
        });

        it("Can't remove non-existent league", async () => {
            await expect(router.removeLeague(1)).to.be.revertedWith(
                "NomoRoute::removeLeague: no league with such leagueId exists"
            );
        });
    });

    describe("Tokens staking", () => {
        beforeEach(async () => {
            league = await NomoLeague.deploy();
            await league.initialize(router.address, "The League", 10, 10);
            await router.addLeague(league.address, 1);

            await nft.setPosition(1, "Position #1");
            await nft.createCardImage("Ronaldo", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 1);
            await calculator.setPoints(1, 10);
            await nft.createCardImage("Kokorin", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 2);
            await calculator.setPoints(2, 5);
            await nft.createCardImage("Litvin", "url", 1, 1, 1, 1);
            await nft.mintCard(player.address, 3);
            await calculator.setPoints(3, 3);

            await nft.connect(player).setApprovalForAll(router.address, true);
        });

        it("Impossible to stake without approval", async () => {
            await nft.connect(player).setApprovalForAll(router.address, false);
            await expect(router.connect(player).stakeTokens([1])).to.be.revertedWith(
                "ERC721: transfer caller is not owner nor approved"
            );
        });

        it("Can't stake to non-existent league", async () => {
            await nft.setPosition(1, "Position #1");
            await nft.createCardImage("Ronaldo", "url", 2, 1, 1, 1);
            await nft.mintCard(player.address, 4);

            await expect(router.connect(player).stakeTokens([4])).to.be.revertedWith(
                "NomoRouter::stakeToken: can't stake to non-existent league"
            );
        });

        it("Player can stake his token", async () => {
            await router.connect(player).stakeTokens([1]);

            expect(await router.stakers(1)).to.equal(player.address);
            player = await league.players(player.address);
            expect(player.pendingPoints).to.equal(10);
        });

        it("Staking multiple tokens work", async () => {
            await router.connect(player).stakeTokens([1, 2, 3]);

            expect(await router.stakers(1)).to.equal(player.address);
            expect(await router.stakers(2)).to.equal(player.address);
            expect(await router.stakers(3)).to.equal(player.address);
            player = await league.players(player.address);
            expect(player.pendingPoints).to.equal(18);
        });

        it("Player can't unstake token that he didn't stake", async () => {
            await expect(router.connect(player).unstakeTokens([1])).to.be.revertedWith(
                "NomoRouter::unstakeToken: sender doesn't have token in stake"
            );
        });

        it("Player can unstake his token", async () => {
            await router.connect(player).stakeTokens([1]);
            await router.connect(player).unstakeTokens([1]);

            expect(await router.stakers(1)).to.equal(ethers.constants.AddressZero);
        });

        it("Player can unstake multiple tokens", async () => {
            await router.connect(player).stakeTokens([1, 2, 3]);
            await router.connect(player).unstakeTokens([1, 2, 3]);

            expect(await router.stakers(1)).to.equal(ethers.constants.AddressZero);
            expect(await router.stakers(2)).to.equal(ethers.constants.AddressZero);
            expect(await router.stakers(3)).to.equal(ethers.constants.AddressZero);
        });

        it("Player can stake tokens to different leagues", async () => {
            let league2 = await NomoLeague.deploy();
            await league2.initialize(router.address, "Another League", 10, 10);
            await router.addLeague(league2.address, 2);

            await nft.createCardImage("Jordan", "url", 2, 1, 1, 1);
            await nft.mintCard(player.address, 4);
            await calculator.setPoints(4, 10);

            await router.connect(player).stakeTokens([1, 4]);
            expect(await router.stakers(1)).to.equal(player.address);
            expect(await router.stakers(4)).to.equal(player.address);
        });
    });
});
