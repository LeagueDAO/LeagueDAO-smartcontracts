const hre = require("hardhat");
const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // We get the contract to deploy
    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.attach("0x06b625319B893b5D4f59B1d3E6703f61776e9A6c");

    const users = ["0x06E8d4A0a3e6bc352cfa0898f133421D539573D3"];
    const mln = "1000000000000000000000000";
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await token.mint(user, mln);
        console.log("minted");
    }
    console.log("done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
