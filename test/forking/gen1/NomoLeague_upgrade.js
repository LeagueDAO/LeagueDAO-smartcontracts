const hre = require("hardhat");
const { expect } = require("chai");
const { ethers, upgrades, getProxyAdminFactory } = require("hardhat");
const { parseUnits } = ethers.utils;

const { time } = require("../../helpers");

if (hre.config.networks.hardhat.forking.enabled) {
    describe("NomoLeague and NomoRouter upgrade contracts", () => {
        it("Withdrawing rewards works correct after upgrade", async () => {
            let router, league, rewardDAI, rewardUsdMock;
            let ERC20Mock;

            ERC20Mock = await ethers.getContractFactory("ERC20Mock");

            rewardDAI = await ethers.getContractAt("ERC20", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
            router = await ethers.getContractAt("NomoRouterV1", "0x14ca85D26a67Be9Ef38a659ec150E9a5Ea82350a");
            league = await ethers.getContractAt("NomoLeagueV1", "0x0E6dD5Cd59c436313AAe4ebE9622F6486776E477");

            const ownerAddress = await router.owner();
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ownerAddress]
            });
            const owner = await ethers.getSigner(ownerAddress);

            rewardUsdMock = await ERC20Mock.connect(owner).deploy();

            const daiWhaleAddress = "0x49854708a8c42eeb837a97dd97d597890ceb1334";
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [daiWhaleAddress]
            });
            const daiWhale = await ethers.getSigner(daiWhaleAddress);

            await rewardDAI.connect(daiWhale).transfer(league.address, parseUnits("1000000"));
            await rewardUsdMock.connect(owner).mint(league.address, parseUnits("2000000"));

            let playerWithRewardAddress;
            let stackedTokenId = 0;
            while (stackedTokenId < 10000) {
                playerWithRewardAddress = await router.stakers(stackedTokenId++);
                if (playerWithRewardAddress !== "0x0000000000000000000000000000000000000000") {
                    const rewardsAmount = await league.totalRewardOf(playerWithRewardAddress);
                    if (rewardsAmount > 0) {
                        break;
                    }
                }
            }
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [playerWithRewardAddress]
            });
            const playerWithReward = await ethers.getSigner(playerWithRewardAddress);

            const NomoRouter = (await ethers.getContractFactory("NomoRouter")).connect(owner);
            const NomoLeague = (await ethers.getContractFactory("NomoLeague")).connect(owner);

            router = await upgrades.upgradeProxy(router.address, NomoRouter);
            // after upgrade from v1 need add and first token
            await router.connect(owner).addRewardTokens([rewardDAI.address, rewardUsdMock.address]);
            league = await upgrades.upgradeProxy(league.address, NomoLeague);
            await league.connect(owner).updateRewardTokensList();

            expect(await league.name()).to.equal("Fantasy Football");
            expect(await router.rewardTokens(0)).to.equal(rewardDAI.address);
            expect(await router.rewardTokens(1)).to.equal(rewardUsdMock.address);

            const balanceBeforeDAI = await rewardDAI.balanceOf(playerWithReward.address);
            const balanceBeforeUsdMock = await rewardUsdMock.balanceOf(playerWithReward.address);

            await time.increase(await league.GAME_DURATION());

            await league.connect(owner).nextGame([parseUnits("1000000"), parseUnits("2000000")]);

            await league.connect(playerWithReward).withdrawReward();

            expect(await rewardDAI.balanceOf(playerWithReward.address)).to.gt(balanceBeforeDAI);
            expect(await rewardUsdMock.balanceOf(playerWithReward.address)).to.gt(balanceBeforeUsdMock);
        });
    });
} else {
    console.log("The NomoLeague Upgrade test assume the launch on the forking network.");
}
