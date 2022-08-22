module.exports = {
    skipFiles: [
        "interfaces/",
        "mocks/",
        "gen1/interfaces/",
        "gen1/mocks/",
        "gen1/v1/",
        "gen1/LeagueTokenVesting.sol",
        "gen2/interfaces/",
        "gen2/mocks/"
    ],
    mocha: {
        fgrep: "[skip-on-coverage]",
        invert: true
    }
};
