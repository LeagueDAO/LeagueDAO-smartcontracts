const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const contractName = "TransferNFTS";
    const transferAddr = "0xac79aD9a10ff8B67F19a8A366100c6DeEed580fc";

    const NFT_ADDRESS = "0xb0473fa381dAdc514c7bA0411E7eD944fF798A66";

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory(contractName);
    const instance = await Contract.attach(transferAddr);

    const nft = await (await ethers.getContractFactory("ERC721")).attach(NFT_ADDRESS);

    await nft.setApprovalForAll(transferAddr, true);
    await instance.transferNFTsRange(150, 201, transferAddr);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
