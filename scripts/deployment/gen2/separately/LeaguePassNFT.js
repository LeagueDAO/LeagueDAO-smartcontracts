const NOMO_NFT_ADDRESS = "0x2d1981F382334a71aBBe0f012D0c48899aEE2943";
// const REDEPLOY = false;

const { getDeployer } = require("../../helpers/helpers.js");
const path = require("path");
const { ethers, upgrades } = hre;
const { parseUnits } = ethers.utils;

async function main() {
    console.log("Deploying FinancialManager and LeagPass...");

    const [owner, ...accounts] = await ethers.getSigners();
    // await hre.network.provider.request({
    //     method: "hardhat_impersonateAccount",
    //     params: ["0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9"]
    // });
    // await network.provider.send("hardhat_setBalance", [
    //     "0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9",
    //     "0x8AC7230489E80000"
    // ]);
    // const signer = await ethers.getSigner("0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9");

    // const addressesPath = path.join(__dirname, "..\\deploymentAddresses.json");
    const addressesPath = path.join("/home/abn/Blaize/nomo-protocol/scripts/deployment/gen2/deploymentAddresses.json");
    const deploy = await getDeployer(addressesPath, owner, false);

    const [financialManagerAddress, financialManagerInstance] = await deploy("FinancialManager", {
        isNewMigration: true,
        isUpgradeable: true,
        transactionOptions: {
            gasLimit: 5967535111
        },
        args: [
            "0xE6E6982fb5dDF4fcc74cCCe4e4eea774E002D17F",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            [
                "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
                "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1"
            ]
        ]
    });

    const [leagPassNFTAddress, leagPassNFTInstance] = await deploy("LeaguePassNFT", {
        isUpgradeable: true,
        args: [
            "0x0000000000000000000000000000000000000000",
            parseUnits("20"),
            "https://megaleague.mypinata.cloud/ipfs/QmNY132Lyogzp8y6GcDHV94ir5PxDjLxGKR8KDocUy5SUa",
            "1661353200",
            "0",
            "1661356800",
            ["0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"],
            ["300000000000000000000"]
        ]
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/deployment/gen2/separately/LeaguePassNFT.js --network mumbai
// npx hardhat verify "0x0EE2b865B5C3F14fdB8ac37515BFf55d3D94F6d0" --network mumbai

// Deploying contracts with the account: 0xf4d69EA032DAB06423518bDF6A627A9B9AE4a2b9
// proxy address: 0x8f5185ACf96A61316603aCab18C46e31Ea01117C
// implementation: 0x515Fc753EFacaa99047421b13E5Db00A92E6EFF7

// npx hardhat verify "0xf3b0a2fAD190b402167A272458827Dc76fe9607c" --network mumbai
