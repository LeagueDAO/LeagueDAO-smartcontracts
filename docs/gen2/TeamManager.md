# TeamManager
*TeamManager -- .*


## Table of contents:
- [Functions:](#functions)
  - [`initialize(address _gen2PlayerToken, address _teamsStakingDeadlinesContract, address _calculator)` (external) ](#teammanager-initialize-address-address-address-)


## Functions <a name="functions"></a>

### `initialize(address _gen2PlayerToken, address _teamsStakingDeadlinesContract, address _calculator)` (external) <a name="teammanager-initialize-address-address-address-"></a>

*Description*: It is used as the constructor for upgradeable contracts.
**Dev doc**: Initializes this contract by setting the deployer as the initial administrator that has the
`DEFAULT_ADMIN_ROLE` role and the following parameters:


#### Params
 - `_gen2PlayerToken`:   An address of the second generation player NFT contract that mints duplicates of the
first generation player NF tokens.

 - `_calculator`:   The contract that calculates scores of the specific first generation player NF tokens.


