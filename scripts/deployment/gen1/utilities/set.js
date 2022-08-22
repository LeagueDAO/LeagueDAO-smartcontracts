const hre = require("hardhat");
const ethers = hre.ethers;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const contractName = "NomoVault";
    const address = "0x2c44C30B20DD5DB2bd4d2fb3b2464FF13e381447";
    const fn = "setSalesRole";
    const args = ["0x93F8E7badE51DF144b1da10DBd6e24385779B91B", true];
    // We get the contract to deploy
    const Contract = await ethers.getContractFactory(contractName);
    // const instance = await Contract.deploy(...constructorArgs);
    const instance = await Contract.attach(address);
    const res = await instance[fn](...args);
    console.log(`${fn}(${args.join(", ")}) =>`);
    console.log(res);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
