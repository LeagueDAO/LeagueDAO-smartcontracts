const { expect, use } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

const { toBN, time, snapshot } = require("../helpers");

const { Zero } = ethers.constants;

use(solidity);

describe("Gen2PointsCalculator", () => {
    let snapshotA, snapshotB;
    let owner, user, player, thirdParty;
    let nomoNFT, gen2PointsCalculator, fantasyLeague;

    const defaultName = "Some name";
    const defaultImageURL = "https://somelink.com";
    const defaultLeague = 111;
    const defaultGen = 222;
    const defaultSetId = 1;
    const defaultPosition = 1;
    const defaultPositionName = "Position #0";
    const defaultParamsArrSz = +10;
    const defaultParamsNames = new Array(defaultParamsArrSz).fill().map((el, i) => `Parameter #${i}`);
    const defaultParamsValues = new Array(defaultParamsArrSz).fill().map((el, i) => i);
    const defaultDivider = +100;
    const defaultParametersDecimals = +100;
    const defaultDelay = toBN(time.duration.minutes(61));
    const defaultChangesWindow = toBN(time.duration.minutes(10));

    before(async () => {
        [owner, user, player, thirdParty] = await ethers.getSigners();

        const FantasyLeague = await ethers.getContractFactory("FantasyLeague");
        fantasyLeague = await FantasyLeague.deploy();
        await fantasyLeague.deployed();

        const Gen2PlayerToken = await ethers.getContractFactory("Gen2PlayerToken");
        gen2PlayerToken = await Gen2PlayerToken.deploy();
        await gen2PlayerToken.deployed();
        await gen2PlayerToken.setFantasyLeague(fantasyLeague.address);

        const NomoNFT = await ethers.getContractFactory("NomoNFT");
        nomoNFT = await NomoNFT.deploy();
        await nomoNFT.deployed();

        const Gen2PointsCalculator = await ethers.getContractFactory("Gen2PointsCalculator");
        gen2PointsCalculator = await Gen2PointsCalculator.deploy(
            nomoNFT.address,
            gen2PlayerToken.address,
            defaultDelay,
            defaultChangesWindow
        );
        await gen2PointsCalculator.deployed();

        snapshotA = await snapshot();
    });

    describe("Requires of the deployment", () => {
        afterEach(async () => await snapshotA.restore());

        it("Not able to deploy if an uncorrect delay value", async () => {
            const Gen2PointsCalculator = await ethers.getContractFactory("Gen2PointsCalculator");
            await expect(
                Gen2PointsCalculator.deploy(nomoNFT.address, gen2PlayerToken.address, 1, defaultChangesWindow)
            ).to.be.revertedWith("The delay must be more than 1 hour");
        });

        it("Not able to deploy if an uncorrect window value", async () => {
            const Gen2PointsCalculator = await ethers.getContractFactory("Gen2PointsCalculator");
            await expect(
                Gen2PointsCalculator.deploy(nomoNFT.address, gen2PlayerToken.address, defaultDelay, 1)
            ).to.be.revertedWith("Invalid window value");
        });
    });

    describe("Functionality of announcement of changes", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to announce changes", async () => {
            const tx = gen2PointsCalculator.announceChanges();
            await expect(tx).to.emit(gen2PointsCalculator, "ChangesAnnouncement");
            const latestBlock = await time.latest();
            expect(await gen2PointsCalculator.announceTimestamp()).to.be.eq(latestBlock);
        });

        it("Owner should be able to set a delay", async () => {
            const delay = defaultDelay.mul(2);
            const tx = await gen2PointsCalculator.setDelay(delay);
            await expect(tx).to.emit(gen2PointsCalculator, "DelayChanged").withArgs(delay);
            await expect(tx).to.emit(gen2PointsCalculator, "ParametersChanged");
            expect(await gen2PointsCalculator.delay()).to.be.eq(delay);
        });

        it("Owner shouldn't be able to set a delay if an uncorrect delay value", async () => {
            await expect(gen2PointsCalculator.setDelay(1)).to.be.revertedWith("The delay must be more than 1 hour");
        });

        it("Owner should be able to set a window", async () => {
            const changesWindow = defaultChangesWindow.mul(2);
            const tx = await gen2PointsCalculator.setChangesWindow(changesWindow);
            await expect(tx).to.emit(gen2PointsCalculator, "WindowChanged").withArgs(changesWindow);
            await expect(tx).to.emit(gen2PointsCalculator, "ParametersChanged");
            expect(await gen2PointsCalculator.changesWindow()).to.be.eq(changesWindow);
        });

        it("Owner shouldn't be able to set a window if an uncorrect window value", async () => {
            await expect(gen2PointsCalculator.setChangesWindow(1)).to.be.revertedWith("Invalid window value");
        });
    });

    describe("Оperations with parameters sets", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to allow parameters sets", async () => {
            await gen2PointsCalculator.allowParametersSets(1);
            expect(await gen2PointsCalculator.allowedParametersSets(1)).to.be.true;
        });

        it("Owner should be able to disallow parameters sets", async () => {
            await gen2PointsCalculator.disallowParametersSets(1);
            expect(await gen2PointsCalculator.allowedParametersSets(1)).to.be.false;
        });
    });

    describe("Setting multipliers", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to set a multiplier", async () => {
            const name = "Some name";
            const multiplier = 1;
            await gen2PointsCalculator.setMultiplier(name, multiplier);
            expect(await gen2PointsCalculator.multipliers(name)).to.be.eq(1);
        });

        it("Owner should be able to set multipliers", async () => {
            const sz = 3;
            const names = new Array(sz).fill().map((el, i) => `Parameter #${i}`);
            const multipliers = new Array(sz).fill().map((el, i) => +i + +1);
            await gen2PointsCalculator.setMultipliers(names, multipliers);
        });

        it("Owner shouldn't be able to set multipliers when _names.length != _multipliers.length", async () => {
            const names = new Array(2).fill().map((el, i) => `Parameter #${i}`);
            const multipliers = new Array(3).fill().map((el, i) => +i + +1);
            await expect(gen2PointsCalculator.setMultipliers(names, multipliers)).to.be.revertedWith(
                "_names.length != _multipliers.length"
            );
        });
    });

    describe("Calculation of points", () => {
        before(async () => {
            await nomoNFT.createParametersSet(defaultParamsNames);
            await nomoNFT.setPosition(defaultPosition, defaultPositionName);
            const cardImageId = 1;
            await nomoNFT.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPosition,
                defaultSetId
            );
            await nomoNFT.mintCard(player.address, cardImageId);

            await gen2PlayerToken.setGenesisNFT(nomoNFT.address);
            await gen2PlayerToken.mint((GENESIS_NFT_ID = 1), (DIVISION = 1), user.address);

            snapshotB = await snapshot();
        });

        afterEach(async () => await snapshotB.restore());

        it("Everybody shouldn't be able to calculate points when token's parameters set was not allowed", async () => {
            const tokenID = await nomoNFT.getNumberOfTokens();
            const parametersUpdateTime = 0;
            await expect(
                gen2PointsCalculator.connect(thirdParty).calculatePoints(tokenID, parametersUpdateTime)
            ).to.be.revertedWith("token's parameters set not allowed");
        });

        it("Calculated points should be zero when parametersUpdateTime < _gameStartTime", async () => {
            await gen2PointsCalculator.allowParametersSets(defaultSetId);
            const tokenID = await nomoNFT.getNumberOfTokens();
            expect(await gen2PointsCalculator.connect(thirdParty).calculatePoints(tokenID, 1)).to.be.eq(0);
        });

        it("Everybody shouldn't be able to calculate points when parametersNames.length != parametersValues.length", async () => {
            await gen2PointsCalculator.allowParametersSets(defaultSetId);
            const tokenID = await nomoNFT.getNumberOfTokens();
            const parametersUpdateTime = 0;
            await expect(
                gen2PointsCalculator.connect(thirdParty).calculatePoints(tokenID, parametersUpdateTime)
            ).to.be.revertedWith("parametersNames.length != parametersValues.length");
        });

        it("Everybody should be able to calculate points", async () => {
            // Updating parameters
            await nomoNFT.updateParameters(1, defaultParamsValues);
            const txTimestamp = await time.latest();
            // const cardImage = await nomoNFT.getCardImage(1);
            // expect(cardImage.parametersNames).to.be.deep.eq(defaultParamsNames);
            // cardImage.parametersValues.forEach((val, i) => expect(val).to.be.eq(defaultParamsValues[i]));
            // expect(cardImage.parametersUpdateTime).to.be.eq(txTimestamp);

            // Setting multipliers
            let multipliers = new Array(defaultParamsArrSz).fill().map((el, i) => +i + +999999888);
            await gen2PointsCalculator.setMultipliers(defaultParamsNames, multipliers);

            // Allowing the parameters sets
            await gen2PointsCalculator.allowParametersSets(defaultSetId);

            const tokenID = await nomoNFT.getNumberOfTokens();

            const parametersUpdateTime = txTimestamp;

            // await gen2PlayerToken.setGenesisNFT(nomoNFT.address)

            // await gen2PlayerToken.mint(GENESIS_NFT_ID = 1, DIVISION = 1, user.address)

            // Calculation of points
            const cardImage = await nomoNFT.getCardImage(1);
            let parametersDivider = await gen2PointsCalculator.parametersDivider();
            let points = Zero;
            for (let i = 0; i < cardImage.parametersNames.length; ++i)
                points = points.add(toBN(multipliers[i]).mul(cardImage.parametersValues[i]));
            points = points.mul(10).div(defaultDivider).div(parametersDivider).add(5).div(10);
            expect(
                await gen2PointsCalculator.connect(thirdParty).calculatePoints(tokenID, parametersUpdateTime)
            ).to.be.eq(points);

            // Setting new multipliers
            multipliers = new Array(defaultParamsArrSz).fill().map((el, i) => +i - +100000);
            await gen2PointsCalculator.setMultipliers(defaultParamsNames, multipliers);
            // Calculation of points when the summary of points is less or equal zero
            expect(
                await gen2PointsCalculator.connect(thirdParty).calculatePoints(tokenID, parametersUpdateTime)
            ).to.be.eq(0);
        });
    });

    describe("Status when not in the window of changes", () => {
        before(async () => {
            // Go to status when not in the window of changes
            const announceTimestamp = await gen2PointsCalculator.announceTimestamp();
            const delay = await gen2PointsCalculator.delay();
            const changesWindow = await gen2PointsCalculator.changesWindow();
            await time.increaseTo(announceTimestamp.add(delay).add(changesWindow));

            snapshotB = await snapshot();
        });

        afterEach(async () => await snapshotB.restore());

        const MSG = "not in changes window";

        it("Owner shouldn't be able to allow parameters' sets", async () => {
            await expect(gen2PointsCalculator.allowParametersSets(1)).to.be.revertedWith(MSG);
        });

        it("Owner shouldn't be able to disallow parameters' sets", async () => {
            await expect(gen2PointsCalculator.disallowParametersSets(1)).to.be.revertedWith(MSG);
        });

        it("Owner shouldn't be able to set a multiplier", async () => {
            await expect(gen2PointsCalculator.setMultiplier("Some name", 1)).to.be.revertedWith(MSG);
        });

        it("Owner should be able to set a delay", async () => {
            await expect(gen2PointsCalculator.setDelay(defaultDelay)).to.be.revertedWith(MSG);
        });

        it("Owner should be able to set a window", async () => {
            await expect(gen2PointsCalculator.setChangesWindow(defaultChangesWindow)).to.be.revertedWith(MSG);
        });

        it("Owner shouldn't be able to set multipliers", async () => {
            await expect(
                gen2PointsCalculator.setMultipliers(defaultParamsNames, defaultParamsValues)
            ).to.be.revertedWith(MSG);
        });
    });

    describe("Getters", () => {
        afterEach(async () => await snapshotA.restore());

        it("Everybody should be able to get the divider value of multipliers", async () => {
            expect(await gen2PointsCalculator.MULTIPLIERS_DIVIDER()).to.be.eq(defaultDivider);
        });

        it("Everybody should be able to get the value of parameters' divider", async () => {
            expect(await gen2PointsCalculator.parametersDivider()).to.be.eq(defaultParametersDecimals);
        });
    });
});
