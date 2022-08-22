require("chai").should();
const { BN, expectEvent, expectRevert, time, snapshot } = require("@openzeppelin/test-helpers");

const toBN = (x) => new BN(x);
const zero = toBN(0);
const one = toBN(1);

const NomoNFT = artifacts.require("NomoNFT");
const NomoPointsCalculator = artifacts.require("NomoPointsCalculator");

contract("NomoPointsCalculator test", (accounts) => {
    let snapshotA, snapshotB;
    let [owner, player, thirdParty] = accounts;
    let nomoNFTInstance, nomoPointsCalcInstance;
    const defaultName = "Some name";
    const defaultImageURL = "https://somelink.com";
    const defaultLeague = toBN(111);
    const defaultGen = toBN(222);
    const defaultSetId = one;
    const defaultPosition = one;
    const defaultPositionName = "Position #0";
    const defaultParamsArrSz = +10;
    const defaultParamsNames = new Array(defaultParamsArrSz).fill().map((el, i) => `Parameter #${i}`);
    const defaultParamsValues = new Array(defaultParamsArrSz).fill().map((el, i) => toBN(i));
    const defaultDivider = toBN(100);
    const defaultParametersDecimals = toBN(100);
    const defaultDelay = time.duration.minutes(61);
    const defaultChangesWindow = time.duration.minutes(10);

    before(async () => {
        nomoNFTInstance = await NomoNFT.new();
        nomoPointsCalcInstance = await NomoPointsCalculator.new(
            nomoNFTInstance.address,
            defaultDelay,
            defaultChangesWindow
        );

        snapshotA = await snapshot();
    });

    describe("Requires of the deployment", () => {
        afterEach(async () => await snapshotA.restore());

        it("Not able to deploy if an uncorrect delay value", async () => {
            await expectRevert(
                NomoPointsCalculator.new(nomoNFTInstance.address, one, defaultChangesWindow),
                "The delay must be more than 1 hour"
            );
        });

        it("Not able to deploy if an uncorrect window value", async () => {
            await expectRevert(
                NomoPointsCalculator.new(nomoNFTInstance.address, defaultDelay, one),
                "Invalid window value"
            );
        });
    });

    describe("Functionality of announcement of changes", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to announce changes", async () => {
            expectEvent(await nomoPointsCalcInstance.announceChanges(), "ChangesAnnouncement");
            const latestBlock = await time.latest();
            (await nomoPointsCalcInstance.announceTimestamp()).should.be.bignumber.equal(latestBlock);
        });

        it("Owner should be able to set a delay", async () => {
            const delay = defaultDelay.mul(toBN(2));
            const res = await nomoPointsCalcInstance.setDelay(delay);
            expectEvent(res, "DelayChanged", { newValue: delay });
            expectEvent(res, "ParametersChanged");
            (await nomoPointsCalcInstance.delay()).should.be.bignumber.equal(delay);
        });
        it("Owner shouldn't be able to set a delay if an uncorrect delay value", async () => {
            await expectRevert(nomoPointsCalcInstance.setDelay(one), "The delay must be more than 1 hour");
        });

        it("Owner should be able to set a window", async () => {
            const changesWindow = defaultChangesWindow.mul(toBN(2));
            const res = await nomoPointsCalcInstance.setChangesWindow(changesWindow);
            expectEvent(res, "WindowChanged", { newValue: changesWindow });
            expectEvent(res, "ParametersChanged");
            (await nomoPointsCalcInstance.changesWindow()).should.be.bignumber.equal(changesWindow);
        });
        it("Owner shouldn't be able to set a window if an uncorrect window value", async () => {
            await expectRevert(nomoPointsCalcInstance.setChangesWindow(one), "Invalid window value");
        });
    });

    describe("Оperations with parameters sets", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to allow parameters sets", async () => {
            await nomoPointsCalcInstance.allowParametersSets(one);
            (await nomoPointsCalcInstance.allowedParametersSets(one)).should.true;
        });
        it("Owner should be able to disallow parameters sets", async () => {
            await nomoPointsCalcInstance.disallowParametersSets(one);
            (await nomoPointsCalcInstance.allowedParametersSets(one)).should.false;
        });
    });

    describe("Setting multipliers", () => {
        afterEach(async () => await snapshotA.restore());

        it("Owner should be able to set a multiplier", async () => {
            const name = "Some name";
            const multiplier = one;
            await nomoPointsCalcInstance.setMultiplier(name, multiplier);
            (await nomoPointsCalcInstance.multipliers(name)).should.bignumber.equal(one);
        });

        it("Owner should be able to set multipliers", async () => {
            const sz = 3;
            const names = new Array(sz).fill().map((el, i) => `Parameter #${i}`);
            const multipliers = new Array(sz).fill().map((el, i) => toBN(+i + +1));
            await nomoPointsCalcInstance.setMultipliers(names, multipliers);
        });
        it("Owner shouldn't be able to set multipliers when _names.length != _multipliers.length", async () => {
            const names = new Array(2).fill().map((el, i) => `Parameter #${i}`);
            const multipliers = new Array(3).fill().map((el, i) => toBN(+i + +1));
            await expectRevert(
                nomoPointsCalcInstance.setMultipliers(names, multipliers),
                "_names.length != _multipliers.length"
            );
        });
    });

    describe("Calculation of points", () => {
        beforeEach(async () => {
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
            await nomoNFTInstance.setPosition(defaultPosition, defaultPositionName);
            const cardImageId = one;
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPosition,
                defaultSetId
            );
            await nomoNFTInstance.mintCard(player, cardImageId);
            // const cardImage = await nomoNFTInstance.getCardImageDataByTokenId(cardImageId);
            // cardImage.name.should.equal(defaultName);
            // cardImage.league.should.bignumber.equal(defaultLeague);
            // cardImage.gen.should.bignumber.equal(defaultGen);
            // cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
            // cardImage.parametersNames.should.have.lengthOf(10);
            // cardImage.parametersValues.should.have.lengthOf(0);
            // cardImage.parametersUpdateTime.should.bignumber.equal(zero);

            snapshotB = await snapshot();
        });
        afterEach(async () => await snapshotB.restore());

        it("Everybody shouldn't be able to calculate points when token's parameters set was not allowed", async () => {
            const tokenID = await nomoNFTInstance.getNumberOfTokens();
            const parametersUpdateTime = zero;
            await expectRevert(
                nomoPointsCalcInstance.calculatePoints(tokenID, parametersUpdateTime, { from: thirdParty }),
                "token's parameters set not allowed"
            );
        });

        it("Calculated points should be zero when parametersUpdateTime < _gameStartTime", async () => {
            await nomoPointsCalcInstance.allowParametersSets(defaultSetId);
            const tokenID = await nomoNFTInstance.getNumberOfTokens();
            (await nomoPointsCalcInstance.calculatePoints(tokenID, one, { from: thirdParty })).should.bignumber.equal(
                zero
            );
        });

        it("Everybody shouldn't be able to calculate points when parametersNames.length != parametersValues.length", async () => {
            await nomoPointsCalcInstance.allowParametersSets(defaultSetId);
            const tokenID = await nomoNFTInstance.getNumberOfTokens();
            const parametersUpdateTime = zero;
            await expectRevert(
                nomoPointsCalcInstance.calculatePoints(tokenID, parametersUpdateTime, { from: thirdParty }),
                "parametersNames.length != parametersValues.length"
            );
        });

        it("Everybody should be able to calculate points", async () => {
            // Updating parameters
            await nomoNFTInstance.updateParameters(one, defaultParamsValues);
            const txTimestamp = await time.latest();
            // const cardImage = await nomoNFTInstance.getCardImage(one);
            // cardImage.parametersNames.should.deep.equal(defaultParamsNames);
            // cardImage.parametersValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
            // cardImage.parametersUpdateTime.should.bignumber.equal(txTimestamp);

            // Setting multipliers
            let multipliers = new Array(defaultParamsArrSz).fill().map((el, i) => toBN(+i + +999999888));
            await nomoPointsCalcInstance.setMultipliers(defaultParamsNames, multipliers);

            // Allowing the parameters sets
            await nomoPointsCalcInstance.allowParametersSets(defaultSetId);

            const tokenID = await nomoNFTInstance.getNumberOfTokens();
            const parametersUpdateTime = txTimestamp;

            // Calculation of points
            const cardImage = await nomoNFTInstance.getCardImage(one);
            let parametersDivider = await nomoPointsCalcInstance.parametersDivider();
            let points = zero;
            for (let i = 0; i < cardImage.parametersNames.length; ++i)
                points = points.add(multipliers[i].mul(cardImage.parametersValues[i]));
            points = points.mul(toBN(10)).div(defaultDivider).div(parametersDivider).add(toBN(5)).div(toBN(10));
            (
                await nomoPointsCalcInstance.calculatePoints(tokenID, parametersUpdateTime, { from: thirdParty })
            ).should.bignumber.equal(toBN(points));

            // Setting new multipliers
            multipliers = new Array(defaultParamsArrSz).fill().map((el, i) => toBN(+i - +100000));
            await nomoPointsCalcInstance.setMultipliers(defaultParamsNames, multipliers);
            // Calculation of points when the summary of points is less or equal zero
            (
                await nomoPointsCalcInstance.calculatePoints(tokenID, parametersUpdateTime, { from: thirdParty })
            ).should.bignumber.equal(zero);
        });
    });

    describe("Status when not in the window of changes", () => {
        before(async () => {
            // Go to status when not in the window of changes
            const announceTimestamp = await nomoPointsCalcInstance.announceTimestamp();
            const delay = await nomoPointsCalcInstance.delay();
            const changesWindow = await nomoPointsCalcInstance.changesWindow();
            await time.increaseTo(announceTimestamp.add(delay).add(changesWindow));

            snapshotB = await snapshot();
        });
        afterEach(async () => await snapshotB.restore());

        it("Owner shouldn't be able to allow parameters' sets", async () => {
            await expectRevert(nomoPointsCalcInstance.allowParametersSets(one), "not in changes window");
        });
        it("Owner shouldn't be able to disallow parameters' sets", async () => {
            await expectRevert(nomoPointsCalcInstance.disallowParametersSets(one), "not in changes window");
        });
        it("Owner shouldn't be able to set a multiplier", async () => {
            await expectRevert(nomoPointsCalcInstance.setMultiplier("Some name", one), "not in changes window");
        });
        it("Owner should be able to set a delay", async () => {
            await expectRevert(nomoPointsCalcInstance.setDelay(defaultDelay), "not in changes window");
        });
        it("Owner should be able to set a window", async () => {
            await expectRevert(nomoPointsCalcInstance.setChangesWindow(defaultChangesWindow), "not in changes window");
        });
        it("Owner shouldn't be able to set multipliers", async () => {
            await expectRevert(
                nomoPointsCalcInstance.setMultipliers(defaultParamsNames, defaultParamsValues),
                "not in changes window"
            );
        });
    });

    describe("Getters", () => {
        afterEach(async () => await snapshotA.restore());

        it("Everybody should be able to get the divider value of multipliers", async () => {
            (await nomoPointsCalcInstance.MULTIPLIERS_DIVIDER()).should.bignumber.equal(defaultDivider);
        });
        it("Everybody should be able to get the value of parameters' divider", async () => {
            (await nomoPointsCalcInstance.parametersDivider()).should.bignumber.equal(defaultParametersDecimals);
        });
    });
});
