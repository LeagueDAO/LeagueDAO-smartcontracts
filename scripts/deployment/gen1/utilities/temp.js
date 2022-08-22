const hre = require("hardhat");
const ethers = hre.ethers;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const tok = await ethers.getContractFactory("ERC20Mock");
    const tok1 = await tok.attach("0xDDc9Fd6FED6289A4999862FC1F2F969b6AAEbe00");
    console.log(1);
    await tok1.mint("0xaEea9c3997Dabdd58Da143Afc941d876c12CeA34", "100000000000000000000000000");
    await tok1.approve("0x20d08D8fE07dEadcb589Ea37c63d029203939508", "1000000000000000000000");
    console.log(2);

    const contractName = "NomoVault";
    const address = "0x20d08D8fE07dEadcb589Ea37c63d029203939508";
    const fn = "nftSaleCallback";
    const args = [[2], ["1000000000000000000000"]];
    // We get the contract to deploy
    const Contract = await ethers.getContractFactory(contractName);
    // const instance = await Contract.deploy(...constructorArgs);
    const instance = await Contract.attach(address);
    await instance.addLeagues([1, 2]);
    console.log(3);

    const res = await instance[fn](...args);
    console.log(`${fn}(${args.join(", ")}) =>`);
    console.log(res);

    //     nftSaleCallback([наш тестовый токен айди], [1000 eth])
    // до колбека
    // token1.mint(0xaee..., 1mln eth)
    // token1.approve(nomoVault.address,1000eth)
    // минт - апрув - колбек
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
