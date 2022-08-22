const hre = require("hardhat");
const { ethers, upgrades } = hre;
const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const fs = require("fs");
const { type } = require("os");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verify(address, args, isLog = true) {
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        let retry = 20;
        !isLog || console.log("Sleeping before verification...");
        try {
            while ((await ethers.provider.getCode(address).catch(() => "")).length <= 3 && retry >= 0) {
                await sleep(5000);
                --retry;
            }
        } catch (error) {
            !isLog || console.log(`GetCode error: ${error}`);
        }

        await sleep(3000);

        !isLog || console.log("Starting verification, address and arguments:", address, args);
        try {
            await hre
                .run("verify:verify", {
                    address,
                    constructorArguments: args
                })
                // .catch(console.error);
                .then(
                    () => {
                        !isLog || console.log("Verification is successful");
                    },
                    (error) => {
                        !isLog || console.log("Verification is failed");
                        !isLog || console.log(error.toString().slice(0, 100));
                    }
                );
        } catch (error) {
            !isLog || console.log(`post-verify error: ${error}`);
        }
    } else {
        !isLog || console.log("Skipping verification on localhost or hardhat");
    }
}

function getAddressSaver(path, network, isLog) {
    const addresses = require(path);
    if (!addresses[network]) {
        addresses[network] = {};
    }
    if (!addresses[network].old) {
        addresses[network].old = {};
    }
    if (!addresses[network].new) {
        addresses[network].new = {};
    }
    function saveAddress(contractName, address, isNewMigration) {
        if (isNewMigration) {
            addresses[network].old = addresses[network].new;
            addresses[network].new = {};
        }
        addresses[network].new[contractName] = address;
        !isLog || console.log(`${contractName} deployed to ${address}`);
        fs.writeFileSync(path, JSON.stringify(addresses, null, 4));
        return addresses[network].new;
    }
    return saveAddress;
}

// we need to check if contract is already deployed and return true if it is
async function getDeployer(addressesPath, defaultDeployer, alwaysRedeploy = false, isLog = true) {
    const addresses = require(addressesPath);
    const network = (await ethers.getDefaultProvider().getNetwork()).chainId;
    if (!addresses[network]) {
        addresses[network] = {};
    }
    if (!addresses[network].old) {
        addresses[network].old = {};
    }
    if (!addresses[network].new) {
        addresses[network].new = {};
    }
    if (typeof addresses[network].done != "boolean") {
        addresses[network].done = false;
    }
    if (network === "hardhat" || network === "localhost") {
        alwaysRedeploy = true;
    }
    async function deploy(
        contractName,
        {
            args = [],
            isUpgradeable = false,
            isNewMigration = false,
            redeploy = alwaysRedeploy,
            done = false,
            contractDeployer = defaultDeployer,
            notVerify = false,
            transactionOptions = {},
            deployUpgradeableInOneTx = false
        } = {}
    ) {
        !isLog || console.log();
        // start new migration if it's done or we need to redeploy
        if ((isNewMigration && addresses[network].done) || (isNewMigration && redeploy)) {
            addresses[network].old = addresses[network].new;
            addresses[network].new = {};
            addresses[network].done = false;
            fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 4));
        }
        let address;
        // deploy contract if it's not deployed or we need to redeploy
        if (!addresses[network].new[contractName] || redeploy) {
            !isLog || console.log(`Deploying ${contractName}...`);
            const Contract = (await ethers.getContractFactory(contractName)).connect(contractDeployer);
            let contract;
            if (deployUpgradeableInOneTx) {
                !isLog || console.log(`Deploying ${contractName} in one transaction...`);
                contract = await Contract.deploy(transactionOptions);
                await contract.deployed();
                !isLog || console.log(`Calling initialize on ${contractName}...`);
                await contract.initialize(...args, transactionOptions);
            } else if (isUpgradeable) {
                contract = await upgrades.deployProxy(Contract, args, { timeout: 0 });
                await contract.deployed();
            } else {
                contract = await Contract.deploy(...args, transactionOptions);
                await contract.deployed();
            }
            address = contract.address;

            addresses[network].new[contractName] = address;
            !isLog || console.log(`${contractName} deployed to ${address}`);
            fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 4));
        } else {
            !isLog || console.log(`${contractName} already deployed to ${addresses[network].new[contractName]}`);
        }

        address = addresses[network].new[contractName];

        if (done) {
            addresses[network].done = true;
            fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 4));
        }
        if (!notVerify) {
            try {
                if (isUpgradeable) {
                    let implementation;
                    try {
                        implementation = await getImplementationAddress(ethers.provider, address);
                    } catch (err) {
                        !isLog || console.log("Implementation address error:", err);
                    }
                    await verify(implementation, [], isLog);
                } else {
                    await verify(address, args, isLog);
                }
            } catch (error) {
                !isLog || console.log(`Verification error: ${error}`);
            }
        }

        const instance = (await ethers.getContractFactory(contractName)).attach(address).connect(contractDeployer);
        !isLog || console.log();
        return [address, instance];
    }
    return deploy;
}

exports.sleep = sleep;
exports.verify = verify;
exports.getAddressSaver = getAddressSaver;
exports.getDeployer = getDeployer;
