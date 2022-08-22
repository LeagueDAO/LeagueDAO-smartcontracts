const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = ethers.utils;

const { time } = require("../helpers");

describe("NomoLeague test", () => {
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
        await calculator.setPoints(1, 1);
        await nft.createCardImage("Kokorin", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 2);
        await calculator.setPoints(2, 1);
        await nft.createCardImage("Litvin", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 3);
        await calculator.setPoints(3, 1);
        await nft.createCardImage("Randomguy", "url", 1, 1, 1, 1);
        await nft.mintCard(owner.address, 4);
        await calculator.setPoints(4, 1);

        await nft.setApprovalForAll(router.address, true);
        await nft.connect(player).setApprovalForAll(router.address, true);
    });

    it("Tokens limit can be updated and withdrawing rewards will work correct", async () => {
        await league.setTokenLimitPerPlayer(2);
        await expect(router.stakeTokens([1, 2, 3])).to.be.revertedWith(
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );
        await router.stakeTokens([3]);
        await time.increase(await league.GAME_DURATION());
        await token.mint(league.address, parseUnits("1000000"));
        await league.nextGame([parseUnits("1000000")]);

        let balanceBefore = await token.balanceOf(owner.address);
        await league.withdrawReward();
        let balanceAfter = await token.balanceOf(owner.address);
        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(parseUnits("1000000").toString());

        await nft.transferFrom(owner.address, player.address, 1);
        await nft.transferFrom(owner.address, player.address, 2);
        await nft.transferFrom(owner.address, player.address, 4);
        await expect(router.connect(player).stakeTokens([1, 2, 4])).to.be.revertedWith(
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );
        await league.setTokenLimitPerPlayer(3);
        await router.connect(player).stakeTokens([1, 2, 4]);

        await time.increase(await league.GAME_DURATION());
        await token.mint(league.address, parseUnits("1000000"));
        await league.nextGame([parseUnits("1000000")]);

        balanceBefore = await token.balanceOf(owner.address);
        await league.withdrawReward();
        balanceAfter = await token.balanceOf(owner.address);
        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(parseUnits("1000000").div(4).toString());

        balanceBefore = await token.balanceOf(player.address);
        await league.connect(player).withdrawReward();
        balanceAfter = await token.balanceOf(player.address);
        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(parseUnits("1000000").div(4).mul(3).toString());
    });
});
