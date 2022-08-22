# LeaguePassNFT
*NFT pass contract.*

**Dev doc**: Each address can have only 1 NFT, except whitelisted addresses

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address _dLeagueToken, uint256 _dLeagAmount, string _baseURI, uint256 _saleDeadline, uint256 _leagueStartDate, uint256 _leagueJoinDeadline, address[] _tokenAddresses, uint256[] _nftPrices)` (external) ](#leaguepassnft-initialize-address-uint256-string-uint256-uint256-uint256-address---uint256---)
  - [`mint(contract IERC20Upgradeable _token)` (external) ](#leaguepassnft-mint-contract-ierc20upgradeable-)
  - [`marketingMint()` (external) ](#leaguepassnft-marketingmint--)
  - [`joinTheLeague(uint256 _nftId)` (external) ](#leaguepassnft-jointheleague-uint256-)
  - [`getLeagPassCount() → uint256` (external) ](#leaguepassnft-getleagpasscount--)
  - [`setPaymentToken(address _token, uint256 _nftPrice)` (public) ](#leaguepassnft-setpaymenttoken-address-uint256-)
  - [`setFinancialManager(address _address)` (public) ](#leaguepassnft-setfinancialmanager-address-)
  - [`setDleagueToken(address _token)` (public) ](#leaguepassnft-setdleaguetoken-address-)
  - [`setDleagueTokenAmount(uint256 _amount)` (public) ](#leaguepassnft-setdleaguetokenamount-uint256-)
  - [`setBaseURI(string _baseURI)` (public) ](#leaguepassnft-setbaseuri-string-)
  - [`setSaleDeadline(uint256 _deadline)` (public) ](#leaguepassnft-setsaledeadline-uint256-)
  - [`setLeagueStartDate(uint256 _date)` (public) ](#leaguepassnft-setleaguestartdate-uint256-)
  - [`setLeagueJoinDeadline(uint256 _deadline)` (public) ](#leaguepassnft-setleaguejoindeadline-uint256-)
  - [`setWhitelistedAddr(address _addr, bool _val)` (external) ](#leaguepassnft-setwhitelistedaddr-address-bool-)
  - [`setIsInMarketingList(address _addr, bool _val)` (external) ](#leaguepassnft-setisinmarketinglist-address-bool-)
  - [`setIsAllowedToFillLastDivision(address _addr, bool _val)` (external) ](#leaguepassnft-setisallowedtofilllastdivision-address-bool-)
  - [`setOneTokenPerAccount(bool _state)` (external) ](#leaguepassnft-setonetokenperaccount-bool-)
  - [`tokenURI(uint256 _tokenId) → string` (public) ](#leaguepassnft-tokenuri-uint256-)
  - [`supportsInterface(bytes4 interfaceId) → bool` (public) ](#leaguepassnft-supportsinterface-bytes4-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract IMintableToken dLeagueToken`
- `address financialManager`
- `uint256 dLeagAmount`
- `uint256 saleDeadline`
- `uint256 leagueStartDate`
- `uint256 leagueJoinDeadline`
- `bool oneTokenPerAccount`
- `bool isPassValidInAllSeasons`
- `string baseURI`
- `mapping(uint256 => uint256) passIdToSeasonId`
- `mapping(address => uint256) passPriceList`
- `mapping(address => bool) whitelist`
- `mapping(address => bool) isAllowedToFillLastDivision`
- `mapping(address => bool) isInMarketingList`
- `mapping(uint256 => mapping(address => bool)) leagueParticipants`

## Functions <a name="functions"></a>

### `initialize(address _dLeagueToken, uint256 _dLeagAmount, string _baseURI, uint256 _saleDeadline, uint256 _leagueStartDate, uint256 _leagueJoinDeadline, address[] _tokenAddresses, uint256[] _nftPrices)` (external) <a name="leaguepassnft-initialize-address-uint256-string-uint256-uint256-uint256-address---uint256---"></a>


### `mint(contract IERC20Upgradeable _token)` (external) <a name="leaguepassnft-mint-contract-ierc20upgradeable-"></a>

*Description*: Mints League Pass NFT in exchange for ERC20 tokens


#### Params
 - `_token`: contract of token you want to buy NFT with

### `marketingMint()` (external) <a name="leaguepassnft-marketingmint--"></a>

*Description*: Mints free League Pass NFT if user is in marketing list, then removes user from marketing list

### `joinTheLeague(uint256 _nftId)` (external) <a name="leaguepassnft-jointheleague-uint256-"></a>

*Description*: Burn NFT pass and let you join the league


#### Params
 - `_nftId`: Id of users NFT pass

### `getLeagPassCount() → uint256` (external) <a name="leaguepassnft-getleagpasscount--"></a>

*Description*: Gets number of NFT passes minted

### `_validateDeadlineToJoinLeague(address _user)` (internal) <a name="leaguepassnft-_validatedeadlinetojoinleague-address-"></a>

*Description*: Reverts is user can't join the league

**Dev doc**: Check that user joins the league before deadline to join the league or if he is allowed to fill last division. If user is allowed to fill last division, then we check if current amount of users in FantasyLeague less then necessary to create full divisions.


#### Params
 - `_user`: User address

### `_beforeTokenTransfer(address from, address to, uint256 tokenId)` (internal) <a name="leaguepassnft-_beforetokentransfer-address-address-uint256-"></a>

**Dev doc**: This function prevents users from having more than 1 NFT pass if they are not whitelisted.

### `setPaymentToken(address _token, uint256 _nftPrice)` (public) <a name="leaguepassnft-setpaymenttoken-address-uint256-"></a>

*Description*: Adds payment method for NFT pass


#### Params
 - `_token`: Address of ERC20 token contract

 - `_nftPrice`: Price for NFT pass in ERC20 tokens

### `setFinancialManager(address _address)` (public) <a name="leaguepassnft-setfinancialmanager-address-"></a>

*Description*: Sets address of financial manager


#### Params
 - `_address`: Address of financial manager contract

### `setDleagueToken(address _token)` (public) <a name="leaguepassnft-setdleaguetoken-address-"></a>

*Description*: Sets token address to be transferred to users after using NFT pass


#### Params
 - `_token`: Address of token to be transferred to users after using NFT pass

### `setDleagueTokenAmount(uint256 _amount)` (public) <a name="leaguepassnft-setdleaguetokenamount-uint256-"></a>

*Description*: Sets amount of tokens to be transferred to users after using NFT pass


#### Params
 - `_amount`: Amount of tokens to be transferred to users after using NFT pass

### `setBaseURI(string _baseURI)` (public) <a name="leaguepassnft-setbaseuri-string-"></a>

*Description*: Sets base URI for token URIs


#### Params
 - `_baseURI`: Base URI string, base URI will be concatenated with the token ID and the resulted string would be tokenURI (look getter - tokenURI())

### `setSaleDeadline(uint256 _deadline)` (public) <a name="leaguepassnft-setsaledeadline-uint256-"></a>

*Description*: Sets deadline for minting NFT pass


#### Params
 - `_deadline`: Time after which minting NFT pass is not possible

### `setLeagueStartDate(uint256 _date)` (public) <a name="leaguepassnft-setleaguestartdate-uint256-"></a>

*Description*: Sets date after which users can join the league


#### Params
 - `_date`: Date after which users can join the league

### `setLeagueJoinDeadline(uint256 _deadline)` (public) <a name="leaguepassnft-setleaguejoindeadline-uint256-"></a>

*Description*: Sets deadline for joining the league


#### Params
 - `_deadline`: Time after which joining the league is not possible

### `setWhitelistedAddr(address _addr, bool _val)` (external) <a name="leaguepassnft-setwhitelistedaddr-address-bool-"></a>

*Description*: Sets address as whitelisted if _val is true


#### Params
 - `_addr`: Address of the user

 - `_val`: If value is true address is whitelisted, if value is false address is not whitelisted

### `setIsInMarketingList(address _addr, bool _val)` (external) <a name="leaguepassnft-setisinmarketinglist-address-bool-"></a>

*Description*: Sets address as allowed to mint one free pass if _val is true


#### Params
 - `_addr`: Address of the user

 - `_val`: If value is true address is allowed to mint one free pass and vice versa

### `setIsAllowedToFillLastDivision(address _addr, bool _val)` (external) <a name="leaguepassnft-setisallowedtofilllastdivision-address-bool-"></a>

*Description*: Sets if user allowed to join division after deadline to fill last division


#### Params
 - `_addr`: Address of the user

 - `_val`: If value is true user is allowed to join division after deadline and vice versa.

### `setOneTokenPerAccount(bool _state)` (external) <a name="leaguepassnft-setonetokenperaccount-bool-"></a>

*Description*: Enable or halt limit for one token per account


#### Params
 - `_state`: If value is true limit is on, if value is false limit is off

### `_baseURI() → string` (internal) <a name="leaguepassnft-_baseuri--"></a>

**Dev doc**: Used in tokenURI standard function

#### Returns
 - Base URI

### `tokenURI(uint256 _tokenId) → string` (public) <a name="leaguepassnft-tokenuri-uint256-"></a>

*Description*: Return same URI for every existing token


#### Params
 - `_tokenId`: Id of token

### `supportsInterface(bytes4 interfaceId) → bool` (public) <a name="leaguepassnft-supportsinterface-bytes4-"></a>

**Dev doc**: Method is overwritten to resolve inheritance conflict
## Events <a name="events"></a>
### event `NewPassCreated(uint256 _tokenId, address _player, uint256 _price, address _token)` <a name="leaguepassnft-newpasscreated-uint256-address-uint256-address-"></a>

*Description*: ______________________________EVENTS_______________________________

### event `NewPlayerJoinedTheLeague(address _player, uint256 _nftPass)` <a name="leaguepassnft-newplayerjoinedtheleague-address-uint256-"></a>


### event `PaymentTokenIsSet(address _token, uint256 _nftPrice)` <a name="leaguepassnft-paymenttokenisset-address-uint256-"></a>


### event `DleagueTokenIsSet(address _addr)` <a name="leaguepassnft-dleaguetokenisset-address-"></a>


### event `DleagueTokenAmountIsSet(uint256 _amount)` <a name="leaguepassnft-dleaguetokenamountisset-uint256-"></a>


### event `WhitelistChanged(address _addr, bool _val)` <a name="leaguepassnft-whitelistchanged-address-bool-"></a>


### event `IsAllowedToFillLastDivisionChanged(address _addr, bool _val)` <a name="leaguepassnft-isallowedtofilllastdivisionchanged-address-bool-"></a>


### event `IsInMarketingListChanged(address _addr, bool _val)` <a name="leaguepassnft-isinmarketinglistchanged-address-bool-"></a>


### event `SaleDeadlineIsSet(uint256 _deadline)` <a name="leaguepassnft-saledeadlineisset-uint256-"></a>


### event `BaseURLforNFTisSet(string _url)` <a name="leaguepassnft-baseurlfornftisset-string-"></a>


### event `LeagueStartDateIsSet(uint256 _date)` <a name="leaguepassnft-leaguestartdateisset-uint256-"></a>


### event `LeagueJoinDeadlineIsSet(uint256 _deadline)` <a name="leaguepassnft-leaguejoindeadlineisset-uint256-"></a>


### event `FantasyLeagueContractIsSet(address _addr)` <a name="leaguepassnft-fantasyleaguecontractisset-address-"></a>


### event `OneTokenPerAccountIsSet(bool _state)` <a name="leaguepassnft-onetokenperaccountisset-bool-"></a>


### event `FinancialManagerIsSet(address _address)` <a name="leaguepassnft-financialmanagerisset-address-"></a>


