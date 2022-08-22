const { expect, use } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers, waffle, upgrades } = require("hardhat");
const { solidity } = waffle;

const { toBN, units, URL_EXAMPLE, time, snapshot } = require("../../helpers");

const { AddressZero, Zero } = ethers.constants;

// Extension of Chai for Solidity (emit, closeTo, etc.)
use(solidity);

describe.skip("Ofchain sorting", function () {
    let snapshotA;

    let deployer, users;

    let leagueAdmin;
    let league, teamManager, randGenerator, gen2PlayerToken, pointCalculator, rewardERC20;

    let falseStrategy, falseMegaleague, falseMultisig, falseTreasury;
    const SEASON = 0;

    before(async () => {
        const signers = await ethers.getSigners();
        // league = await ethers.getContractAt("ERC20", USDC);
    });
    // afterEach(async () => await snapshotA.restore());

    describe("test ofchain sorting", async () => {
        it("", async () => {
            let division = [
                {
                    totalPoints: "326",
                    wins: "7",
                    ties: "8",
                    user: {
                        address: "0x0d9664f54eca64d1254301beb2c773a72ec44b79"
                    }
                },
                {
                    totalPoints: "291",
                    wins: "6",
                    ties: "8",
                    user: {
                        address: "0xada9e76fb67a59463f19da8efb0d774274dbddce"
                    }
                },
                {
                    totalPoints: "214",
                    wins: "6",
                    ties: "8",
                    user: {
                        address: "0x2c004ca912de927c6236c40d67357991bd57dbd2"
                    }
                },
                {
                    totalPoints: "169",
                    wins: "6",
                    ties: "8",
                    user: {
                        address: "0x248efe110dce4b8fe84effb6027cb18483666937"
                    }
                },
                {
                    totalPoints: "145",
                    wins: "4",
                    ties: "8",
                    user: {
                        address: "0x40f394977990d800fb57bdaad41a774a3e52686f"
                    }
                },
                {
                    totalPoints: "137",
                    wins: "5",
                    ties: "8",
                    user: {
                        address: "0xb36fdfd90934faa2e591ee78eaf65f7c975b009e"
                    }
                },
                {
                    totalPoints: "120",
                    wins: "2",
                    ties: "8",
                    user: {
                        address: "0xb9e36f98ccbbe5d714704ec450e1e61684893fe9"
                    }
                },
                {
                    totalPoints: "75",
                    wins: "2",
                    ties: "8",
                    user: {
                        address: "0xfd0e6df243d382b04744635a4d898aaacfde7679"
                    }
                },
                {
                    totalPoints: "30",
                    wins: "1",
                    ties: "9",
                    user: {
                        address: "0x87d38ac441aa90202dcd1c5ad3fc0f38b469d738"
                    }
                },
                {
                    totalPoints: "0",
                    wins: "0",
                    ties: "10",
                    user: {
                        address: "0xd00dc6241a286ea58e090476c40816400c14d9e4"
                    }
                },
                {
                    totalPoints: "0",
                    wins: "0",
                    ties: "9",
                    user: {
                        address: "0xc3ad2236eaaeea2961b672386634898e0ee17c02"
                    }
                },
                {
                    totalPoints: "0",
                    wins: "0",
                    ties: "10",
                    user: {
                        address: "0x41da111e5899bc0a8f60ad98326d5a394e1d42c8"
                    }
                }
            ];

            let divisonsWithData = [];
            for (let i = 0; i < division.length; i++) {
                divisonsWithData.push([
                    division[i].user.address,
                    parseInt(division[i].totalPoints),
                    parseInt(division[i].wins),
                    parseInt(division[i].ties)
                ]);
            }
            console.log("not sorted", divisonsWithData);

            divisonsWithData.sort(function (a, b) {
                if (b[1] > a[1]) return 1;
                if (b[1] < a[1]) return -1;
                if (b[2] > a[2]) return 1;
                if (b[2] < a[2]) return -1;
                if (b[3] > a[3]) return 1;
                if (b[3] < a[3]) return -1;
            });

            console.log("sorted", divisonsWithData);
            let sortedAddresses = divisonsWithData.map((el) => el[0]);
            console.log("sorted addresses", sortedAddresses);
        });
    });
});
