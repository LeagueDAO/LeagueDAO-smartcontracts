const hre = require("hardhat");
const ethers = hre.ethers;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

async function main() {
    // We get the contract to deploy
    const NomoNFT = await ethers.getContractFactory("NomoNFT");
    const nomoNFT = await NomoNFT.deploy();

    await nomoNFT.deployed();

    console.log("NomoNFT deployed to:", nomoNFT.address);

    // verify NomoNFT

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: nomoNFT.address,
            constructorArguments: []
        });
    }

    // create parameters names set
    console.log("Creating parameters names set");
    // use fill to make map work - https://stackoverflow.com/questions/5501581/javascript-new-arrayn-and-array-prototype-map-weirdness
    const defaultParamsNames = new Array(10).fill().map((el, i) => `Parameter #${i}`);

    await nomoNFT.createParametersSet(defaultParamsNames);

    // set position
    const positionCode = 1;
    const positionName = "Defender";
    await nomoNFT.setPosition(positionCode, positionName);

    // create cards images
    console.log("Creating Cards Images");

    //defines amount of the cards images
    const batchSize = 3;

    const names = new Array(batchSize).fill().map((el, i) => `Card Name#${i}`);
    const leagues = new Array(batchSize).fill().map((el, i) => i);
    const imagesLinks = new Array(batchSize)
        .fill()
        .map((el, i) => "https://ipfs.io/ipfs/QmdnmYwnJtPrduEQrfTM5FdUBgEkDm8HpQtF5iJC6Wshku/nft.jpg");
    const gen = 1;
    const positions = new Array(batchSize).fill().map(() => positionCode);
    const setId = 1;

    let tx = await nomoNFT.createCardsImages(names, imagesLinks, leagues, gen, positions, setId, { gasLimit: 2000000 });
    await tx.wait();

    // set parameters
    console.log("Updating parameters values for Cards Images");

    const cardsImagesIds = new Array(batchSize).fill().map((el, i) => i + 1);
    const defaultParamsValues = new Array(10).fill().map((el, i) => i * 3);
    const parametersForCardsImages = [];
    for (let i = 0; i < batchSize; i++) {
        parametersForCardsImages.push(...defaultParamsValues);
    }
    const points = new Array(batchSize).fill().map((el, i) => i * 42);

    tx = await nomoNFT.updateParametersForMany(cardsImagesIds, parametersForCardsImages, { gasLimit: 2000000 });
    await tx.wait();

    // mint tokens
    console.log("Minting NFTs");

    const users = process.env.USERS_ADDRESSES.split(",");

    const sizedUsers = users.slice(0, batchSize);

    await nomoNFT.mintCards(sizedUsers, cardsImagesIds);
    await nomoNFT.mintCards(sizedUsers, cardsImagesIds);

    //-------------- Deploy Router and leagues --------------

    const [deployer] = await hre.ethers.getSigners();

    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const NomoRouter = await hre.ethers.getContractFactory("NomoRouter");
    const NomoLeague = await hre.ethers.getContractFactory("NomoLeagueMock");
    const NomoPointsCalculator = await hre.ethers.getContractFactory("NomoPointsCalculator");

    let token = await ERC20Mock.deploy();
    await token.deployed();
    console.log("Reward token deployed to:", token.address);

    // deploy calculator
    let calculator = await NomoPointsCalculator.deploy(nomoNFT.address);
    await calculator.deployed();
    console.log("Calculator deployed to:", calculator.address);

    await calculator.allowParametersSets(1);

    const multipliers = new Array(defaultParamsNames.length).fill().map(() => getRandomInt(0, 10000));

    await calculator.setMultipliers(defaultParamsNames, multipliers);

    // deploy router
    let router;
    if (!process.env.NOMO_ROUTER) {
        router = await NomoRouter.deploy();
        await router.initialize(nomoNFT.address, [token.address], deployer.address);
        console.log("NomoRouter deployed to:", router.address);
    } else {
        router = await NomoRouter.attach(process.env.NOMO_ROUTER);
    }

    await router.deployed();
    await sleep(10000);

    // deploy leagues
    const league1Name = "First League name";
    const league2Name = "Second League name";

    let league1;
    if (!process.env.NOMO_LEAGUE1) {
        league1 = await NomoLeague.deploy();
        await league1.initialize(router.address, league1Name, 10, 5);
        console.log("NomoLeague 1 deployed to:", league1.address);
    } else {
        league1 = await NomoLeague.attach(process.env.NOMO_LEAGUE1);
    }

    let league2;
    if (!process.env.NOMO_LEAGUE2) {
        league2 = await NomoLeague.deploy();
        await league2.initialize(router.address, league2Name, 15, 5);
        console.log("NomoLeague 2 deployed to:", league2.address);
    } else {
        league2 = await NomoLeague.attach(process.env.NOMO_LEAGUE2);
    }

    // verify router and leagues
    if (
        hre.network.name !== "hardhat" &&
        hre.network.name !== "localhost" &&
        (!process.env.NOMO_ROUTER || !process.env.NOMO_LEAGUE1 || !process.env.NOMO_LEAGUE2)
    ) {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: router.address
        });
        await hre.run("verify:verify", {
            address: calculator.address,
            constructorArguments: [nomoNFT.address]
        });
        await hre.run("verify:verify", {
            address: league1.address
        });
        await hre.run("verify:verify", {
            address: league2.address
        });
    }

    console.log("Adding leagues to router");
    await router.addLeague(league1.address, 1);
    await router.addLeague(league2.address, 2);

    await router.setCalculator(1, calculator.address);

    console.log("Everything ready");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
