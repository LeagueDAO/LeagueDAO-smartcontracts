# NOMO smart-contracts

[NOMO](https://app.leaguedao.com/) GEN 1 web application. 
GEN 2 app is still in development.

## Prerequisites

For development purposes, you will need `Node.js` (>= v14) and a package manager – `npm` (>= 6). For the development, the following versions were used:
-   `Node.js` — v16.14.2
-   `npm` — 8.5.0

## Installation

Run the command `$ npm install` to install all the dependencies specified in `package.json`, compile contracts, prepare abi and prepare husky hooks.

## Configuration

The project folder needs to be writable to perform logging.

#### `hardhat.config.js`
The file contains configuration related to connection to the blockchain. For more information – read [the Hardhat docs](https://hardhat.org/config/).
-   `solidity`. This section specifies versions of the compilers, and here is used to set the version of _solc_ Solidity compiler to _0.8.6_.
-   `networks`. Each of the networks subentry corresponds to the Hardhat _--network_ parameter.
-   `gasReporter`. Configuration of a Mocha [_reporter_](https://www.npmjs.com/package/hardhat-gas-reporter) for Ethereum test suites.
-   `etherscan`. Configuration of [_@nomiclabs/hardhat-etherscan_](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html) plugin that helps verify the source code for smart-contracts on [Etherscan](https://etherscan.io/), [Polygonscan](https://polygonscan.com/), etc.
-   `contractSizer`. Configuration of [_hardhat-contract-sizer_](https://hardhat.org/plugins/hardhat-contract-sizer.html) plugin that outputs compiled contract sizes with Hardhat.
-   `abiExporter`. Configuration of [_hardhat-abi-exporter_](https://hardhat.org/plugins/hardhat-abi-exporter.html) plugin that exports Ethereum smart contract ABIs on compilation via Hardhat.
-   `defaultNetwork`. The network which is used by default when running Hardhat.

#### `.env`
**!!! Needed to be created manually!!!**

For the deployment process to be successfully performed, the `.env` file with filled-in parameters should be present at the root of the project. In the same place, you should find a file `.env.example`. It contains all of the parameters that must be present in the `.env` file but without actual values (only parameter names).

For now, `hardhat.config.js` uses the following:
-   `POLYGON_MAINNET_KEYS`, `POLYGON_TESTNET_KEYS`, `ETHEREUM_MAINNET_KEYS`, `ETHEREUM_TESTNET_KEYS`. Private keys for the networks. The contracts are deployed from an account (obtained from the private key that corresponds to the selected network) that should have **enough funds** to be able to deploy the contracts. You should set only those private keys that are planned to be used.
-   `POLYGON_MAINNET_URL`, `MUMBAI_URL`, `ETHEREUM_MAINNET_URL`, `RINKEBY_URL`, `GOERLI_URL`, `FORKING_URL`. The project does not use an own ethereum node thus external providers can be used. For example, [Alchemy](https://www.alchemyapi.io/), [Moralis](https://moralis.io/), [Infura](https://infura.io/). To obtain the URLs with API keys you shall their visit websites.
-   `ETHERSCAN_API_KEY`, `POLYGONSCAN_API_KEY`. The API keys of [Etherscan](https://etherscan.io/), [Polygonscan](https://polygonscan.com/) for plugin [_@nomiclabs/hardhat-etherscan_](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html).
-   `POLYGONSCAN_URL`, `POLYGONSCAN_TESTNET_URL`, `ETHERSCAN_URL`. The URLs for contract verification services (Etherscan, Polygonscan).
-   `ENABLED_OPTIMIZER`. Set to enable the solc compiler optimizer. It is turned on automatically during the gas report.
-   `OPTIMIZER_RUNS`.  The number of runs specifies roughly how often each opcode of the deployed code will be executed across the life-time of the contract. This means it is a trade-off parameter between code size (deploy cost) and code execution cost (cost after deployment). The maximum value is 2**32 - 1. This parameter does not specify the number of iterations of the optimizer. The optimizer will always run as many times as it can still improve the code. Equals to 200 by default.
-   `FORKING`. Set to start an instance of Hardhat Network that forks a network. This means that it will simulate having the same state as selected network. This is a way to interact with deployed protocols and test complex interactions locally. To use this feature you need to connect to an archive node (for example, with Moralis or Alchemy). It is disabled by default.
-   `FORKING_BLOCK_NUMBER`. Set if needed a specified block number for forking. By default fork from the latest block.
-   `HARDFORK`. This setting changes how Hardhat Network works, to mimic Ethereum's mainnet at a given hardfork. It must be one of "byzantium", "constantinople", "petersburg", "istanbul", "muirGlacier", "berlin", "london" and "arrowGlacier". Default value: "arrowGlacier".
-   `REPORT_GAS`. It is disabled by default. Set it to output the gas report every time when running the hardhat test command. Or just execute `$ npm run gas-report` to see the gas report.
-   `GAS_REPORT_TO_FILE`. Set it to output the gast report in the `gas-report.txt` file.

And there are deployment settings:
-   `INITIAL_MINT_RECEIVER`. Parameter of the token smart-contract.
-   `NOMO_TOKEN_ADDRESS`, `START_AFTER_TIMESTAMP`. Parameters of the vesting smart-contract.
-   `NOMO_NFT_ADDRESS`. Parameter of the point calculator smart-contract.
-   `NOMO_NFT_ADDRESS`, `REWARD_TOKEN_ADDRESS`, `UPDATER_ADDRESS`. Parameters of the router smart-contract.
-   `USERS_ADDRESSES`. Parameter for testing of migrations.

## Running scripts

## _Development_

### Linters

`$ npm run dev:lint` to run JavaScript and Solidity linters ([ESLint](https://eslint.org/) and [Solhint](https://protofire.github.io/solhint/)) and check the code for stylistic bugs.<br>
`$ npm run dev:eslint` to run ESLint for coding style check.<br>
`$ npm run dev:eslint-fix` to run ESLint to automatically fix coding style issues.<br>
`$ npm run dev:solhint` to run Solhint for coding style check.<br>
`$ npm run dev:solhint-fix` to run Solhint to automatically fix coding style issues.<br>
`$ npm run dev:prettier` to run [Prettier](https://prettier.io/) for coding style check.<br>
`$ npm run dev:prettier-fix` to run Prettier to automatically fix coding style issues.

### Test coverage

`$ npm run dev:coverage` to examine how well developed tests cover the functionality of smart-contracts. The results can also be viewed in a web browser by opening a `coverage/` folder created by the script. The configuration file is `.solcover.js`.

### Testing

You can perform tests with `$ npm test` to run all tests from the `test/` directory.

### Utilities

`$ npm run dev:size-contracts` to output compiled contract sizes.<br>
`$ npm run dev:abi` to generate abi to the directory `abi/`.
`$ npm run docgen` to generate a documentation for smart-contracts. The documentation is generated for all smart-contracts (from the directory `contracts/`) to the directory `docs/` using the [NatSpec format](https://docs.soliditylang.org/en/v0.8.7/natspec-format.html). There is a template and helpers in the directory `docgen/`. This uses the documentation generator libraries by OpenZeppelin ([solidity-docgen](https://github.com/OpenZeppelin/solidity-docgen)).<br>
`$ npm run flatten` to flatten the smart-contracts before building. Use this if you need to verify contracts on your own. By default, all deployment scripts will verify code automatically (you will need to set the API keys and URLs for contract verification services, see [Configuration](#Configuration) section).

## _Production_

### Build

Use `$ npm run compile` to compile the source code to use it in the production.

### Deploy

Before proceeding with the deployment process, make sure you have read a [Configuration](#Configuration) section and set up the `.env` file.

There is a set of commands for deploying:

Coming soon...

Use it to deploy the smart-contracts.

For now, the following Ethereum networks are supported:
-   hardhat (development, default)
-   polygon
-   mumbai
-   ethereum
-   rinkeby
-   goerli
