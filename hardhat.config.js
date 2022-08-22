require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("hardhat-abi-exporter");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");

// See `README.md` for details

/*
 * Private keys for the network configuration.
 *
 * Setting in `.env` file.
 */
const POLYGON_MAINNET_KEYS = process.env.POLYGON_MAINNET_KEYS ? process.env.POLYGON_MAINNET_KEYS.split(",") : [];
const POLYGON_TESTNET_KEYS = process.env.POLYGON_TESTNET_KEYS ? process.env.POLYGON_TESTNET_KEYS.split(",") : [];
const ETHEREUM_MAINNET_KEYS = process.env.ETHEREUM_MAINNET_KEYS ? process.env.ETHEREUM_MAINNET_KEYS.split(",") : [];
const ETHEREUM_TESTNET_KEYS = process.env.ETHEREUM_TESTNET_KEYS ? process.env.ETHEREUM_TESTNET_KEYS.split(",") : [];

/*
 * The solc compiler optimizer configuration. (The optimizer is disabled by default).
 *
 * Set `ENABLED_OPTIMIZER` in `.env` file to true for enabling.
 */
// `!!` to convert to boolean
const ENABLED_OPTIMIZER = !!process.env.ENABLED_OPTIMIZER || !!process.env.REPORT_GAS || false;
const OPTIMIZER_RUNS = process.env.OPTIMIZER_RUNS ? +process.env.OPTIMIZER_RUNS : 200; // `+` to convert to number

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.6",
                settings: {
                    optimizer: {
                        enabled: ENABLED_OPTIMIZER,
                        runs: OPTIMIZER_RUNS
                    }
                }
            }
        ]
    },
    // defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            accounts: {
                count: 160, // 12 users * 12 divison + 16 addresses for other needs
                accountsBalance: "10000000000000000000000000"
            },
            allowUnlimitedContractSize: !ENABLED_OPTIMIZER,
            forking: {
                url: process.env.FORKING_URL || "",
                enabled: process.env.FORKING !== undefined
            }
        },
        // Rest parameter (...) to treat it as a single array (added in ES6)
        // Polygon
        polygon: {
            url: process.env.POLYGON_MAINNET_URL || "",
            accounts: [...POLYGON_MAINNET_KEYS],
            gasPrice: 100000000000
        },
        mumbai: {
            url:  process.env.MUMBAI_URL || "",
            accounts: [...POLYGON_TESTNET_KEYS],
            gasPrice: 8000000000
        },
        // Ethereum
        ethereum: {
            url: process.env.ETHEREUM_MAINNET_URL || "",
            accounts: [...ETHEREUM_MAINNET_KEYS]
        },
        rinkeby: {
            url: process.env.RINKEBY_URL || "",
            accounts: [...ETHEREUM_TESTNET_KEYS]
        },
        goerli: {
            url: process.env.GOERLI_URL || "",
            accounts: [...ETHEREUM_TESTNET_KEYS]
        }
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        // excludeContracts: ["mocks/"],
        currency: "USD",
        outputFile: process.env.GAS_REPORT_TO_FILE ? "gas-report.txt" : undefined
    },
    etherscan: {
        // This is not necessarily the same name that is used to define the network
        apiKey: {
            // Polygon
            polygon: process.env.POLYGONSCAN_API_KEY,
            polygonMumbai: process.env.POLYGONSCAN_API_KEY,
            // Ethereum
            mainnet: process.env.ETHERSCAN_API_KEY,
            rinkeby: process.env.ETHERSCAN_API_KEY,
            goerli: process.env.ETHERSCAN_API_KEY
        },
        url: {
            // Polygon
            polygon: process.env.POLYGONSCAN_URL || "",
            polygonMumbai: process.env.POLYGONSCAN_TESTNET_URL || "",
            // Ethereum
            mainnet: process.env.ETHERSCAN_URL || "",
            rinkeby: process.env.ETHERSCAN_URL || "",
            goerli: process.env.ETHERSCAN_URL || ""
        }
    },
    contractSizer: {
        except: ["mocks/"]
    },
    abiExporter: {
        // pretty: true,
        // except: ["interfaces/", "mocks/", ":ERC&"]
        except: ["interfaces/", ":ERC&"]
    },
    mocha: {
        timeout: 100000000000000
    }
};


// By default fork from the latest block
if (process.env.FORKING_BLOCK_NUMBER)
    module.exports.networks.hardhat.forking.blockNumber = +process.env.FORKING_BLOCK_NUMBER;

/*
 * This setting changes how Hardhat Network works, to mimic Ethereum's mainnet at a given hardfork. It must be one of
 * "byzantium", "constantinople", "petersburg", "istanbul", "muirGlacier", "berlin", "london" and "arrowGlacier".
 * Default value: "arrowGlacier".
 */
if (process.env.HARDFORK)
    module.exports.networks.hardhat.hardfork = process.env.HARDFORK;
