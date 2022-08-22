# DivisionWinnerReader
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`readDivisionWinner(uint256 _numberOfDivisions)` (external) ](#divisionwinnerreader-readdivisionwinner-uint256-)
  - [`isDivisionWinner(uint256 _season, address _user) → bool` (public) ](#divisionwinnerreader-isdivisionwinner-uint256-address-)

## Variables <a name="variables"></a>
- `uint256 nextProcessedDivisionWinner`
- `mapping(uint256 => address[]) divisionWinners`
- `mapping(uint256 => mapping(address => uint256)) divisionWinnersIncreasedIndex`
- `mapping(uint256 => mapping(address => struct DivisionWinnerStats)) divisionWinnerStats`

## Functions <a name="functions"></a>

### `init_DivisionWinnerReader_unchained()` (internal) <a name="divisionwinnerreader-init_divisionwinnerreader_unchained--"></a>


### `readDivisionWinner(uint256 _numberOfDivisions)` (external) <a name="divisionwinnerreader-readdivisionwinner-uint256-"></a>

**Dev doc**: Reads the array of division winner and their season statistics from the FantasyLeague contract after the
playoff end and saves it to this contract.



#### Params
 - `_numberOfDivisions`: A number of divisions to process. It allows you to split the function call into
multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
anything greater than zero. When the process of reading is completed, the MegaLeague moves on to the next stage
(`MegaLeagueStage.MegaLeague`).

### `isDivisionWinner(uint256 _season, address _user) → bool` (public) <a name="divisionwinnerreader-isdivisionwinner-uint256-address-"></a>

