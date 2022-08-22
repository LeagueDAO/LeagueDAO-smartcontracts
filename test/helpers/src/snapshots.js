const { network } = require("hardhat");

async function takeSnapshot() {
    return await network.provider.request({ method: "evm_snapshot", params: [] });
}

async function restoreSnapshot(id) {
    await network.provider.request({ method: "evm_revert", params: [id] });
}

const snapshot = async function () {
    let snapshotID = await takeSnapshot();

    return {
        restore: async () => {
            await restoreSnapshot(snapshotID);
            snapshotID = await takeSnapshot();
        }
    };
};

module.exports = { snapshot };
