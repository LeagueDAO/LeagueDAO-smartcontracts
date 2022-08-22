// const hre = require("hardhat");
// const ethers = hre.ethers;
const assert = require("assert").strict;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    // We get the contract to deploy
    const ownerAddress = "0xe488c0019a95ec8eacd6378667e7d1ae038f3f04";
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ownerAddress]
    });
    const impersonatedSigner = await ethers.getSigner(ownerAddress);

    const NomoVault = await hre.ethers.getContractFactory("NomoVault");
    const nomoVault = await NomoVault.attach("0xe2dC86936929F93F45794eAA517626314d4a49E8").connect(impersonatedSigner);
    let res = await nomoVault.distributeReward("0xF98bfC3509e16e54e53D87fBd5526D4f859Be078");
    res = await res.wait();
    console.log(JSON.stringify(res, null, 4));
    console.log(res.events[res.events.length - 1].args[0].toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
