const { expect } = require("chai");
const { ethers } = require("hardhat");
const { snapshot } = require("../helpers");

let owner, user, thirdParty;
let nomoNFT, gen2PlayerToken, fantasyLeague;

const defaultName = "Some name";
const defaultImageURL = "https://somelink.com";
const defaultLeague = 111;
const defaultGen = 222;
const defaultArrSz = +10;
const defaultPositions = new Array(defaultArrSz).fill().map((el, i) => i);
// const defaultPositionsNames = new Array(defaultArrSz).fill().map((el, i) => `Position #${i}`);
const defaultSetId = 1;
const defaultParamsNames = new Array(defaultArrSz).fill().map((el, i) => `Parameter #${i}`);
// const defaultParamsValues = new Array(defaultArrSz).fill().map((el, i) => i);
// const defaultParametersDecimals = 100;

const GENESIS_NFT_ID = 1;
const DIVISION = 1;

async function createGenesisNFT() {
    await nomoNFT.setPosition(0, "positionName");
    await nomoNFT.setPosition(1, "positionName2");

    const cardId = 1;
    const cardImageId = 1;

    await nomoNFT.createCardImage(
        defaultName,
        defaultImageURL,
        defaultLeague,
        defaultGen,
        defaultPositions[0],
        defaultSetId
    );
    await nomoNFT.mintCard(user.address, cardImageId);

    await nomoNFT.createCardImage(defaultName, defaultImageURL, defaultLeague, defaultGen, 1, defaultSetId);
    await nomoNFT.mintCard(user.address, cardImageId + 1);

    expect(await nomoNFT.cardToCardImageID(cardId)).to.be.eq(1);
}

describe("Gen2PlayerToken", () => {
    let snapshotA;

    before(async () => {
        [owner, user, thirdParty] = await ethers.getSigners();

        const NomoNFT = await ethers.getContractFactory("NomoNFT");
        nomoNFT = await NomoNFT.deploy();
        await nomoNFT.deployed();

        await nomoNFT.createParametersSet(defaultParamsNames);

        const FantasyLeague = await ethers.getContractFactory("FantasyLeague");
        fantasyLeague = await FantasyLeague.deploy();
        await fantasyLeague.deployed();

        const Gen2PlayerToken = await ethers.getContractFactory("Gen2PlayerToken");
        gen2PlayerToken = await Gen2PlayerToken.deploy();
        await gen2PlayerToken.deployed();

        await gen2PlayerToken.setGenesisNFT(nomoNFT.address);
        await gen2PlayerToken.setFantasyLeague(fantasyLeague.address);

        await createGenesisNFT();

        snapshotA = await snapshot();
    });

    afterEach(async () => await snapshotA.restore());

    it("Impossible to have two NFT of image in one division", async () => {
        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        await expect(gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address)).to.be.revertedWith(
            "Impossible to have two NFT from one image in one division"
        );
    });
    it("User can transfer nft only to whitelisted address", async () => {
        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        await expect(
            gen2PlayerToken.connect(user).transferFrom(user.address, thirdParty.address, GENESIS_NFT_ID)
        ).to.be.revertedWith("Address not allowed to send or recive tokens");

        await gen2PlayerToken.connect(owner).setTransferAllowListAddr(thirdParty.address, true);

        await gen2PlayerToken.connect(user).transferFrom(user.address, thirdParty.address, GENESIS_NFT_ID);
    });
    it("Only whitelisted address can burn nft", async () => {
        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        await expect(gen2PlayerToken.connect(user).burn(GENESIS_NFT_ID)).to.be.revertedWith(
            "Address not allowed to burn nft"
        );

        await gen2PlayerToken.connect(owner).setTransferAllowListAddr(user.address, true);

        await gen2PlayerToken.connect(user).burn(GENESIS_NFT_ID);
        expect(await gen2PlayerToken.balanceOf(user.address)).to.be.eq(0);
    });
    it("Possible to remint nft after burn", async () => {
        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        await gen2PlayerToken.connect(owner).setTransferAllowListAddr(user.address, true);
        await gen2PlayerToken.connect(user).burn(GENESIS_NFT_ID);
        expect(await gen2PlayerToken.balanceOf(user.address)).to.be.eq(0);

        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        expect(await gen2PlayerToken.balanceOf(user.address)).to.be.eq(1);
    });
    it("Impossible to create NFT from nonexisting image", async () => {
        const NONEXISTING_IMAGE_ID = 100;
        await expect(gen2PlayerToken.mint(NONEXISTING_IMAGE_ID, DIVISION, user.address)).to.be.revertedWith(
            "Impossible to create NFT from nonexisting image"
        );
    });
    it("Overwritten method works fine", async () => {
        const ERC_721_INTERFACE_ID = "0x5b5e139f";
        const NOT_SUPPORTED_INTERFACE = "0xd48e638a";

        expect(await gen2PlayerToken.supportsInterface(NOT_SUPPORTED_INTERFACE)).to.be.false;
        expect(await gen2PlayerToken.supportsInterface(ERC_721_INTERFACE_ID)).to.be.true;
    });
    it("Gets Token Position", async () => {
        const GEN2_NFT_ID = 1;
        await gen2PlayerToken.mint(GENESIS_NFT_ID, DIVISION, user.address);
        expect(await gen2PlayerToken.getTokenPosition(GEN2_NFT_ID)).to.be.eq(0);
    });
    it("Impossible to disable zero position code", async () => {
        await expect(gen2PlayerToken.setPositionMintDisabling(0, true)).to.be.revertedWith("Zero position code");
    });
    it("Impossible to mint image with disabled position", async () => {
        await gen2PlayerToken.setPositionMintDisabling(1, true);
        await expect(gen2PlayerToken.mint(GENESIS_NFT_ID + 1, DIVISION, user.address)).to.be.revertedWith(
            "Disabled position"
        );
    });
});
