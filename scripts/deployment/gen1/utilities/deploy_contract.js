const hre = require("hardhat");
const ethers = hre.ethers;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const contractName = "NomoVault";
    // const contractName = "MockStrategy";
    // const constructorArgs = ["0x5b1C356D4845b3a002EfeECadA153a2c885CfF68", 100 ];
    const constructorArgs = [
        "0xbB9C2c548C43b85Dd5f03599bb0D5E64fE5216BB",
        "0x45bDB5C68C1857391B96233b6883096c4e626E56",
        "0x197F9841dB9406D790B01bE3efEF708e8D7Cb514"
    ];

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory(contractName);
    // const instance = await Contract.deploy(...constructorArgs);
    const instance = await Contract.deploy();

    // await instance.deployed();
    await instance.initialize(...constructorArgs);
    console.log(contractName + " deployed to:", instance.address);

    // verify

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await sleep(30000);

        await hre.run("verify:verify", {
            address: instance.address,
            constructorArguments: constructorArgs
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
