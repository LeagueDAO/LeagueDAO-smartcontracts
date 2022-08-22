const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = ethers.utils;

const { time } = require("../helpers");

describe("NomoLeague test rewards in many tokens", () => {
    let nft, router, league, token1, token2, calculator;
    let owner, player, accounts;
    let NomoNFT, NomoRouter, NomoLeague, ERC20Mock, NomoPointsCalculatorMock;

    beforeEach(async () => {
        [owner, player, ...accounts] = await ethers.getSigners();

        ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        NomoNFT = await ethers.getContractFactory("NomoNFT");
        NomoRouter = await ethers.getContractFactory("NomoRouter");
        NomoLeague = await ethers.getContractFactory("NomoLeague");
        NomoPointsCalculatorMock = await ethers.getContractFactory("NomoPointsCalculatorMock");

        token1 = await ERC20Mock.deploy();
        token2 = await ERC20Mock.deploy();
        nft = await NomoNFT.deploy();
        router = await NomoRouter.deploy();
        await router.initialize(nft.address, [token1.address, token2.address], owner.address);
        league = await NomoLeague.deploy();
        await league.initialize(router.address, "League", 10, 3);
        await router.addLeague(league.address, 1);
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

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

    it("Rewards should be only calculated for active points", async () => {
        await nft.transferFrom(owner.address, player.address, 2);
        await router.stakeTokens([1]);
        await router.connect(player).stakeTokens([2]);

        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([3]);

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
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        await time.increase(await league.GAME_DURATION());
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(owner.address))[1]).to.equal(parseUnits("2000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(
            parseUnits("1000000").add(parseUnits("1000000").mul(1).div(3))
        );
        expect((await league.totalRewardsOf(player.address))[1]).to.equal(
            parseUnits("2000000").add(parseUnits("2000000").mul(1).div(3))
        );

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
            parseUnits("3333333333333333333333333", "wei")
        );
    });

    it("Withdrawing rewards works correct", async () => {
        await router.stakeTokens([2]);
        await time.increase(await league.GAME_DURATION());
        await token1.mint(league.address, parseUnits("1000000"));
        await token2.mint(league.address, parseUnits("2000000"));
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        let balanceBefore1 = await token1.balanceOf(owner.address);
        let balanceBefore2 = await token2.balanceOf(owner.address);
        await league.withdrawReward();
        let balanceAfter1 = await token1.balanceOf(owner.address);
        let balanceAfter2 = await token2.balanceOf(owner.address);
        expect(balanceAfter1.sub(balanceBefore1)).to.equal(parseUnits("1000000"));
        expect(balanceAfter2.sub(balanceBefore2)).to.equal(parseUnits("2000000"));

        await nft.transferFrom(owner.address, player.address, 1);
        await router.connect(player).stakeTokens([1]);

        await time.increase(await league.GAME_DURATION());
        await token1.mint(league.address, parseUnits("1000000"));
        await token2.mint(league.address, parseUnits("2000000"));
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000")]);

        balanceBefore1 = await token1.balanceOf(owner.address);
        balanceBefore2 = await token2.balanceOf(owner.address);
        await league.withdrawReward();
        balanceAfter1 = await token1.balanceOf(owner.address);
        balanceAfter2 = await token2.balanceOf(owner.address);
        expect(balanceAfter1.sub(balanceBefore1)).to.equal(parseUnits("1000000").div(3));
        expect(balanceAfter2.sub(balanceBefore2)).to.equal(parseUnits("2000000").div(3));

        balanceBefore1 = await token1.balanceOf(player.address);
        balanceBefore2 = await token2.balanceOf(player.address);
        await league.connect(player).withdrawReward();
        balanceAfter1 = await token1.balanceOf(player.address);
        balanceAfter2 = await token2.balanceOf(player.address);
        expect(balanceAfter1.sub(balanceBefore1)).to.equal(parseUnits("1000000").mul(2).div(3));
        expect(balanceAfter2.sub(balanceBefore2)).to.equal(parseUnits("2000000").mul(2).div(3));
    });

    it("Owner can add ERC20 token for rewards", async () => {
        let token3 = await ERC20Mock.deploy();

        await expect(router.connect(player).addRewardTokens([token3.address])).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
        await router.connect(owner).addRewardTokens([token3.address]);
        await expect(league.connect(player).updateRewardTokensList()).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
        await league.connect(owner).updateRewardTokensList();
        await expect(league.connect(owner).updateRewardTokensList()).to.be.revertedWith("already updated");

        await nft.transferFrom(owner.address, player.address, 2);
        await router.stakeTokens([1]);
        await router.connect(player).stakeTokens([2]);

        await time.increase(await league.STAKING_DURATION());
        await router.stakeTokens([3]);

        await time.increase((await league.GAME_DURATION()).sub(await league.STAKING_DURATION()));
        await league.nextGame([parseUnits("1000000"), parseUnits("2000000"), parseUnits("3000000")]);

        expect((await league.totalRewardsOf(owner.address))[0]).to.equal(parseUnits("1000000").mul(2).div(3));
        expect((await league.totalRewardsOf(owner.address))[1]).to.equal(parseUnits("2000000").mul(2).div(3));
        expect((await league.totalRewardsOf(owner.address))[2]).to.equal(parseUnits("3000000").mul(2).div(3));
        expect((await league.totalRewardsOf(player.address))[0]).to.equal(parseUnits("1000000").mul(1).div(3));
        expect((await league.totalRewardsOf(player.address))[1]).to.equal(parseUnits("2000000").mul(1).div(3));
        expect((await league.totalRewardsOf(player.address))[2]).to.equal(parseUnits("3000000").mul(1).div(3));
    });
});
