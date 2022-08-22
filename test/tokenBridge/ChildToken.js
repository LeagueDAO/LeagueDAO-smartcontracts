const { expect } = require("chai");
const { ethers } = require("hardhat");
const { snapshot } = require("../helpers");

contract("Bridge token", () => {
    let snapshotA;
    let deployer, owner;
    let user1, user2, user3;
    let childToken;

    before(async () => {
        [deployer, owner, user1, user2, user3] = await ethers.getSigners();

        const NAME = "token";
        const SYMBOL = "tkn";
        const childChainManager = deployer.address;
        const ChildToken = await ethers.getContractFactory("ChildERC20");
        childToken = await ChildToken.deploy(NAME, SYMBOL, childChainManager);
        await childToken.deployed();

        snapshotA = await snapshot();
    });

    afterEach(async () => await snapshotA.restore());

    describe("Basic functionality", () => {
        it("users balances at snapshot are correct ", async () => {
            const USER = [user1, user2, user3];
            const INITIAL_BALANCE = [100, 200, 300];
            const DEPOSIT_DATA = INITIAL_BALANCE.map((el) => ethers.utils.solidityPack(["uint256"], [el]));

            // admin deposit tokens to users
            for (let i = 0; i < USER.length; i++) {
                await childToken.connect(deployer).deposit(USER[i].address, DEPOSIT_DATA[i]);
            }

            await childToken.snapshot();
            let SNAP_ID = await childToken.getCurrentSnapshotId();

            // all users transer tokens somewhere, user balances == 0
            for (let i = 0; i < USER.length; i++) {
                await childToken.connect(USER[i]).transfer(owner.address, INITIAL_BALANCE[i]);
            }

            // balances at snapshot are correct
            for (let i = 0; i < USER.length; i++) {
                expect(await childToken.balanceOfAt(USER[i].address, SNAP_ID)).to.equal(INITIAL_BALANCE[i]);
            }
        });

        it("total supply at snapshot are correct", async () => {
            const USER = [user1, user2, user3];
            const INITIAL_BALANCE = [100, 200, 300];
            const INITIAL_SUPPLY = INITIAL_BALANCE.reduce((pre, cur) => pre + cur);

            const DEPOSIT_DATA = INITIAL_BALANCE.map((el) => ethers.utils.solidityPack(["uint256"], [el]));

            // admin deposit tokens to users
            for (let i = 0; i < USER.length; i++) {
                await childToken.connect(deployer).deposit(USER[i].address, DEPOSIT_DATA[i]);
            }

            await childToken.snapshot();

            let SNAP_ID = await childToken.getCurrentSnapshotId();

            // all users withdraw(burn) their tokens
            for (let i = 0; i < USER.length; i++) {
                await childToken.connect(USER[i]).withdraw(INITIAL_BALANCE[i]);
            }

            // total suplly at snapshot is correct
            expect(await childToken.totalSupplyAt(SNAP_ID)).to.equal(INITIAL_SUPPLY);

            // current total supply is zero
            expect(await childToken.totalSupply()).to.equal("0");
        });

        it("update chainManager", async () => {
            const DEPOSITOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEPOSITOR_ROLE"));

            expect(await childToken.hasRole(DEPOSITOR_ROLE, deployer.address)).to.equal(true);
            await childToken.updateChildChainManager(user1.address);
            expect(await childToken.hasRole(DEPOSITOR_ROLE, deployer.address)).to.equal(false);
            expect(await childToken.hasRole(DEPOSITOR_ROLE, user1.address)).to.equal(true);
        });
    });
});
