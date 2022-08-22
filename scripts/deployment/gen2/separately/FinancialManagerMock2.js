const { ethers, upgrades } = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { verify, sleep, getAddressSaver } = require("../../helpers/helpers");
const { parseUnits } = ethers.utils;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const FALSE_STRATEGY = "0xE0554f6f79cAfb0f2A8581aCEC9E87c48c875795";
    const MULTISIG_USER = "0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9";
    const FANTASY_LEAGUE = "0x060708C3Fecf8d2395097E27C8Db10246dC83314";
    const TOKENS_FOR_FINANCIAL_MANAGER = [
        "0x7cdeAfCD8A775Ab6B9645394bEaD514D5dBa8CEb",
        "0x7cdeAfCD8A775Ab6B9645394bEaD514D5dBa8CEb",
        "0x7cdeAfCD8A775Ab6B9645394bEaD514D5dBa8CEb",
        "0x7cdeAfCD8A775Ab6B9645394bEaD514D5dBa8CEb"
    ];
    const FinancialManager = await ethers.getContractFactory("FinancialManagerMock2");
    const financialManager = await upgrades.deployProxy(
        FinancialManager,
        [FALSE_STRATEGY, MULTISIG_USER, FANTASY_LEAGUE, TOKENS_FOR_FINANCIAL_MANAGER],
        { initializer: "initialize" }
    );
    await financialManager.deployed();

    console.log("proxy address:", financialManager.address);

    // await verify(await getImplementationAddress(ethers.provider, passNFT.address), [
    //   "0x0000000000000000000000000000000000000000",
    //   parseUnits("20"),
    //   "https://megaleague.mypinata.cloud/ipfs/QmNY132Lyogzp8y6GcDHV94ir5PxDjLxGKR8KDocUy5SUa",
    //   "1661353200",
    //   "0",
    //   "1661356800",
    //   ["0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"],
    //   ["300000000000000000000"]
    // ]);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/deployment/gen2/separately/FinancialManagerMock2.js --network mumbai
//

// Deploying contracts with the account: 0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9
// proxy address: 0x8f5185ACf96A61316603aCab18C46e31Ea01117C
// implementation: 0x515Fc753EFacaa99047421b13E5Db00A92E6EFF7

// npx hardhat verify "0xFfb79AA06f60beB020252649364Ec6D339E2f786" --network mumbai
