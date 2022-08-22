const NOMO_NFT_ADDRESS = "0x2d1981F382334a71aBBe0f012D0c48899aEE2943";
const REDEPLOY = false;

const { getDeployer } = require("../helpers/helpers.js");
const path = require("path");
const { ethers, upgrades } = hre;
const { parseUnits } = ethers.utils;

async function main() {
    console.log("Deploying all contracts...");

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
    const addressesPath = path.join(__dirname, "deploymentAddresses.json");
    const deploy = await getDeployer(addressesPath, owner, false);

    const [erc20MockAddress, erc20MockInstance] = await deploy("ERC20Mock", { isNewMigration: true });

    const [dLEAGCopyAddress, dLEAGCopyInstance] = await deploy("dLEAGCopy", {
        args: ["dLEAG", "dLEAG"],
        isUpgradeable: true
    });

    const [randGeneratorMockAddress, randGeneratorMockInstance] = await deploy("RandGeneratorMock");

    const [schedulerAddress, schedulerInstance] = await deploy("Scheduler", {
        isUpgradeable: true
    });

    const [teamsStakingDeadlinesAddress, teamsStakingDeadlinesInstance] = await deploy("TeamsStakingDeadlines", {
        args: [NOMO_NFT_ADDRESS],
        isUpgradeable: true
    });

    const [fantasyLeagueAddress, fantasyLeagueInstance] = await deploy("FantasyLeague", {
        args: [randGeneratorMockAddress, schedulerAddress, owner.address, [erc20MockAddress]],
        isUpgradeable: true
    });

    const [gen2PlayerTokenAddress, gen2PlayerTokenInstance] = await deploy("Gen2PlayerToken");
    await gen2PlayerTokenInstance.setGenesisNFT(NOMO_NFT_ADDRESS);

    const [gen2PointsCalculatorAddress, gen2PointsCalculatorInstance] = await deploy("Gen2PointsCalculator", {
        args: [NOMO_NFT_ADDRESS, gen2PlayerTokenAddress, "3601", "36000000"]
    });

    const [strategyMockAddress, strategyMockInstance] = await deploy("StrategyMock");

    const [financialManagerMockAddress, financialManagerMockInstance] = await deploy("FinancialManagerMock2", {
        args: [
            strategyMockAddress,
            owner.address,
            fantasyLeagueAddress,
            [erc20MockAddress, erc20MockAddress, erc20MockAddress, erc20MockAddress]
        ],
        isUpgradeable: true,
        transactionOptions: {
            gasLimit: 5967535
        }
    });
    // _________________ERROR __________________________
    //  reason: 'execution reverted: Uncorrect deadline',
    //   code: 'UNPREDICTABLE_GAS_LIMIT',
    //   method: 'estimateGas',

    // const [genesisNFTFarmingAddress, genesisNFTFarmingInstance] = await deploy("GenesisNFTFarming", {
    //     args: [NOMO_NFT_ADDRESS, 1657633616],
    //     isUpgradeable: true,
    //     transactionOptions: {
    //         gasLimit: 5967535
    //     },
    // });

    const picture =
        "https://leaguedao.com/_next/image?url=%2F_next%2Fstatic%2Fimage%2Fpublic%2Fassets%2Fimages%2Fhome-footballscene.43cc806029e4bf7dfdbeff0e505a938f.png&w=1920&q=75";
    const [leaguePassNFTAddress, leaguePassNFTInstance] = await deploy("LeaguePassNFT", {
        args: [
            dLEAGCopyAddress,
            parseUnits("20"),
            picture,
            "1661781763",
            "1657559041",
            "1661781763",
            [erc20MockAddress],
            [parseUnits("900")]
        ],
        isUpgradeable: true
    });

    const [megaLeagueAddress, megaLeagueInstance] = await deploy("MegaLeague", {
        args: [[erc20MockAddress], financialManagerMockAddress, randGeneratorMockAddress],
        isUpgradeable: true
    });

    await financialManagerMockInstance.setMegaLeague(megaLeagueAddress, { gasLimit: 3000000 });

    const [teamManagerAddress, teamManagerInstance] = await deploy("TeamManager", {
        args: [gen2PlayerTokenAddress, teamsStakingDeadlinesAddress, gen2PointsCalculatorAddress],
        isUpgradeable: true,
        done: true
    });

    console.log("Deployed all contracts");
    console.log("");
    console.log("Call setters");

    await leaguePassNFTInstance.setFinancialManager(financialManagerMockAddress, { gasLimit: 1000000 });
    console.log(`Set team manager to ${financialManagerMockAddress} on leaguePass`);
    await leaguePassNFTInstance.setFantasyLeague(fantasyLeagueAddress, { gasLimit: 1000000 });
    console.log(`Set fantasy league to ${fantasyLeagueAddress} on leaguePassNFT`);
    await gen2PlayerTokenInstance.setFantasyLeague(fantasyLeagueAddress, { gasLimit: 1000000 });
    console.log(`Set fantasy league to ${fantasyLeagueAddress} on gen2PlayerToken`);
    await megaLeagueInstance.setFantasyLeague(fantasyLeagueAddress, { gasLimit: 1000000 });
    console.log(`Set fantasy league to ${fantasyLeagueAddress} on megaLeague`);
    await teamManagerInstance.setFantasyLeague(fantasyLeagueAddress, { gasLimit: 1000000 });
    console.log(`Set fantasy league to ${fantasyLeagueAddress} on teamManager`);

    await dLEAGCopyInstance.setMinterRole(leaguePassNFTAddress);
    console.log(`Set minter role for Leag pass ${leaguePassNFTAddress} on DLeagToken`);

    await fantasyLeagueInstance.setTeamManager(teamManagerAddress, { gasLimit: 1000000 });
    console.log(`Set team manager to ${teamManagerAddress} on fantasyLeague`);
    await fantasyLeagueInstance.setMegaLeague(megaLeagueAddress, { gasLimit: 1000000 });
    console.log(`Set mega league to ${megaLeagueAddress} on fantasyLeague`);
    await fantasyLeagueInstance.setGen2PlayerToken(gen2PlayerTokenAddress, { gasLimit: 1000000 });
    console.log(`Set gen2 player token to ${gen2PlayerTokenAddress} on fantasyLeague`);
    await fantasyLeagueInstance.setLeaguePassNFT(leaguePassNFTAddress, { gasLimit: 1000000 });
    console.log(`Set league pass NFT to ${leaguePassNFTAddress} on fantasyLeague`);
    await fantasyLeagueInstance.setFinancialManager(financialManagerMockAddress, { gasLimit: 1000000 });
    console.log(`Set financial Manager MockAddress to ${financialManagerMockAddress} on fantasyLeague`);
    const FINANCIAL_MANAGER_ROLE = "0xe75446273af643722c6ca053a367217a3f3ec7abf238c2ecefa653f12afd6448";
    await fantasyLeagueInstance.grantRole(FINANCIAL_MANAGER_ROLE, megaLeagueAddress);

    //allow to stake gen2 token on team manager
    await gen2PlayerTokenInstance.setTransferAllowListAddr(teamManagerAddress, true, { gasLimit: 1000000 });
    console.log(`Allow to transfer tokens to teamManager contract ${fantasyLeagueAddress} on gen2PlayerToken`);

    // set treasure and percent on FinancialManager
    await financialManagerMockInstance.setTreasury("0x984C4A8dDB47D91f6A88E95420067b80a17639E2", 3000, {
        gasLimit: 1000000
    });

    console.log("Deployment complete");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/deployment/gen2/deployAll.js --network mumbai
