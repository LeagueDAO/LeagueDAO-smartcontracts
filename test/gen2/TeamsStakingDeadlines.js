/* eslint-disable */
const { expect, use, should } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot, getRandomInt, shuffleArray } = require("../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);
should();

describe("TeamsStakingDeadlines test", () => {
    let snapshotA;
    let owner, user;
    let teamsDeadlines;
    let nomoNFT;
    const teamId = 12;
    const teamName = "TeamName";
    const cardImageId = 111;

    const teamsIds = [1, 2, 3];
    const teamsNames = ["TeamName1", "TeamName2", "TeamName3"];
    const cardsImagesIds = [222, 333, 444];

    before(async () => {
        [owner, user] = await ethers.getSigners();

        const NomoNFTMock = await ethers.getContractFactory("NomoNFTMock");
        nomoNFT = await NomoNFTMock.deploy();
        await nomoNFT.deployed();
        const TeamsStakingDeadlines = await ethers.getContractFactory("TeamsStakingDeadlines");

        teamsDeadlines = await upgrades.deployProxy(TeamsStakingDeadlines, [nomoNFT.address]);
        await teamsDeadlines.deployed();

        const cardImageId = 111;
        await nomoNFT.setCardImageToExistence(cardImageId, true);

        snapshotA = await snapshot();
    });

    afterEach(async () => await snapshotA.restore());

    it(`Check initializer`, async () => {
        (await teamsDeadlines.nomoNFT()).should.equal(nomoNFT.address);
    });
    it(`Owner should be able to set team's name`, async () => {
        await teamsDeadlines.connect(owner).setTeamName(teamId, teamName);
        (await teamsDeadlines.teamName(teamId)).should.eq(teamName);
    });
    it(`Not an owner should receive revert on the team name setter`, async () => {
        await teamsDeadlines
            .connect(user)
            .setTeamName(teamId, teamName)
            .should.be.revertedWith("Ownable: caller is not the owner");
    });
    it(`Owner should be able to set cardImage to team`, async () => {
        await teamsDeadlines.connect(owner).setCardImageToTeam(cardImageId, teamId);
        (await teamsDeadlines.cardImageToTeam(cardImageId)).should.eq(teamId);
    });
    it(`Not an owner should receive revert on the cardImage to team setter`, async () => {
        await teamsDeadlines
            .connect(user)
            .setCardImageToTeam(cardImageId, teamId)
            .should.be.revertedWith("Ownable: caller is not the owner");
    });
    it(`Owner should be able to set team deadline`, async () => {
        const deadline = (await time.latest()) + 1000;
        await teamsDeadlines.connect(owner).setTeamDeadline(teamId, deadline);
        (await teamsDeadlines.teamDeadline(teamId)).should.eq(deadline);
    });
    it(`Not an owner should receive revert on the team deadline setter`, async () => {
        const deadline = (await time.latest()) + 1000;
        await teamsDeadlines
            .connect(user)
            .setTeamDeadline(teamId, deadline)
            .should.be.revertedWith("Ownable: caller is not the owner");
    });
    it(`Owner shouldn't be able to set team deadline less than current time`, async () => {
        const deadline = (await time.latest()) - 1000;
        await teamsDeadlines
            .connect(owner)
            .setTeamDeadline(teamId, deadline)
            .should.be.revertedWith("Deadline should be greater than current time");
    });
    it(`Anyone must be able to get cardImage's team name`, async () => {
        await teamsDeadlines.connect(owner).setTeamName(teamId, teamName);
        await teamsDeadlines.connect(owner).setCardImageToTeam(cardImageId, teamId);
        (await teamsDeadlines.connect(user).getCardImageTeamName(cardImageId)).should.eq(teamName);
    });
    it(`Anyone should be able to get cardImage's team deadline`, async () => {
        const deadline = (await time.latest()) + 1000;
        await teamsDeadlines.connect(owner).setTeamDeadline(teamId, deadline);
        await teamsDeadlines.connect(owner).setCardImageToTeam(cardImageId, teamId);
        (await teamsDeadlines.connect(user).getCardImageTeamDeadline(cardImageId)).should.eq(deadline);
    });
    it(`Owner shouldn't be able to set nonexistent cardImage to team`, async () => {
        await teamsDeadlines
            .connect(owner)
            .setCardImageToTeam(666, teamId)
            .should.be.revertedWith("CardImage doesn't exist");
    });
    it(`Owner shouldn't be able to pass zero team id`, async () => {
        await teamsDeadlines
            .connect(owner)
            .setTeamName(0, teamName)
            .should.be.revertedWith("Team id should be greater than 0");
        await teamsDeadlines
            .connect(owner)
            .setTeamDeadline(0, (await time.latest()) + 1000)
            .should.be.revertedWith("Team id should be greater than 0");
        await teamsDeadlines
            .connect(owner)
            .setCardImageToTeam(cardImageId, 0)
            .should.be.revertedWith("Team id should be greater than 0");
    });
    it(`Owner should be able to set several teams deadlines`, async () => {
        const now = await time.latest();
        const deadlines = [1, 2, 3].map((n) => now + 1000 + n);
        await teamsDeadlines.connect(owner).setTeamsDeadlines(teamsIds, deadlines);
        deadlines.forEach(async (deadline, i) => {
            (await teamsDeadlines.teamDeadline(teamsIds[i])).should.eq(deadline);
        });
    });
    it(`Owner shouldn't be able to set several teams deadlines if deadlines and teams arrays have different length`, async () => {
        const now = await time.latest();
        const deadlines = [1, 2, 3].map((n) => now + 1000 + n);
        await teamsDeadlines
            .connect(owner)
            .setTeamsDeadlines(teamsIds.slice(0, 2), deadlines)
            .should.be.revertedWith("Team ids and deadlines must have the same length");
    });
    it(`Owner should be able to set several teams names`, async () => {
        await teamsDeadlines.connect(owner).setTeamsNames(teamsIds, teamsNames);
        teamsNames.forEach(async (name, i) => {
            (await teamsDeadlines.teamName(teamsIds[i])).should.eq(name);
        });
    });
    it(`Owner shouldn't be able to set several teams names if names and teams arrays have different length`, async () => {
        await teamsDeadlines
            .connect(owner)
            .setTeamsNames(teamsIds.slice(0, 2), teamsNames)
            .should.be.revertedWith("Team ids and names must have the same length");
    });
});
