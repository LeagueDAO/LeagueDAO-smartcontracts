const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { parseUnits } = ethers.utils;

const { snapshot, constants, time } = require("../helpers");
const { AddressZero } = ethers.constants;

const DAY = 24 * 3600;

contract("LeaguePassNFT", () => {
    let snapshotA;
    let passNFT,
        league,
        tokenOfPayment,
        dleagueToken,
        teamsStakingDeadlines,
        nomoNFT,
        rewardERC20,
        randGenerator,
        falseGen2PlayerToken,
        falseCalculator,
        falseMultisig,
        teamManager;
    let deployer, owner, user, user2;

    before(async () => {
        const signers = await ethers.getSigners();
        deployer = signers[0];
        owner = signers[1];
        user = signers[2];
        user2 = signers[3];
        user3 = signers[4];
        falseGen2PlayerToken = signers[10];
        falseCalculator = signers[11];
        falseMultisig = signers[12];

        const TokenOfPayment = await ethers.getContractFactory("ERC20Mock");
        tokenOfPayment = await TokenOfPayment.deploy();
        await tokenOfPayment.deployed();

        dleagueToken = await TokenOfPayment.deploy();
        await dleagueToken.deployed();

        const DLEAG_AMOUNT = 20;
        const BASE_URI = "BaseURLforNFT";
        const PassNFT = await ethers.getContractFactory("LeaguePassNFT");
        const SALE_DEADLINE = (await time.latest()) + 1 * DAY;
        const LEAGUE_START_DATE = (await time.latest()) + 5 * DAY;
        const LEAGUE_JOIN_DEADLINE = (await time.latest()) + 10 * DAY;

        const NFT_PRICE = parseUnits("300");
        passNFT = await upgrades.deployProxy(PassNFT, [
            dleagueToken.address,
            DLEAG_AMOUNT,
            BASE_URI,
            SALE_DEADLINE,
            LEAGUE_START_DATE,
            LEAGUE_JOIN_DEADLINE,
            [tokenOfPayment.address],
            [NFT_PRICE]
        ]);

        await passNFT.deployed();
        // Deployment of Fantasy League contract
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        rewardERC20 = await ERC20Mock.deploy();
        await rewardERC20.deployTransaction.wait();

        const RandGeneratorMock = await ethers.getContractFactory("RandGeneratorMock");
        randGenerator = await RandGeneratorMock.deploy();
        await randGenerator.deployTransaction.wait();

        const FantasyLeague = await ethers.getContractFactory("FantasyLeagueMock");
        league = await upgrades.deployProxy(FantasyLeague, [
            passNFT.address,
            randGenerator.address,
            falseMultisig.address,
            [rewardERC20.address]
        ]);
        await league.deployed();

        await passNFT.connect(deployer).setFantasyLeague(league.address);
        await league.connect(deployer).setLeaguePassNFT(passNFT.address);

        const NomoNFTMock = await ethers.getContractFactory("NomoNFTMock");
        nomoNFT = await NomoNFTMock.deploy();
        await nomoNFT.deployTransaction.wait();

        const TeamsStakingDeadlines = await ethers.getContractFactory("TeamsStakingDeadlines");
        teamsStakingDeadlines = await upgrades.deployProxy(TeamsStakingDeadlines, [nomoNFT.address]);
        await teamsStakingDeadlines.deployed();

        const TeamManager = await ethers.getContractFactory("TeamManager");
        teamManager = await upgrades.deployProxy(TeamManager, [
            falseGen2PlayerToken.address,
            teamsStakingDeadlines.address,
            falseCalculator.address
        ]);
        await teamManager.deployed();

        await teamManager.connect(deployer).setFantasyLeague(league.address);
        await league.connect(deployer).setTeamManager(teamManager.address);
        let falseFinancialManager = signers[13];
        await passNFT.setFinancialManager(falseFinancialManager.address);

        snapshotA = await snapshot();
    });

    afterEach(async () => await snapshotA.restore());

    describe("initialize", async () => {
        it("cannot initialize with token and prices length mismatch", async () => {
            const DLEAG_AMOUNT = 20;
            const BASE_URI = "BaseURLforNFT";
            const PassNFT = await ethers.getContractFactory("LeaguePassNFT");
            const SALE_DEADLINE = 1000;
            const LEAGUE_START_DATE = SALE_DEADLINE + 1000;
            const NFT_PRICE = 300;
            const NFT_PRICE_2 = 600;
            const LEAGUE_JOIN_DEADLINE = SALE_DEADLINE + 1000000;

            await expect(
                upgrades.deployProxy(PassNFT, [
                    dleagueToken.address,
                    DLEAG_AMOUNT,
                    BASE_URI,
                    SALE_DEADLINE,
                    LEAGUE_START_DATE,
                    LEAGUE_JOIN_DEADLINE,
                    [tokenOfPayment.address],
                    [NFT_PRICE, NFT_PRICE_2]
                ])
            ).to.be.revertedWith("Token and nft price length mismatch");
        });
    });

    describe("Basic functionality", () => {
        it("Only one pass can be minted to the address", async () => {
            const TOKEN_ID = 1;
            const PASS_PRICE = parseUnits("300");
            const PLAYER_BALANCE = parseUnits("600");

            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);

            await expect(passNFT.connect(user).mint(tokenOfPayment.address))
                .to.emit(passNFT, "NewPassCreated")
                .withArgs(TOKEN_ID, user.address, PASS_PRICE, tokenOfPayment.address);

            await expect(passNFT.connect(user).mint(tokenOfPayment.address)).to.be.revertedWith(
                "Only one pass per account"
            );
        });

        it("Pass cannot be minted after sale is over", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            const NOW = (await web3.eth.getBlock("latest")).timestamp;

            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);

            await passNFT.setSaleDeadline(NOW);

            await expect(passNFT.connect(user).mint(tokenOfPayment.address)).to.be.revertedWith("Sale is over!");
        });

        it("Pass cannot be minted in exchange for not valid token", async () => {
            // if token is set with price ZERO => token is not acceptable
            await passNFT.connect(deployer).setPaymentToken(tokenOfPayment.address, 0);
            const PLAYER_BALANCE = parseUnits("600");

            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);

            await expect(passNFT.connect(user).mint(tokenOfPayment.address)).to.be.revertedWith(
                "This token is not acceptable"
            );
        });

        it("Users from white list can have more than 1 NFT", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);

            await passNFT.connect(deployer).setWhitelistedAddr(user.address, true);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await passNFT.connect(user).mint(tokenOfPayment.address);
            expect(await passNFT.balanceOf(user.address)).to.equal(2);
        });

        it("All users can have more than 1 NFT when it is allowed", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);

            await passNFT.setOneTokenPerAccount(false);

            await passNFT.connect(user).mint(tokenOfPayment.address);
            await passNFT.connect(user).mint(tokenOfPayment.address);
            expect(await passNFT.balanceOf(user.address)).to.equal(2);
        });

        it("User with pass can join the league", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);

            await passNFT.connect(user).joinTheLeague(1);
        });

        it("User cannot join the league twice", async () => {
            await passNFT.setOneTokenPerAccount(false);
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);

            await passNFT.connect(user).joinTheLeague(1);
            await expect(passNFT.connect(user).joinTheLeague(2)).to.be.revertedWith(
                "You have already joined the league"
            );
        });

        it("User cannot join the league before league start date", async () => {
            const PASS_ID = 1;
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            const MOMENT_IN_FUTURE = (await web3.eth.getBlock("latest")).timestamp + 1000;
            await passNFT.connect(deployer).setLeagueStartDate(MOMENT_IN_FUTURE);
            await expect(passNFT.connect(user).joinTheLeague(PASS_ID)).to.be.revertedWith("League has not started yet");
        });

        it("User cannot join the league without pass", async () => {
            const PASS_ID = 1;
            await time.increase(5 * DAY);
            await expect(passNFT.connect(user).joinTheLeague(PASS_ID)).to.be.revertedWith(
                "You do not have the pass to join the league"
            );
        });

        it("User can join league only with his pass", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            const USER_1_PASS_ID = 1;
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await tokenOfPayment.mint(user2.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user2).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user2).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);

            await expect(passNFT.connect(user2).joinTheLeague(USER_1_PASS_ID)).to.be.revertedWith(
                "That isn't your pass"
            );
        });

        it("User cannot join the league with pass from different season", async () => {
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);
            await league.incrementSeasonId();

            await expect(passNFT.connect(user).joinTheLeague(1)).to.be.revertedWith("Pass is not valid it this season");
        });

        it("Elligible users can join the league after deadline", async () => {
            await passNFT.setIsAllowedToFillLastDivision(user2.address, true);
            // Need extra user to have not full division
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await tokenOfPayment.mint(user2.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user2).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user2).mint(tokenOfPayment.address);

            await tokenOfPayment.mint(user3.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user3).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user3).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);

            await passNFT.connect(user).joinTheLeague(1);

            await time.increase(20 * DAY);

            await passNFT.connect(user2).joinTheLeague(2);
            await expect(passNFT.connect(user3).joinTheLeague(3)).to.be.revertedWith(
                "You are not allowed to fill last division"
            );
        });

        it("Elligible users cannot join the league after deadline if division if full", async () => {
            await passNFT.setIsAllowedToFillLastDivision(user.address, true);
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await time.increase(20 * DAY);

            await expect(passNFT.connect(user).joinTheLeague(1)).to.be.revertedWith("Last division is full");
        });
        it("Elligible users can join the league after deadline", async () => {
            await passNFT.setIsAllowedToFillLastDivision(user2.address, true);
            // Need extra user to have not full division
            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            await tokenOfPayment.mint(user2.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user2).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user2).mint(tokenOfPayment.address);

            await tokenOfPayment.mint(user3.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user3).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user3).mint(tokenOfPayment.address);

            await time.increase(5 * DAY);
        });
        it("Overwritten method works fine", async () => {
            const ERC_721_INTERFACE_ID = "0x5b5e139f";
            const NOT_SUPPORTED_INTERFACE = "0xd48e638a";

            expect(await passNFT.supportsInterface(NOT_SUPPORTED_INTERFACE)).to.be.false;
            expect(await passNFT.supportsInterface(ERC_721_INTERFACE_ID)).to.be.true;
        });

        describe("marketingMint()", async () => {
            it("User from marketing list can mint pass nft for free", async () => {
                TOKEN_ID = 1;
                PASS_PRICE = 0;
                expect(await passNFT.connect(deployer).setIsInMarketingList(user.address, true))
                    .to.emit(passNFT, "IsInMarketingListChanged")
                    .withArgs(user.address, true);

                await expect(passNFT.connect(user).marketingMint())
                    .to.emit(passNFT, "NewPassCreated")
                    .withArgs(TOKEN_ID, user.address, PASS_PRICE, AddressZero);

                expect(await passNFT.balanceOf(user.address)).to.be.equal(1);
            });
            it("Only user from marketing list can mint NFT for free", async () => {
                await expect(passNFT.connect(user).marketingMint()).to.be.revertedWith("You are not in marketing list");
            });
            it("Marketing NFT cannot be minted after sale deadline", async () => {
                TOKEN_ID = 1;
                PASS_PRICE = 0;
                await passNFT.connect(deployer).setIsInMarketingList(user.address, true);

                await time.increase(DAY);

                await expect(passNFT.connect(user).marketingMint()).to.be.revertedWith("Sale is over!");
                expect(await passNFT.balanceOf(user.address)).to.be.equal(0);
            });
        });
    });
    describe("Getters and setters", () => {
        it("Sets payment token and pass price", async () => {
            const PRICE = parseUnits("300");
            await expect(passNFT.connect(deployer).setPaymentToken(tokenOfPayment.address, PRICE))
                .to.emit(passNFT, "PaymentTokenIsSet")
                .withArgs(tokenOfPayment.address, PRICE);
        });

        it("Sets dLeague token", async () => {
            await expect(passNFT.setDleagueToken(dleagueToken.address))
                .to.emit(passNFT, "DleagueTokenIsSet")
                .withArgs(dleagueToken.address);
        });

        it("Sets dLeague token amount", async () => {
            const TOKEN_AMOUNT = 69;

            await expect(passNFT.setDleagueTokenAmount(TOKEN_AMOUNT))
                .to.emit(passNFT, "DleagueTokenAmountIsSet")
                .withArgs(TOKEN_AMOUNT);

            expect(await passNFT.dLeagAmount()).to.equal(TOKEN_AMOUNT);
        });

        it("Sets base URI for NFT", async () => {
            const BASE_URI = "www.uri.com";
            await expect(passNFT.setBaseURI(BASE_URI)).to.emit(passNFT, "BaseURLforNFTisSet").withArgs(BASE_URI);
        });

        it("Gets base URI for NFT", async () => {
            const BASE_URI = "www.uri.com";
            const NFT_ID = 1;
            await expect(passNFT.setBaseURI(BASE_URI));

            const PLAYER_BALANCE = parseUnits("600");
            await tokenOfPayment.mint(user.address, PLAYER_BALANCE);
            await tokenOfPayment.connect(user).increaseAllowance(passNFT.address, PLAYER_BALANCE);
            await passNFT.connect(user).mint(tokenOfPayment.address);

            expect(await passNFT.tokenURI(NFT_ID)).to.be.equal(BASE_URI);
        });

        it("Sets deadline for pass sale", async () => {
            const DEAD_LINE = 40000;
            await expect(passNFT.setSaleDeadline(DEAD_LINE)).to.emit(passNFT, "SaleDeadlineIsSet").withArgs(DEAD_LINE);
        });

        it("Sets deadline for league start", async () => {
            const DEAD_LINE = 40000;
            await expect(passNFT.setLeagueStartDate(DEAD_LINE))
                .to.emit(passNFT, "LeagueStartDateIsSet")
                .withArgs(DEAD_LINE);
        });

        it("Sets value for white list address", async () => {
            await expect(passNFT.setWhitelistedAddr(user.address, true))
                .to.emit(passNFT, "WhitelistChanged")
                .withArgs(user.address, true);

            expect(await passNFT.whitelist(user.address)).to.equal(true);
        });

        it("Sets address for Fantasy League Contract", async () => {
            await expect(passNFT.setFantasyLeague(league.address))
                .to.emit(passNFT, "FantasyLeagueSet")
                .withArgs(league.address);
        });

        it("Sets limit oneTokenPerAccount on and off", async () => {
            await expect(passNFT.setOneTokenPerAccount(true))
                .to.emit(passNFT, "OneTokenPerAccountIsSet")
                .withArgs(true);

            await expect(passNFT.setOneTokenPerAccount(false))
                .to.emit(passNFT, "OneTokenPerAccountIsSet")
                .withArgs(false);
        });
    });
});
