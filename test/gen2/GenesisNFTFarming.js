const { expect, use } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("../helpers");

const { AddressZero } = ethers.constants;

use(solidity);

describe("GenesisNFTFarming", function () {
    let snapshotA;
    let deployer, owner, user;
    let erc721, rewardKeeper, erc20Mock, erc20Mock2;

    const DUST_DEFAULT = 1e12;
    let defaultDeadline;

    let cardID, tokenOwner, tokenID;

    before(async () => {
        [deployer, user] = await ethers.getSigners();

        // Deployment of the Genesis ERC721 contract
        const NomoNFT = await ethers.getContractFactory("NomoNFT");
        erc721 = await NomoNFT.deploy();
        await erc721.deployTransaction.wait();

        // Preparation for token minting
        const parameterNames = new Array(10).fill().map((elem, i) => `Parameter #${i}`);
        await erc721.createParametersSet(parameterNames);

        const positionCode = 0; // Player's position code (number)
        await erc721.setPosition(positionCode, "Position #0");

        // const tx =
        await erc721.createCardImage(
            "Some Name",
            URL_EXAMPLE,
            //111, // League
            0,
            //222, // Generation
            0,
            positionCode,
            1 // Set ID
        );
        // const receipt = await tx.wait();
        // receipt.events.forEach(event => {
        //     if (event.event == "NewCardImageCreated") // Search for the necessary event
        //         cardID = event.args._cardImageId; // 1
        // });
        cardID = 1;

        // Minting of a token
        tokenOwner = user;
        await erc721.mintCard(tokenOwner.address, cardID);
        tokenID = 1;

        // Deployment of the GenesisNFTFarming contract
        const GenesisNFTFarming = await ethers.getContractFactory("GenesisNFTFarming");
        rewardKeeper = await GenesisNFTFarming.deploy();
        await rewardKeeper.deployTransaction.wait();

        // Initialization of the GenesisNFTFarming contract
        owner = deployer;
        defaultDeadline = toBN(await time.latest()).add(toBN(time.duration.days(14)));
        await rewardKeeper.connect(owner).initialize(erc721.address, defaultDeadline);

        // Deployment of ERC20 reward tokens
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        erc20Mock = await ERC20Mock.deploy();
        await erc20Mock.deployTransaction.wait();

        erc20Mock2 = await ERC20Mock.deploy();
        await erc20Mock2.deployTransaction.wait();

        snapshotA = await snapshot();
    });

    afterEach(async () => await snapshotA.restore());

    it("sets the deployer as the initial owner, the dust, deadline, ERC721 address values when initialization", async () => {
        // Deployment
        const GenesisNFTFarming = await ethers.getContractFactory("GenesisNFTFarming");
        const rewardKeeper = await GenesisNFTFarming.deploy();
        await rewardKeeper.deployTransaction.wait();

        // Check of values before initialization
        expect(await rewardKeeper.owner()).to.be.eq(AddressZero);
        expect(await rewardKeeper.erc721()).to.be.eq(AddressZero);
        expect(await rewardKeeper.dust()).to.be.eq(0);
        expect(await rewardKeeper.deadline()).to.be.eq(0);

        // Initialization
        const tx = await rewardKeeper.connect(deployer).initialize(erc721.address, defaultDeadline);
        await expect(tx).to.emit(rewardKeeper, "ERC721Setting").withArgs(erc721.address);
        await expect(tx).to.emit(rewardKeeper, "DustSetting").withArgs(DUST_DEFAULT);
        await expect(tx).to.emit(rewardKeeper, "DeadlineExtensionTo").withArgs(defaultDeadline);

        // Check of values after initialization
        expect(await rewardKeeper.owner()).to.be.eq(deployer.address);
        expect(await rewardKeeper.erc721()).to.be.eq(erc721.address);
        expect(await rewardKeeper.dust()).to.be.eq(DUST_DEFAULT);
        expect(await rewardKeeper.deadline()).to.be.eq(defaultDeadline);
    });

    describe("[ERC20 reward token whitelist functionality]", function () {
        it("allows a token", async () => {
            expect(await rewardKeeper.isAllowedToken(erc20Mock.address)).to.be.false;

            const tx = await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await expect(tx).to.emit(rewardKeeper, "TokenAllowing").withArgs(erc20Mock.address);

            expect(await rewardKeeper.isAllowedToken(erc20Mock.address)).to.be.true;
            expect(await rewardKeeper.allowedTokens(0)).to.be.eq(erc20Mock.address);
        });

        it("prevents non-owners from allowing a token", async () => {
            await expect(rewardKeeper.connect(user).allowToken(erc20Mock.address)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("reverts when allowing if the token has already allowed", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // The first allowing

            expect(await rewardKeeper.isAllowedToken(erc20Mock.address)).to.be.true;
            await expect(rewardKeeper.connect(owner).allowToken(erc20Mock.address)).to.be.revertedWith(
                "The token has already allowed"
            );
        });

        it("disallows a token", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // Allowing

            const tx = await rewardKeeper.connect(owner).disallowToken(erc20Mock.address);
            await expect(tx).to.emit(rewardKeeper, "TokenDisallowing").withArgs(erc20Mock.address);

            expect(await rewardKeeper.isAllowedToken(erc20Mock.address)).to.be.false;
        });

        it("correctly deletes a token from the list when disallowing if some tokens", async () => {
            // Deployment of the third and fourth ERC20 reward tokens
            const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
            const erc20Mock3 = await ERC20Mock.deploy();
            await erc20Mock3.deployTransaction.wait();
            const erc20Mock4 = await ERC20Mock.deploy();
            await erc20Mock4.deployTransaction.wait();

            // Allowing
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock2.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock4.address);
            expect(await rewardKeeper.getAllowedTokens()).to.be.deep.eq([
                erc20Mock.address,
                erc20Mock2.address,
                erc20Mock3.address,
                erc20Mock4.address
            ]);

            // Deletion from the beginning when disallowing
            await rewardKeeper.connect(owner).disallowToken(erc20Mock.address);
            expect(await rewardKeeper.getAllowedTokens()).to.be.deep.eq([
                erc20Mock4.address,
                erc20Mock2.address,
                erc20Mock3.address
            ]);

            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            expect(await rewardKeeper.getAllowedTokens()).to.be.deep.eq([
                erc20Mock4.address,
                erc20Mock2.address,
                erc20Mock3.address,
                erc20Mock.address
            ]);

            // Deletion from the end when disallowing
            await rewardKeeper.connect(owner).disallowToken(erc20Mock.address);
            expect(await rewardKeeper.getAllowedTokens()).to.be.deep.eq([
                erc20Mock4.address,
                erc20Mock2.address,
                erc20Mock3.address
            ]);

            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);

            // Deletion from the middle when disallowing
            await rewardKeeper.connect(owner).disallowToken(erc20Mock2.address);
            expect(await rewardKeeper.getAllowedTokens()).to.be.deep.eq([
                erc20Mock4.address,
                erc20Mock.address,
                erc20Mock3.address
            ]);
        });

        it("prevents non-owners from disallowing a token", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);

            await expect(rewardKeeper.connect(user).disallowToken(erc20Mock.address)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("reverts when disallowing if the token is not allowed", async () => {
            await expect(rewardKeeper.connect(owner).disallowToken(erc20Mock.address)).to.be.revertedWith(
                "The token is not allowed"
            );
        });

        it("reverts when disallowing if there are someone else's rewards", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // Allowing
            // Adding od rewards
            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);

            await expect(rewardKeeper.connect(owner).disallowToken(erc20Mock.address)).to.be.revertedWith(
                "There are someone else's rewards"
            );
        });

        it("returns the list of allowed tokens", async () => {
            // Allowing
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock2.address);

            const res = await rewardKeeper.getAllowedTokens();
            expect(res).to.be.deep.eq([erc20Mock.address, erc20Mock2.address]);
        });
    });

    describe("[Adding of a reward and getting of its value]", function () {
        it("adds a reward", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // Allowing of a token

            expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(0);

            // Adding of a reward
            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            const tx = await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);
            await expect(tx).to.emit(rewardKeeper, "RewardAdding").withArgs(cardID, erc20Mock.address, value);

            // Check of values
            expect(await erc20Mock.balanceOf(rewardKeeper.address)).to.be.eq(value);
            expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(value);
        });

        it("adds a reward twice for the same card ID", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // Allowing of a token

            // The first adding of a reward
            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);
            // The second adding of a reward
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);

            // Check of values
            const sumValue = value.mul(2);
            expect(await erc20Mock.balanceOf(rewardKeeper.address)).to.be.eq(sumValue);
            expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(sumValue);
        });

        it("reverts when adding a reward if the token is not allowed", async () => {
            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await expect(rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value)).to.be.revertedWith(
                "The token is not allowed"
            );
        });

        it("reverts when adding a reward if unknown card ID", async () => {
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address); // Allowing of a token

            const unknown = toBN(cardID).add(1);
            expect(await erc721.cardImageToExistence(unknown)).to.be.false;

            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await expect(rewardKeeper.connect(owner).addReward(unknown, erc20Mock.address, value)).to.be.revertedWith(
                "Unknown card ID"
            );
        });

        it("returns a reward value if it is greater than the dust, otherwise returns zero", async () => {
            // Allowing of tokens
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock2.address);

            // Adding of a reward
            const value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);

            // Returning of a value
            expect(await rewardKeeper.rewardValue(cardID, erc20Mock.address)).to.be.eq(value);

            // Adding of a dust reward
            const dust = (await rewardKeeper.dust()).sub(1);
            await erc20Mock2.connect(owner).approve(rewardKeeper.address, dust);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock2.address, dust);

            expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(dust);
            // Returning of zero
            expect(await rewardKeeper.rewardValue(cardID, erc20Mock2.address)).to.be.eq(0);
        });
    });

    describe("[Extension of the deadline]", function () {
        it("extends the deadline", async () => {
            expect(await rewardKeeper.deadline()).to.be.eq(defaultDeadline);

            // Extension
            const newDeadline = defaultDeadline.add(toBN(time.duration.days(1)));
            const tx = await rewardKeeper.connect(owner).extendDeadlineTo(newDeadline);
            expect(tx).to.emit(rewardKeeper, "DeadlineExtensionTo").withArgs(newDeadline);

            expect(await rewardKeeper.deadline()).to.be.eq(newDeadline);
        });

        it("prevents non-owners from extension the deadline", async () => {
            const newDeadline = defaultDeadline.add(toBN(time.duration.days(1)));
            await expect(rewardKeeper.connect(user).extendDeadlineTo(newDeadline)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("reverts when extension if an uncorrect deadline", async () => {
            const tooSmall = toBN(await time.latest()).sub(10);
            await expect(rewardKeeper.connect(owner).extendDeadlineTo(tooSmall)).to.be.revertedWith(
                "Uncorrect deadline"
            );

            const DAY = 86400;
            const tooLarge = toBN(await time.latest())
                .add(+DAY * 28)
                .add(10);
            await expect(rewardKeeper.connect(owner).extendDeadlineTo(tooLarge)).to.be.revertedWith(
                "Uncorrect deadline"
            );
        });

        it("reverts when extension if a new deadline is less than the current", async () => {
            // The first extension
            const newDeadline = defaultDeadline.add(toBN(time.duration.days(1)));
            await rewardKeeper.connect(owner).extendDeadlineTo(newDeadline);

            await expect(rewardKeeper.connect(owner).extendDeadlineTo(newDeadline.sub(1))).to.be.revertedWith(
                "The deadline should be greater than the current deadline"
            );
        });
    });

    describe("[Setting of the dust]", function () {
        it("sets the dust", async () => {
            expect(await rewardKeeper.dust()).to.be.eq(DUST_DEFAULT);

            // Setting
            const newDust = 0;
            const tx = await rewardKeeper.connect(owner).setDust(newDust);
            expect(tx).to.emit(rewardKeeper, "DustSetting").withArgs(newDust);

            expect(await rewardKeeper.dust()).to.be.eq(newDust);
        });

        it("prevents non-owners from setting the dust", async () => {
            const newDust = 0;
            await expect(rewardKeeper.connect(user).setDust(newDust)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("reverts when setting if an uncorrect dust", async () => {
            const tooLarge = units(1, 17);
            await expect(rewardKeeper.connect(owner).setDust(tooLarge)).to.be.revertedWith("Uncorrect dust");
        });
    });

    describe("[Withdrawal of rewards]", function () {
        let value, recipient;

        beforeEach(async () => {
            // Allowing of tokens
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock2.address);

            // The first adding of a reward
            value = units(1);
            recipient = user;
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);
            // The second adding of a reward
            await erc20Mock2.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock2.address, value);
        });

        context("before the deadline", () => {
            describe("[Rewards]", function () {
                it("withdraws rewards", async () => {
                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(0);

                    // Withdrawal
                    const tx = await rewardKeeper.connect(recipient).withdrawRewards(tokenID);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock.address, value);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock2.address, value);

                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(0);
                });

                it("does not withdraw a reward if it is less than the dust", async () => {
                    // Deployment of the third ERC20 reward token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();
                    // Allowing of tokens
                    await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                    // Adding of a dust reward
                    const dust = (await rewardKeeper.dust()).sub(1);
                    await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                    await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                    const contractBal = await erc20Mock3.balanceOf(rewardKeeper.address);

                    // Withdrawal
                    const tx = await rewardKeeper.connect(recipient).withdrawRewards(tokenID);
                    const receipt = await tx.wait();
                    /*
                     * List of events: Transfer, RewardWithdrawal, Transfer, RewardWithdrawal, ....
                     * Thus, the necessary: receipt.events[1].args, receipt.events[3].args, ....
                     * Check of events witch have the `value` parameter.
                     */
                    receipt.events.forEach((event) => {
                        // If it has the `value` parameter
                        if (event.args !== undefined && event.args.value !== undefined)
                            expect(event.args.value).to.be.not.eq(dust);
                    });

                    expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await erc20Mock3.balanceOf(rewardKeeper.address)).to.be.eq(contractBal);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock3.address)).to.be.eq(dust);
                });

                it("reverts when withdrawal of rewards if the caller is not the token owner", async () => {
                    expect(await erc721.ownerOf(tokenID)).to.be.not.eq(owner.address);

                    await expect(rewardKeeper.connect(owner).withdrawRewards(tokenID)).to.be.revertedWith(
                        "The address is not the owner of the token ID"
                    );
                });
            });

            describe("[A specified reward]", function () {
                it("withdraws a specified reward", async () => {
                    // The first reward
                    let tx = await rewardKeeper.connect(recipient).withdrawReward(tokenID, erc20Mock.address);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock.address, value);

                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(value);

                    // The second reward
                    tx = await rewardKeeper.connect(recipient).withdrawReward(tokenID, erc20Mock2.address);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock2.address, value);

                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(0);
                });

                it("does not withdraw a specified reward if it is less than the dust", async () => {
                    // Deployment of the third ERC20 reward token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();
                    // Allowing of tokens
                    await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                    // Adding of a dust reward
                    const dust = (await rewardKeeper.dust()).sub(1);
                    await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                    await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                    const contractBal = await erc20Mock3.balanceOf(rewardKeeper.address);

                    // Withdrawal
                    const tx = await rewardKeeper.connect(recipient).withdrawReward(tokenID, erc20Mock3.address);
                    await expect(tx).to.not.emit(rewardKeeper, "RewardWithdrawal");

                    expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await erc20Mock3.balanceOf(rewardKeeper.address)).to.be.eq(dust);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock3.address)).to.be.eq(contractBal);
                });

                it("reverts when withdrawal of a specified reward if the token is not allowed", async () => {
                    // Deployment of the third ERC20 token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();

                    await expect(
                        rewardKeeper.connect(recipient).withdrawReward(tokenID, erc20Mock3.address)
                    ).to.be.revertedWith("The token is not allowed");
                });

                it("reverts when withdrawal of a specified reward if the caller is not the token owner", async () => {
                    expect(await erc721.ownerOf(tokenID)).to.be.not.eq(owner.address);

                    await expect(
                        rewardKeeper.connect(owner).withdrawReward(tokenID, erc20Mock.address)
                    ).to.be.revertedWith("The address is not the owner of the token ID");
                });
            });

            describe("[Rewards for a user]", function () {
                it("withdraws rewards for a user", async () => {
                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(0);

                    // Withdrawal for a user by the contract owner
                    const tx = await rewardKeeper.connect(owner).withdrawRewardsFor(tokenID, recipient.address);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock.address, value);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock2.address, value);

                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(0);
                });

                it("does not withdraw a reward for a user if it is less than the dust", async () => {
                    // Deployment of the third ERC20 reward token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();
                    // Allowing of tokens
                    await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                    // Adding of a dust reward
                    const dust = (await rewardKeeper.dust()).sub(1);
                    await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                    await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                    // Withdrawal for a user by the contract owner
                    const tx = await rewardKeeper.connect(owner).withdrawRewardsFor(tokenID, recipient.address);
                    const receipt = await tx.wait();
                    /*
                     * List of events: Transfer, RewardWithdrawal, Transfer, RewardWithdrawal, ....
                     * Thus, the necessary: receipt.events[1].args, receipt.events[3].args, ....
                     * Check of events witch have the `value` parameter.
                     */
                    receipt.events.forEach((event) => {
                        // If it has the `value` parameter
                        if (event.args !== undefined && event.args.value !== undefined)
                            expect(event.args.value).to.be.not.eq(dust);
                    });

                    expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock3.address)).to.be.eq(dust);
                });

                it("prevents non-owners from withdrawal of rewards for a user", async () => {
                    await expect(
                        rewardKeeper.connect(user).withdrawRewardsFor(tokenID, recipient.address)
                    ).to.be.revertedWith("Ownable: caller is not the owner");
                });

                it("reverts when withdrawal of rewards for a user if a recipient is not the token owner", async () => {
                    expect(await erc721.ownerOf(tokenID)).to.be.not.eq(owner.address);

                    await expect(
                        rewardKeeper.connect(owner).withdrawRewardsFor(tokenID, owner.address)
                    ).to.be.revertedWith("The address is not the owner of the token ID");
                });
            });

            describe("[A specified reward for a user]", function () {
                it("withdraws a specified reward for a user", async () => {
                    let tx = await rewardKeeper
                        .connect(owner)
                        .withdrawRewardFor(tokenID, recipient.address, erc20Mock.address);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock.address, value);

                    expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(value);

                    tx = await rewardKeeper
                        .connect(owner)
                        .withdrawRewardFor(tokenID, recipient.address, erc20Mock2.address);
                    await expect(tx)
                        .to.emit(rewardKeeper, "RewardWithdrawal")
                        .withArgs(cardID, recipient.address, erc20Mock2.address, value);

                    expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(value);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock2.address)).to.be.eq(0);
                });

                it("does not withdraw a specified reward for a user if it is less than the dust", async () => {
                    // Deployment of the third ERC20 reward token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();
                    // Allowing of tokens
                    await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                    // Adding of a dust reward
                    const dust = (await rewardKeeper.dust()).sub(1);
                    await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                    await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                    // Withdrawal for a user by the contract owner
                    const tx = await rewardKeeper
                        .connect(owner)
                        .withdrawRewardFor(tokenID, recipient.address, erc20Mock3.address);
                    await expect(tx).to.not.emit(rewardKeeper, "RewardWithdrawal");

                    expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(0);
                    expect(await rewardKeeper.rewards(cardID, erc20Mock3.address)).to.be.eq(dust);
                });

                it("prevents non-owners from withdrawal of a specified reward for a user", async () => {
                    await expect(
                        rewardKeeper.connect(user).withdrawRewardFor(tokenID, recipient.address, erc20Mock.address)
                    ).to.be.revertedWith("Ownable: caller is not the owner");
                });

                it("reverts when withdrawal of a specified reward for a user if the token is not allowed", async () => {
                    // Deployment of the third ERC20 token
                    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                    const erc20Mock3 = await ERC20Mock.deploy();
                    await erc20Mock3.deployTransaction.wait();

                    await expect(
                        rewardKeeper.connect(owner).withdrawRewardFor(tokenID, recipient.address, erc20Mock3.address)
                    ).to.be.revertedWith("The token is not allowed");
                });

                it("reverts when withdrawal of a specified reward for a user if a recipient is not the token owner", async () => {
                    expect(await erc721.ownerOf(tokenID)).to.be.not.eq(owner.address);

                    await expect(
                        rewardKeeper.connect(owner).withdrawRewardFor(tokenID, owner.address, erc20Mock.address)
                    ).to.be.revertedWith("The address is not the owner of the token ID");
                });
            });
        });

        context("after the deadline", () => {
            const MSG = "Only available before the deadline";

            beforeEach(async () => await time.increaseTo(defaultDeadline.add(1).toString()));

            it("reverts when withdrawal of rewards", async () => {
                await expect(rewardKeeper.connect(recipient).withdrawRewards(tokenID)).to.be.revertedWith(MSG);
            });

            it("reverts when withdrawal of a specified reward", async () => {
                await expect(
                    rewardKeeper.connect(recipient).withdrawReward(tokenID, erc20Mock.address)
                ).to.be.revertedWith(MSG);
            });
        });
    });

    describe("[Withdrawal of balances]", function () {
        let value, recipient;

        beforeEach(async () => {
            // Allowing of tokens
            await rewardKeeper.connect(owner).allowToken(erc20Mock.address);
            await rewardKeeper.connect(owner).allowToken(erc20Mock2.address);

            // The first adding of a reward
            value = units(1);
            await erc20Mock.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock.address, value);
            // The second adding of a reward
            await erc20Mock2.connect(owner).approve(rewardKeeper.address, value);
            await rewardKeeper.connect(owner).addReward(cardID, erc20Mock2.address, value);

            recipient = owner;
        });

        context("after the deadline", () => {
            beforeEach(async () => await time.increaseTo(defaultDeadline.add(1).toString()));

            it("withdraws balances", async () => {
                const bal1 = await erc20Mock.balanceOf(recipient.address);
                const bal2 = await erc20Mock2.balanceOf(recipient.address);

                const tx = await rewardKeeper.connect(owner).withdrawBalances(recipient.address);
                await expect(tx)
                    .to.emit(rewardKeeper, "BalanceWithdrawal")
                    .withArgs(recipient.address, erc20Mock.address, value);
                await expect(tx)
                    .to.emit(rewardKeeper, "BalanceWithdrawal")
                    .withArgs(recipient.address, erc20Mock2.address, value);

                expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(bal1.add(value));
                expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(bal2.add(value));
            });

            it("does not withdraw a balance if it is less than the dust", async () => {
                // Deployment of the third ERC20 reward token
                const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                const erc20Mock3 = await ERC20Mock.deploy();
                await erc20Mock3.deployTransaction.wait();
                // Allowing of tokens
                await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                // Adding of a dust reward
                const dust = (await rewardKeeper.dust()).sub(1);
                await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                const bal = await erc20Mock3.balanceOf(recipient.address);
                const contractBal = await erc20Mock3.balanceOf(rewardKeeper.address);

                // Withdrawal
                const tx = await rewardKeeper.connect(owner).withdrawBalances(recipient.address);
                const receipt = await tx.wait();
                /*
                 * List of events: Transfer, BalanceWithdrawal, Transfer, BalanceWithdrawal, ....
                 * Thus, the necessary: receipt.events[1].args, receipt.events[3].args, ....
                 * Check of events witch have the `value` parameter.
                 */
                receipt.events.forEach((event) => {
                    // If it has the `value` parameter
                    if (event.args !== undefined && event.args.value !== undefined)
                        expect(event.args.value).to.be.not.eq(dust);
                });

                expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(bal);
                expect(await erc20Mock3.balanceOf(rewardKeeper.address)).to.be.eq(contractBal);
            });

            it("prevents non-owners from withdrawal of balances", async () => {
                await expect(rewardKeeper.connect(user).withdrawBalances(recipient.address)).to.be.revertedWith(
                    "Ownable: caller is not the owner"
                );
            });

            it("withdraws a specified balance", async () => {
                const bal1 = await erc20Mock.balanceOf(recipient.address);
                const bal2 = await erc20Mock2.balanceOf(recipient.address);

                let tx = await rewardKeeper.connect(owner).withdrawBalance(recipient.address, erc20Mock.address);
                await expect(tx)
                    .to.emit(rewardKeeper, "BalanceWithdrawal")
                    .withArgs(recipient.address, erc20Mock.address, value);

                expect(await erc20Mock.balanceOf(recipient.address)).to.be.eq(bal1.add(value));
                expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(bal2);

                tx = await rewardKeeper.connect(owner).withdrawBalance(recipient.address, erc20Mock2.address);
                await expect(tx)
                    .to.emit(rewardKeeper, "BalanceWithdrawal")
                    .withArgs(recipient.address, erc20Mock2.address, value);

                expect(await erc20Mock2.balanceOf(recipient.address)).to.be.eq(bal2.add(value));
            });

            it("does not withdraw a specified balance if it is less than the dust", async () => {
                // Deployment of the third ERC20 reward token
                const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
                const erc20Mock3 = await ERC20Mock.deploy();
                await erc20Mock3.deployTransaction.wait();
                // Allowing of tokens
                await rewardKeeper.connect(owner).allowToken(erc20Mock3.address);
                // Adding of a dust reward
                const dust = (await rewardKeeper.dust()).sub(1);
                await erc20Mock3.connect(owner).approve(rewardKeeper.address, dust);
                await rewardKeeper.connect(owner).addReward(cardID, erc20Mock3.address, dust);

                const bal = await erc20Mock3.balanceOf(recipient.address);
                const contractBal = await erc20Mock3.balanceOf(rewardKeeper.address);

                // Withdrawal
                const tx = await rewardKeeper.connect(owner).withdrawBalance(recipient.address, erc20Mock3.address);
                await expect(tx).to.not.emit(rewardKeeper, "BalanceWithdrawal");

                expect(await erc20Mock3.balanceOf(recipient.address)).to.be.eq(bal);
                expect(await erc20Mock3.balanceOf(rewardKeeper.address)).to.be.eq(contractBal);
            });

            it("prevents non-owners from withdrawal of a specified balance", async () => {
                await expect(
                    rewardKeeper.connect(user).withdrawBalance(recipient.address, erc20Mock2.address)
                ).to.be.revertedWith("Ownable: caller is not the owner");
            });
        });

        context("before the deadline", () => {
            const MSG = "Only available after the deadline";

            it("reverts when withdrawal of balances", async () => {
                await expect(rewardKeeper.connect(owner).withdrawBalances(recipient.address)).to.be.revertedWith(MSG);
            });

            it("reverts when withdrawal of a specified balance", async () => {
                await expect(
                    rewardKeeper.connect(owner).withdrawBalance(recipient.address, erc20Mock.address)
                ).to.be.revertedWith(MSG);
            });
        });
    });
});
