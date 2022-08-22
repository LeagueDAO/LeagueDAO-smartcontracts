const { expect, use } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("../../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);

// module.exports.networks.hardhat.accounts.count = 120;

describe("Users N Division", function () {
    let snapshotA;

    let deployer, users, users120;

    let leagueAdmin;
    let league, randGenerator, gen2PlayerToken, pointCalculator, rewardERC20, teamsStakingDeadlines;
    let falseStrategy, falseMultisig, falseLeagPass;

    const SEASON_ID = 0;

    before(async () => {
        const signers = await ethers.getSigners();
        deployer = signers[0];

        falseMultisig = signers[2];
        falseStrategy = signers[3];

        const userArrSize = 12;
        users = signers.slice(4, userArrSize + 1 + 3);
        users120 = await ethers.getSigners();
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

        const fakeNomo = signers[0];
        const TeamsStakingDeadlines = await ethers.getContractFactory("TeamsStakingDeadlines");
        teamsStakingDeadlines = await upgrades.deployProxy(TeamsStakingDeadlines, [fakeNomo.address]);
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

        await leagPass.setFantasyLeague(league.address);
        await league.setLeaguePassNFT(leagPass.address);

        await teamManager.setFantasyLeague(league.address);
        await league.setTeamManager(teamManager.address);

        //__________________________
        snapshotA = await snapshot();
    });
    afterEach(async () => await snapshotA.restore());
    describe("[UsersNDivisions]", async () => {
        describe("Adding of users to the Fantasy League", function () {
            it("Adds user", async () => {
                let tx = await leagPass.connect(users[0]).joinTheLeague();
                await expect(tx).to.emit(league, "UserAdded").withArgs(SEASON_ID, users[0].address);
            });
            it("Cannot add same user twice", async () => {
                await leagPass.connect(users[0]).joinTheLeague();
                await expect(leagPass.connect(users[0]).joinTheLeague()).to.be.revertedWith("UserIsAlreadyAdded()");
            });
            it("Only league pass contract can add user to the Fantasy League", async () => {
                const NOT_LEAGUE_PASS = users[1];
                await expect(league.connect(NOT_LEAGUE_PASS).addUser(users[1].address)).to.be.revertedWith(
                    "NotALeaguePassNFTContract()"
                );
            });
            it("Cannot add user with zero address to the Fantasy League", async () => {
                await expect(leagPass.connect(users[0]).joinTheLeagueZeroAddress()).to.be.revertedWith("ZeroAddress()");
            });
            it("Can add user only during UserAdding gameStage", async () => {
                await leagPass.connect(users[0]).joinTheLeague();

                const NUMBER_TO_SHUFFLE = 1;
                await league.updateRandNum();
                await league.shuffleUsers(NUMBER_TO_SHUFFLE);

                await expect(leagPass.connect(users[1]).joinTheLeague()).to.be.revertedWith("IncorrectGameStage()");
            });
        });
        describe("Rand generator", async () => {
            it("Only admin can set random generator", async () => {
                const REVERT_STR =
                    "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
                await expect(league.connect(users[1]).setRandGenerator(randGenerator.address)).to.be.revertedWith(
                    REVERT_STR
                );

                let tx = await league.setRandGenerator(randGenerator.address);
                await expect(tx).to.emit(league, "RandomGeneratorSet").withArgs(randGenerator.address);
            });
            it("Only admin can update rand generator", async () => {
                const REVERT_STR =
                    "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
                await expect(league.connect(users[1]).updateRandNum()).to.be.revertedWith(REVERT_STR);
                expect(await league.randNumber()).to.be.zero;
                let tx = await league.updateRandNum();
                await expect(tx).to.emit(league, "RandNumberUpdated");
                expect(await league.randNumber()).to.be.not.zero;
            });
        });
        describe("Shuffle users", async () => {
            it("Only admin can shuffle users", async () => {
                const NUMBER_TO_SHUFFLE = 1;
                const REVERT_STR =
                    "AccessControl: account " + users[1].address.toLowerCase() + " is missing role " + AddressZero;
                await expect(league.connect(users[1]).shuffleUsers(NUMBER_TO_SHUFFLE)).to.be.revertedWith(REVERT_STR);
            });
            it("Cannot shuffle users when rand generator is not updated", async () => {
                const NUMBER_TO_SHUFFLE = 1;
                await expect(league.shuffleUsers(NUMBER_TO_SHUFFLE)).to.be.revertedWith("RandNumberIsNotUpdated()");
            });
            it("Cannot shuffle zero amount", async () => {
                const NUMBER_TO_SHUFFLE = 0;
                await league.updateRandNum();
                await expect(league.shuffleUsers(NUMBER_TO_SHUFFLE)).to.be.revertedWith(
                    "NumberOfUsersToShuffleIsZero()"
                );
            });
            it.skip("Cannot shuffle when zero users are added", async () => {
                const NUMBER_TO_SHUFFLE = 1;
                await league.updateRandNum();
                await league.shuffleUsers(NUMBER_TO_SHUFFLE);
            });
            it("Cannot shuffle after everything is shuffled", async () => {
                for (let i = 0; i < users.length; i++) {
                    await leagPass.connect(users[i]).joinTheLeague();
                }
                const NUMBER_TO_SHUFFLE = 24;
                await league.updateRandNum();
                await league.shuffleUsers(NUMBER_TO_SHUFFLE);

                await expect(league.shuffleUsers(1)).to.be.revertedWith("NotAUserShuffleGameStage()");
            });
            it("Shuffles 24 users", async () => {
                //add users
                for (let i = 0; i < users.length; i++) {
                    await leagPass.connect(users[i]).joinTheLeague();
                }

                const USERS_BEFORE_SHUFFLE = [];
                for (let i = 0; i < users.length; i++) {
                    USERS_BEFORE_SHUFFLE.push(await league.users(0, i));
                }

                const NUMBER_TO_SHUFFLE = 24;
                await league.updateRandNum();
                await league.shuffleUsers(NUMBER_TO_SHUFFLE);

                const USERS_AFTER_SHUFFLE = [];
                for (let i = 0; i < users.length; i++) {
                    USERS_AFTER_SHUFFLE.push(await league.users(0, i));
                }
                let randomaizerScore = 0;
                for (let i = 0; i < users.length; i++) {
                    if (USERS_BEFORE_SHUFFLE[i] == USERS_AFTER_SHUFFLE[i]) {
                        randomaizerScore++;
                    }
                }
                // console.log(randomaizerScore)
                expect(randomaizerScore).to.be.lessThan(3);
            });
            it("Shuffles 120 users batch", async () => {
                //add users
                for (let i = 0; i < users120.length; i++) {
                    await leagPass.connect(users120[i]).joinTheLeague();
                }
                const NUMBER_TO_SHUFFLE = 120;
                await league.updateRandNum();
                await league.shuffleUsers(NUMBER_TO_SHUFFLE);

                const USERS_AFTER_SHUFFLE = [];
                for (let i = 0; i < 120; i++) {
                    USERS_AFTER_SHUFFLE.push(await league.users(0, i));
                }
                let randomaizerScore = 0;
                for (let i = 0; i < 120; i++) {
                    if (users120[i].address == USERS_AFTER_SHUFFLE[i]) {
                        randomaizerScore++;
                    }
                }
                expect(randomaizerScore).to.be.lessThan(3);
            });
            it("Shuffles 12 * 10 users batch", async () => {
                //add users
                for (let i = 0; i < 120; i++) {
                    await leagPass.connect(users120[i]).joinTheLeague();
                }

                const NUMBER_TO_SHUFFLE = 10;
                await league.updateRandNum();
                for (let j = 0; j < 12; j++) {
                    await league.shuffleUsers(NUMBER_TO_SHUFFLE);
                }

                const USERS_AFTER_SHUFFLE = [];
                for (let i = 0; i < 120; i++) {
                    USERS_AFTER_SHUFFLE.push(await league.users(0, i));
                }
                let randomaizerScore = 0;
                for (let i = 0; i < 120; i++) {
                    if (users120[i].address == USERS_AFTER_SHUFFLE[i]) {
                        randomaizerScore++;
                    }
                }
                expect(randomaizerScore).to.be.lessThan(1);
            });
        });
    });
    describe("Getters", async () => {
        it("gets User Division Id", async () => {
            const SEASON_ID = 0;
            const NOT_A_USER = "0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9";
            //add users
            for (let i = 0; i < 120; i++) {
                await leagPass.connect(users120[i]).joinTheLeague();
            }
            const NUMBER_TO_SHUFFLE = 120;
            await league.updateRandNum();
            await league.shuffleUsers(NUMBER_TO_SHUFFLE);

            const USERS_AFTER_SHUFFLE = [];
            for (let i = 0; i < 120; i++) {
                USERS_AFTER_SHUFFLE.push(await league.users(0, i));
            }
            for (let i = 0; i < 10; i++) {
                expect(await league.getUserDivisionId(SEASON_ID, USERS_AFTER_SHUFFLE[i * 12])).to.be.equal(i);
            }
            await expect(league.getUserDivisionId(SEASON_ID, NOT_A_USER)).to.be.revertedWith("UnknownUser()");
        });
        it("gets division users", async () => {
            const USERS_24 = users120.slice(0, 24);
            for (let i = 0; i < USERS_24.length; i++) {
                await leagPass.connect(USERS_24[i]).joinTheLeague();
            }
            let division = await league.getDivisionUsers(0, 0);
            for (let i = 0; i < 12; i++) {
                expect(division[i]).to.be.equal(USERS_24[i].address);
            }
            division = await league.getDivisionUsers(0, 1);
            for (let i = 0; i < 12; i++) {
                expect(division[i]).to.be.equal(USERS_24[12 + i].address);
            }
        });
        it("gets users count ", async () => {
            const USERS_24 = users120.slice(0, 24);
            expect(await league.getNumberOfUsers()).to.be.zero;
            for (let i = 0; i < USERS_24.length; i++) {
                await leagPass.connect(USERS_24[i]).joinTheLeague();
            }
            expect(await league.getNumberOfUsers()).to.be.equal(USERS_24.length);
        });
        it("gets division size", async () => {
            expect(await league.DIVISION_SIZE()).to.be.equal(12);
        });
        it("gets division count ", async () => {
            const USERS_24 = users120.slice(0, 24);
            expect(await league.getNumberOfDivisions()).to.be.zero;

            for (let i = 0; i < 15; i++) {
                await leagPass.connect(USERS_24[i]).joinTheLeague();
            }
            expect(await league.getNumberOfDivisions()).to.be.equal(1);

            for (let i = 15; i < 24; i++) {
                await leagPass.connect(USERS_24[i]).joinTheLeague();
            }
            expect(await league.getNumberOfDivisions()).to.be.equal(2);
        });
        it("gets Season id ", async () => {
            expect(await league.getSeasonId()).to.be.equal(0);
        });
    });
});
