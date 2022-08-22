const hre = require("hardhat");
const ethers = hre.ethers;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const contractName = "ERC20Mock";
    const address = "0x06b625319B893b5D4f59B1d3E6703f61776e9A6c";
    const fn = "balanceOf";
    const args = ["0x65348d2f31646537927026e62da59eeeb36aa744"];
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
