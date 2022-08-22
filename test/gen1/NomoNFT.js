require("chai").should();
const { BN, constants, expectEvent, expectRevert, time } = require("@openzeppelin/test-helpers");

const toBN = (x) => new BN(x);
const zero = toBN(0);
const one = toBN(1);

const NomoNFT = artifacts.require("NomoNFT");

contract("NOMO NFT test", (accounts) => {
    let [owner, player, thirdParty] = accounts;
    let nomoNFTInstance;
    const defaultName = "Some name";
    const defaultImageURL = "https://somelink.com";
    const defaultLeague = toBN(111);
    const defaultGen = toBN(222);
    const defaultArrSz = +10;
    const defaultPositions = new Array(defaultArrSz).fill().map((el, i) => toBN(i));
    const defaultPositionsNames = new Array(defaultArrSz).fill().map((el, i) => `Position #${i}`);
    const defaultSetId = one;
    const defaultParamsNames = new Array(defaultArrSz).fill().map((el, i) => `Parameter #${i}`);
    const defaultParamsValues = new Array(defaultArrSz).fill().map((el, i) => toBN(i));
    const defaultParametersDecimals = toBN(100);

    describe("Setting the base URI", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
        });

        it("Owner should be able to set the base URI", async () => {
            const URL = "http://info.cern.ch/";
            await nomoNFTInstance.setBaseURI(URL);
            (await nomoNFTInstance.baseURI()).should.equal(URL);
        });
    });

    describe("Player position setting", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
        });

        it("Owner should be able to set a player position", async () => {
            const res = await nomoNFTInstance.setPosition(defaultPositions[0], defaultPositionsNames[0]);
            expectEvent(res, "CreatedPositionCode", {
                _position: defaultPositions[0],
                _positionName: defaultPositionsNames[0]
            });
            (await nomoNFTInstance.positionCodeToName(defaultPositions[0])).should.equal(defaultPositionsNames[0]);
        });
    });

    describe("Parameters names set creation", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
        });

        it("Owner should be able to create parameters names set", async () => {
            const res = await nomoNFTInstance.createParametersSet(defaultParamsNames);

            expectEvent(res, "CreatedParametersNamesSet", { _setId: one });

            (await nomoNFTInstance.getNamesSet(defaultSetId)).should.deep.equal(defaultParamsNames);
            (await nomoNFTInstance.getNumberOfNamesSets()).should.bignumber.equal(one);
        });
    });
    describe("Card image creation", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
        });

        it("Owner should be able to create a card image", async () => {
            await nomoNFTInstance.setPosition(defaultPositions[0], defaultPositionsNames[0]);

            const res = await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );

            expectEvent(res, "NewCardImageCreated", {
                _cardImageId: one,
                _name: defaultName,
                _imageURL: defaultImageURL,
                _league: defaultLeague,
                _gen: defaultGen,
                _playerPosition: defaultPositions[0],
                _setId: defaultSetId
            });

            const cardImage = await nomoNFTInstance.getCardImage(one);
            cardImage.name.should.equal(defaultName);
            cardImage.imageURL.should.equal(defaultImageURL);
            cardImage.league.should.bignumber.equal(defaultLeague);
            cardImage.gen.should.bignumber.equal(defaultGen);
            cardImage.playerPosition.should.bignumber.equal(defaultPositions[0]);
            cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
            cardImage.parametersNames.should.have.lengthOf(10);
            cardImage.parametersValues.should.have.lengthOf(0);
            cardImage.parametersUpdateTime.should.bignumber.equal(zero);
        });
        it("Owner shouldn't be able to create a card image when position code is unknown", async () => {
            await expectRevert(
                nomoNFTInstance.createCardImage(
                    defaultName,
                    defaultImageURL,
                    defaultLeague,
                    defaultGen,
                    defaultPositions[0],
                    defaultSetId
                ),
                "Unknown position code"
            );
        });
        it("Owner should be able to create a batch of cards images", async () => {
            const batchSize = 10;
            // use fill to make map work - https://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness
            const names = new Array(batchSize).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSize).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSize).fill().map((el, i) => defaultLeague.addn(i));

            for (let i = 0; i < batchSize; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);
            const res = await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );

            for (let i = 0; i < batchSize; ++i) {
                const cardImageId = toBN(i + 1);
                const name = names[i];
                const imageURL = imageURLs[i];
                const league = leagues[i];

                expectEvent(res, "NewCardImageCreated", {
                    _cardImageId: cardImageId,
                    _name: name,
                    _imageURL: imageURL,
                    _league: league,
                    _gen: defaultGen,
                    _playerPosition: defaultPositions[i],
                    _setId: defaultSetId
                });
                const cardImage = await nomoNFTInstance.getCardImage(cardImageId);
                cardImage.name.should.equal(name);
                cardImage.imageURL.should.equal(imageURL);
                cardImage.league.should.bignumber.equal(league);
                cardImage.gen.should.bignumber.equal(defaultGen);
                cardImage.playerPosition.should.bignumber.equal(defaultPositions[i]);
                cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
                cardImage.parametersNames.should.have.lengthOf(10);
                cardImage.parametersValues.should.have.lengthOf(0);
                cardImage.parametersUpdateTime.should.bignumber.equal(zero);
            }
        });
        it("Owner shouldn't be able to create a batch of cards images when names.length != leagues.length", async () => {
            const batchSizeForNames = 10;
            const batchSizeForLeagues = 15;
            // use fill to make map work - https://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness
            const names = new Array(batchSizeForNames).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSizeForNames).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSizeForLeagues).fill().map((el, i) => defaultLeague.addn(i));

            await expectRevert(
                nomoNFTInstance.createCardsImages(
                    names,
                    imageURLs,
                    leagues,
                    defaultGen,
                    defaultPositions,
                    defaultSetId
                ),
                "names.length != leagues.length"
            );
        });
        it("Owner shouldn't be able to create a batch of cards images when _imagesURLs.length != _names.length", async () => {
            const batchSize = 10;
            const batchSizeForImageURLs = 15;
            // use fill to make map work - https://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness
            const names = new Array(batchSize).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSizeForImageURLs).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSize).fill().map((el, i) => defaultLeague.addn(i));

            await expectRevert(
                nomoNFTInstance.createCardsImages(
                    names,
                    imageURLs,
                    leagues,
                    defaultGen,
                    defaultPositions,
                    defaultSetId
                ),
                "imagesURLs.length != names.length"
            );
        });
        it("Owner shouldn't be able to create a batch of cards images when _playerPositions.length != _names.length", async () => {
            const batchSize = 10;
            const batchSizeForPositions = 15;
            // use fill to make map work - https://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness
            const names = new Array(batchSize).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSize).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSize).fill().map((el, i) => defaultLeague.addn(i));
            const positions = new Array(batchSizeForPositions).fill().map((el, i) => toBN(i));

            await expectRevert(
                nomoNFTInstance.createCardsImages(names, imageURLs, leagues, defaultGen, positions, defaultSetId),
                "playerPositions.length != names.length"
            );
        });
    });

    describe("Changing cards properties", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
            await nomoNFTInstance.setPosition(defaultPositions[0], defaultPositionsNames[0]);
        });

        it("Owner should be able to change card name", async () => {
            const newName = "Other name";

            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );
            await nomoNFTInstance.changeCardImageName(one, newName);

            const res = await nomoNFTInstance.changeCardImageName(one, newName);
            expectEvent(res, "ChangedCardImageName", {
                _cardImageId: one,
                _name: newName
            });

            const cardImage = await nomoNFTInstance.getCardImage(one);
            cardImage.name.should.equal(newName);
        });
        it("Owner shouldn't be able to change card name with empty name", async () => {
            let newName = "";
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );

            await expectRevert(nomoNFTInstance.changeCardImageName(one, newName), "Empty name");
        });
        it("Owner shouldn't be able to change card name when card image isn't exist", async () => {
            const newName = "Other name";
            const nonExistentCardImage = new BN(10);
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );
            await expectRevert(
                nomoNFTInstance.changeCardImageName(nonExistentCardImage, newName),
                "Card image !exists"
            );
        });
        it("Owner should be able to update card image parameters", async () => {
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );
            const res = await nomoNFTInstance.updateParameters(one, defaultParamsValues);
            const txTimestamp = await time.latest();

            expectEvent(res, "UpdatedCardImageParameters", {
                _cardImageId: one
            });

            const cardImage = await nomoNFTInstance.getCardImage(one);
            cardImage.parametersNames.should.deep.equal(defaultParamsNames);
            cardImage.parametersValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
            cardImage.parametersUpdateTime.should.bignumber.equal(txTimestamp);
        });
        it("Owner shouldn't be able to update card image parameters when values.length != names.length", async () => {
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );

            const paramsValues = new Array(5).fill().map((el, i) => toBN(i));
            await expectRevert(nomoNFTInstance.updateParameters(one, paramsValues), "unexpected parameters length");
        });
        it("Owner should be able to change card image position", async () => {
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );

            await nomoNFTInstance.setPosition(defaultPositions[1], defaultPositionsNames[1]);
            const res = await nomoNFTInstance.changeCardImagePosition(one, defaultPositions[1]);

            expectEvent(res, "ChangedCardImagePosition", {
                _cardImageId: one,
                _position: defaultPositions[1],
                _positionName: defaultPositionsNames[1]
            });

            const cardImage = await nomoNFTInstance.getCardImage(one);
            cardImage.playerPosition.should.bignumber.equal(defaultPositions[1]);
            await nomoNFTInstance.mintCard(owner, one);
            (await nomoNFTInstance.getCardImagePositionNameByTokenId(one)).should.equal(defaultPositionsNames[1]);
        });
        it("Owner shouldn't be able to change card image position when card image isn't exist", async () => {
            const nonExistentCardImage = one;
            await nomoNFTInstance.setPosition(defaultPositions[1], defaultPositionsNames[1]);
            await expectRevert(
                nomoNFTInstance.changeCardImagePosition(nonExistentCardImage, defaultPositions[1]),
                "Card image !exists"
            );
        });
        it("Owner shouldn't be able to change card image position when position code is unknown", async () => {
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );
            await expectRevert(
                nomoNFTInstance.changeCardImagePosition(one, defaultPositions[1]),
                "Unknown position code"
            );
        });
    });
    describe("Updating parameters names set properties", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
        });

        it("Owner should be able to update a name of the set parameter", async () => {
            const newName = "Other name";

            const res = await nomoNFTInstance.updateParametersNameInSet(defaultSetId, one, newName);
            expectEvent(res, "UpdatedParametersNamesSet", { _setId: defaultSetId });

            (await nomoNFTInstance.getNamesSet(defaultSetId))[1].should.equal(newName);
        });
        it("Owner shouldn't be able to update a name of the set parameter when params names set !exists", async () => {
            const numOfNamesSets = toBN(await nomoNFTInstance.getNumberOfNamesSets());
            const newName = "Other name";

            await expectRevert(
                nomoNFTInstance.updateParametersNameInSet(numOfNamesSets.add(one), one, newName),
                "Params names set !exists"
            );
        });

        it("Owner should be able to update names of the set parameters", async () => {
            const newParamsNames = new Array(defaultArrSz).fill().map((el, i) => `Other parameter #${i}`);

            const res = await nomoNFTInstance.updateParametersNamesSet(defaultSetId, newParamsNames);
            expectEvent(res, "UpdatedParametersNamesSet", { _setId: defaultSetId });

            const nameSet = await nomoNFTInstance.getNamesSet(defaultSetId);
            const numOfNamesSets = await nomoNFTInstance.getNumberOfNamesSets();
            for (let i = 0; i < numOfNamesSets; ++i) nameSet[i].should.equal(newParamsNames[i]);
        });
        it("Owner shouldn't be able to update names of the set parameters when new set length differs", async () => {
            const newArraySz = +defaultArrSz + +1;
            const newParamsNames = new Array(newArraySz).fill().map((el, i) => `Other parameter #${i}`);

            await expectRevert(
                nomoNFTInstance.updateParametersNamesSet(defaultSetId, newParamsNames),
                "New set length differs"
            );
        });
        it("Owner shouldn't be able to update names of the set parameters when params names set !exists", async () => {
            const numOfNamesSets = toBN(await nomoNFTInstance.getNumberOfNamesSets());
            const newParamsNames = new Array(defaultArrSz).fill().map((el, i) => `Other parameter #${i}`);

            await expectRevert(
                nomoNFTInstance.updateParametersNamesSet(numOfNamesSets.add(one), newParamsNames),
                "Params names set !exists"
            );
        });

        it("Owner should be able to update unsafe names of the set parameters", async () => {
            const newArraySz = +defaultArrSz - +1;
            const newParamsNames = new Array(newArraySz).fill().map((el, i) => `Other parameter #${i}`);

            const res = await nomoNFTInstance.updateParametersNamesSetUnsafe(defaultSetId, newParamsNames);
            expectEvent(res, "UpdatedParametersNamesSet", { _setId: defaultSetId });

            const nameSet = await nomoNFTInstance.getNamesSet(defaultSetId);
            nameSet.length.should.equal(newArraySz);
            for (let i = 0; i < newArraySz; ++i) nameSet[i].should.equal(newParamsNames[i]);
        });
        it("Owner shouldn't be able to update unsafe names of the set parameters when params names set !exists", async () => {
            const numOfNamesSets = toBN(await nomoNFTInstance.getNumberOfNamesSets());
            const newParamsNames = new Array(defaultArrSz).fill().map((el, i) => `Other parameter #${i}`);

            await expectRevert(
                nomoNFTInstance.updateParametersNamesSetUnsafe(numOfNamesSets.add(one), newParamsNames),
                "Params names set !exists"
            );
        });
    });
    describe("Binding card image's parameters names set", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
            await nomoNFTInstance.createParametersSet(defaultParamsNames);

            const batchSize = 10;
            const names = new Array(batchSize).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSize).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSize).fill().map((el, i) => defaultLeague.addn(i));
            for (let i = 0; i < batchSize; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);
            await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );
        });

        it("Owner should be able to bind card image's parameters names set", async () => {
            const cardImageId = one;
            const setId = toBN(2);

            const res = await nomoNFTInstance.bindCardImageToParametersNamesSet(cardImageId, setId);
            expectEvent(res, "BindedCardImageToNamesSet", { _cardImageId: cardImageId, _setId: setId });

            const cardImage = await nomoNFTInstance.getCardImage(cardImageId);
            cardImage.parametersSetId.should.bignumber.equal(setId);
        });
        it("Owner shouldn't be able to bind card image's parameters names set when card image !exists", async () => {
            const nextCardImage = toBN(+10 + +1);
            const setId = toBN(2);
            await expectRevert(
                nomoNFTInstance.bindCardImageToParametersNamesSet(nextCardImage, setId),
                "Card image !exists"
            );
        });
        it("Owner shouldn't be able to bind card image's parameters names set when params names set !exists", async () => {
            const cardImageId = one;
            await expectRevert(
                nomoNFTInstance.bindCardImageToParametersNamesSet(cardImageId, defaultArrSz),
                "Params names set !exists"
            );
        });

        it("Owner should be able to bind card images' parameters names set", async () => {
            const cardImageIds = new Array(2).fill().map((el, i) => toBN(+i + +1));
            const setId = toBN(2);

            const res = await nomoNFTInstance.bindCardImageToParametersNamesSetForMany(cardImageIds, setId);
            for (let i = 0; i < cardImageIds.length; ++i)
                expectEvent(res, "BindedCardImageToNamesSet", { _cardImageId: cardImageIds[i], _setId: setId });

            let cardImage;
            for (let i = 0; i < cardImageIds.length; ++i) {
                cardImage = await nomoNFTInstance.getCardImage(cardImageIds[i]);
                cardImage.parametersSetId.should.bignumber.equal(setId);
            }
        });
        it("Owner shouldn't be able to bind card images' parameters names set when card image !exists", async () => {
            const cardImageIds = [toBN(+10 + +1), toBN(+10 + +2)];
            const setId = toBN(2);
            await expectRevert(
                nomoNFTInstance.bindCardImageToParametersNamesSetForMany(cardImageIds, setId),
                "Card image !exists"
            );
        });
        it("Owner shouldn't be able to bind card images' parameters names set when params names set !exists", async () => {
            const cardImageIds = [one, toBN(2)];
            await expectRevert(
                nomoNFTInstance.bindCardImageToParametersNamesSetForMany(cardImageIds, defaultArrSz),
                "Params names set !exists"
            );
        });
    });
    describe("Updating card image's parameters names set properties", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);

            const batchSize = 10;
            const names = new Array(batchSize).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(batchSize).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(batchSize).fill().map((el, i) => defaultLeague.addn(i));
            for (let i = 0; i < batchSize; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);
            await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );
        });

        it("Owner should be able to update card images' parameters", async () => {
            const cardImageIds = new Array(2).fill().map((el, i) => toBN(+i + +1));
            const paramsValues = new Array(+defaultArrSz * +cardImageIds.length).fill().map((el, i) => toBN(i));
            const res = await nomoNFTInstance.updateParametersForMany(cardImageIds, paramsValues);
            const txTimestamp = await time.latest();

            let cardImage;
            let k = 0;
            for (let i = 0; i < cardImageIds.length; ++i) {
                expectEvent(res, "UpdatedCardImageParameters", {
                    _cardImageId: cardImageIds[i]
                });

                cardImage = await nomoNFTInstance.getCardImage(cardImageIds[i]);
                cardImage.parametersNames.should.deep.equal(defaultParamsNames);
                for (let j = 0; j < cardImage.parametersValues.length; ++j) {
                    cardImage.parametersValues[j].should.bignumber.equal(toBN(k));
                    ++k;
                }
                cardImage.parametersUpdateTime.should.bignumber.equal(txTimestamp);
            }
        });
        it("Owner shouldn't be able to update card images' parameters when values.length != expected names.length", async () => {
            const cardImageIds = new Array(2).fill().map((el, i) => toBN(+i + +1));
            const paramsValues = new Array(+defaultArrSz / +2).fill().map((el, i) => toBN(i));
            await expectRevert(
                nomoNFTInstance.updateParametersForMany(cardImageIds, paramsValues),
                "unexpected parameters length"
            );
        });
    });

    describe("Card creation/NFT minting", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
        });
        it("Owner should be able to mint a card", async () => {
            await nomoNFTInstance.setPosition(defaultPositions[0], defaultPositions[0]);

            const cardId = toBN(1);
            const cardImageId = one;

            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );

            //const cardImageCreationTime = await time.latest();

            const res = await nomoNFTInstance.mintCard(player, cardImageId);
            expectEvent(res, "NewCardCreated", { _cardImageId: cardImageId, _tokenId: cardId, _player: player });
            expectEvent(res, "Transfer", { from: constants.ZERO_ADDRESS, to: player, tokenId: cardId });

            (await nomoNFTInstance.cardToCardImageID(cardId)).should.bignumber.equal(cardImageId);
            (await nomoNFTInstance.getNumberOfTokens()).should.bignumber.equal(toBN(1));

            const cardImage = await nomoNFTInstance.getCardImageDataByTokenId(cardId);
            cardImage.name.should.equal(defaultName);
            cardImage.league.should.bignumber.equal(defaultLeague);
            cardImage.gen.should.bignumber.equal(defaultGen);
            cardImage.playerPosition.should.bignumber.equal(defaultPositions[0]);
            cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
            cardImage.parametersNames.should.have.lengthOf(defaultArrSz);
            cardImage.parametersValues.should.have.lengthOf(0);
            cardImage.parametersUpdateTime.should.bignumber.equal(zero);
            // cardImage.name.should.equal(defaultName);
            // cardImage.league.should.bignumber.equal(defaultLeague);
            // cardImage.gen.should.bignumber.equal(defaultGen);
            // cardImage.points.should.bignumber.equal(defaultPoints);
            // cardImage.pointsUpdateTime.should.bignumber.equal(cardImageCreationTime);
            // cardImage.parametersNames.should.deep.equal(defaultParamsNames);
            // cardImage.parametersValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
            // cardImage.parametersUpdateTime.should.bignumber.equal(cardImageCreationTime);
        });
        it("Owner should be able to mint a batch of cards", async () => {
            for (let i = 0; i < defaultArrSz; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);

            // creating card image with id = 1, want to test NFT minting with non-first cards images
            await nomoNFTInstance.createCardImage("Test", "Test", zero, zero, zero, zero);

            const names = new Array(defaultArrSz).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(defaultArrSz).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(defaultArrSz).fill().map((el, i) => defaultLeague.addn(i));
            await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );

            const cardImageIds = new Array(defaultArrSz).fill().map((el, i) => toBN(i + 2));
            //const cardImageCreationTime = await time.latest();
            let mintAccounts = new Array(defaultArrSz).fill().map((el, i) => accounts[i]);
            const res = await nomoNFTInstance.mintCards(mintAccounts, cardImageIds);

            for (let i = 0; i < defaultArrSz; i++) {
                const player = mintAccounts[i];

                const curTokenID = toBN(i + 1);
                expectEvent(res, "NewCardCreated", {
                    _cardImageId: cardImageIds[i],
                    _tokenId: curTokenID,
                    _player: player
                });
                expectEvent(res, "Transfer", { from: constants.ZERO_ADDRESS, to: player, tokenId: curTokenID });

                (await nomoNFTInstance.cardToCardImageID(curTokenID)).should.bignumber.equal(cardImageIds[i]);
                (await nomoNFTInstance.getNumberOfTokens()).should.bignumber.equal(toBN(mintAccounts.length));

                const cardImage = await nomoNFTInstance.getCardImageDataByTokenId(curTokenID);
                cardImage.name.should.equal(names[i]);
                cardImage.league.should.bignumber.equal(leagues[i]);
                cardImage.gen.should.bignumber.equal(defaultGen);
                cardImage.playerPosition.should.bignumber.equal(defaultPositions[i]);
                cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
                cardImage.parametersNames.should.have.lengthOf(defaultArrSz);
                cardImage.parametersValues.should.have.lengthOf(0);
                cardImage.parametersUpdateTime.should.bignumber.equal(zero);
                // cardImage.name.should.equal(names[i]);
                // cardImage.league.should.bignumber.equal(leagues[i]);
                // cardImage.gen.should.bignumber.equal(defaultGen);
                // cardImage.points.should.bignumber.equal(defaultPoints);
                // cardImage.pointsUpdateTime.should.bignumber.equal(cardImageCreationTime);
                // cardImage.parametersNames.should.deep.equal(defaultParamsNames);
                // cardImage.parametersValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
                // cardImage.parametersUpdateTime.should.bignumber.equal(cardImageCreationTime);
            }
        });
        it("Owner shouldn't be able to mint a batch of cards when players.length != cardsImagesIds.length", async () => {
            for (let i = 0; i < defaultArrSz; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);

            const names = new Array(defaultArrSz).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(defaultArrSz).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(defaultArrSz).fill().map((el, i) => defaultLeague.addn(i));
            await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );

            const cardImageIds = new Array(+defaultArrSz / +2).fill().map((el, i) => toBN(i));
            const mintAccounts = new Array(defaultArrSz).fill().map((el, i) => accounts[i]);
            await expectRevert.unspecified(nomoNFTInstance.mintCards(mintAccounts, cardImageIds));
        });
        it("Owner should be able to mint a batch of cards to a player", async () => {
            for (let i = 0; i < defaultArrSz; ++i)
                await nomoNFTInstance.setPosition(defaultPositions[i], defaultPositionsNames[i]);

            const names = new Array(defaultArrSz).fill().map((el, i) => `${defaultName}${i}`);
            const imageURLs = new Array(defaultArrSz).fill().map((el, i) => `${defaultImageURL}${i}`);
            const leagues = new Array(defaultArrSz).fill().map((el, i) => defaultLeague.addn(i));
            await nomoNFTInstance.createCardsImages(
                names,
                imageURLs,
                leagues,
                defaultGen,
                defaultPositions,
                defaultSetId
            );

            const cardImageIds = new Array(defaultArrSz).fill().map((el, i) => toBN(i + 1));
            const player = accounts[1];
            const res = await nomoNFTInstance.mintCardsToPlayer(player, cardImageIds);

            for (let i = 0; i < defaultArrSz; i++) {
                const curTokenID = cardImageIds[i];
                expectEvent(res, "NewCardCreated", {
                    _cardImageId: cardImageIds[i],
                    _tokenId: curTokenID,
                    _player: player
                });
                expectEvent(res, "Transfer", { from: constants.ZERO_ADDRESS, to: player, tokenId: curTokenID });

                (await nomoNFTInstance.cardToCardImageID(curTokenID)).should.bignumber.equal(cardImageIds[i]);
                (await nomoNFTInstance.getNumberOfTokens()).should.bignumber.equal(toBN(defaultArrSz));

                const cardImage = await nomoNFTInstance.getCardImageDataByTokenId(curTokenID);
                cardImage.name.should.equal(names[i]);
                cardImage.league.should.bignumber.equal(leagues[i]);
                cardImage.gen.should.bignumber.equal(defaultGen);
                cardImage.playerPosition.should.bignumber.equal(defaultPositions[i]);
                cardImage.parametersSetId.should.bignumber.equal(defaultSetId);
                cardImage.parametersNames.should.have.lengthOf(defaultArrSz);
                cardImage.parametersValues.should.have.lengthOf(0);
                cardImage.parametersUpdateTime.should.bignumber.equal(zero);
            }
        });
    });
    describe("Getters", () => {
        beforeEach(async () => {
            nomoNFTInstance = await NomoNFT.new();
            await nomoNFTInstance.createParametersSet(defaultParamsNames);
            await nomoNFTInstance.setPosition(defaultPositions[0], defaultPositionsNames[0]);
            await nomoNFTInstance.createCardImage(
                defaultName,
                defaultImageURL,
                defaultLeague,
                defaultGen,
                defaultPositions[0],
                defaultSetId
            );
            await nomoNFTInstance.updateParameters(one, defaultParamsValues);
        });
        it("Everybody should be able to get card image params values", async () => {
            const paramsValues = await nomoNFTInstance.getParameters(one);
            paramsValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
        });
        it("Everybody should be able to get card image param value", async () => {
            (await nomoNFTInstance.getParameter(one, one)).should.bignumber.equal(defaultParamsValues[1]);
        });
        it("Everybody should be able to get card image params", async () => {
            const params = await nomoNFTInstance.getParameterValuesAndNames(one);
            params.parametersNames.should.deep.equal(defaultParamsNames);
            params.parametersValues.forEach((val, i) => val.should.bignumber.equal(defaultParamsValues[i]));
        });
        it("Everybody should be able to get card image param", async () => {
            let res = await nomoNFTInstance.getParameterValueAndName(one, one);
            res.parameterValue.should.bignumber.equal(defaultParamsValues[1]);
            res.parameterName.should.equal("Parameter #1");
        });
        it("Everybody shouldn't be able to get card image data by token id with non-existent card image", async () => {
            const nonExistentTokenId = new BN(15);
            await nomoNFTInstance.mintCard(owner, one);
            await expectRevert(nomoNFTInstance.getCardImageDataByTokenId(nonExistentTokenId), "Card image !exists");
        });
        it("Everybody should be able to get card image position by token id with non-existent card image", async () => {
            const tokenId = one;
            await nomoNFTInstance.mintCard(owner, tokenId);
            (await nomoNFTInstance.getCardImagePositionNameByTokenId(tokenId)).should.equal(defaultPositionsNames[0]);
        });
        it("Everybody shouldn't be able to get card image position by token id with non-existent card image", async () => {
            const nonExistentTokenId = new BN(15);
            await nomoNFTInstance.mintCard(owner, one);
            await expectRevert(
                nomoNFTInstance.getCardImagePositionNameByTokenId(nonExistentTokenId),
                "Card image !exists"
            );
        });
        it("Everybody should be able to get decimals of parameters", async () => {
            (await nomoNFTInstance.PARAMETERS_DECIMALS()).should.bignumber.equal(defaultParametersDecimals);
        });
        it("Everybody should be able to get the base URI", async () => {
            (await nomoNFTInstance.baseURI()).should.equal("");
        });
        it("Everybody should be able to get the token URI", async () => {
            const tokenId = one;
            await nomoNFTInstance.mintCard(owner, tokenId);
            (await nomoNFTInstance.tokenURI(tokenId)).should.equal("");
        });
    });
});
