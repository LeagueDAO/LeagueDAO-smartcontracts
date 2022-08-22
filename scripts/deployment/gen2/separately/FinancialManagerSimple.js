const { ethers, upgrades } = require("hardhat");
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { verify, sleep, getAddressSaver } = require("../../helpers/helpers");
const { parseUnits } = ethers.utils;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const PassNFT = await ethers.getContractFactory("LeaguePassNFT");
    const passNFT = await upgrades.deployProxy(
        PassNFT,
        [
            "0x0000000000000000000000000000000000000000",
            parseUnits("20"),
            "https://megaleague.mypinata.cloud/ipfs/QmNY132Lyogzp8y6GcDHV94ir5PxDjLxGKR8KDocUy5SUa",
            "1661353200",
            "0",
            "1661356800",
            ["0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"],
            ["300000000000000000000"]
        ],
        { initializer: "initialize" }
    );
    await passNFT.deployed();

    console.log("proxy address:", passNFT.address);

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

// npx hardhat run scripts/deployment/gen2/separately/LeaguePassNFT.js --network mumbai
// npx hardhat verify "0x8A10c45c6E24eB2B827fe7E0b369Fb939C2700C8" --network mumbai

// Deploying contracts with the account: 0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9
// proxy address: 0x8f5185ACf96A61316603aCab18C46e31Ea01117C
// implementation: 0x515Fc753EFacaa99047421b13E5Db00A92E6EFF7
