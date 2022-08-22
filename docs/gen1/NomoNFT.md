# NomoNFT
*NFT athletes contract.*

*Description*: This contract is the NFTs cards for NOMO fantasy sport.

**Dev doc**: Each token/card/NFT ID refers to the one card image. CardImage stores athletes data, their names,scores, etc.
CardImages and cards/NFTs starts from first id (1), not from zero id. That's done in that way because we don't want
to mess up with default zero value in variables.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor()` (public) ](#nomonft-constructor--)
  - [`setPosition(uint256 _code, string _name)` (external) ](#nomonft-setposition-uint256-string-)
  - [`createCardImage(string _name, string _imageURL, uint256 _league, uint256 _gen, uint256 _playerPosition, uint256 _setId)` (public) ](#nomonft-createcardimage-string-string-uint256-uint256-uint256-uint256-)
  - [`createCardsImages(string[] _names, string[] _imagesURLs, uint256[] _leagues, uint256 _gen, uint256[] _playerPositions, uint256 _setId)` (external) ](#nomonft-createcardsimages-string---string---uint256---uint256-uint256---uint256-)
  - [`changeCardImageName(uint256 _cardImageId, string _newName)` (external) ](#nomonft-changecardimagename-uint256-string-)
  - [`changeCardImagePosition(uint256 _cardImageId, uint256 _newPosition)` (external) ](#nomonft-changecardimageposition-uint256-uint256-)
  - [`getCardImage(uint256 _cardImageId) → string name, string imageURL, uint256 league, uint256 gen, uint256 playerPosition, uint256 parametersSetId, string[] parametersNames, uint256[] parametersValues, uint256 parametersUpdateTime` (external) ](#nomonft-getcardimage-uint256-)
  - [`getCardImageDataByTokenId(uint256 _tokenId) → string name, string imageURL, uint256 league, uint256 gen, uint256 playerPosition, uint256 parametersSetId, string[] parametersNames, uint256[] parametersValues, uint256 parametersUpdateTime` (external) ](#nomonft-getcardimagedatabytokenid-uint256-)
  - [`getCardImagePositionNameByTokenId(uint256 _tokenId) → string playerPosition` (external) ](#nomonft-getcardimagepositionnamebytokenid-uint256-)
  - [`createParametersSet(string[] _parametersNames)` (external) ](#nomonft-createparametersset-string---)
  - [`updateParametersNameInSet(uint256 _setId, uint256 _parameterNameId, string _parameterNewName)` (external) ](#nomonft-updateparametersnameinset-uint256-uint256-string-)
  - [`updateParametersNamesSet(uint256 _setId, string[] _parametersNames)` (external) ](#nomonft-updateparametersnamesset-uint256-string---)
  - [`updateParametersNamesSetUnsafe(uint256 _setId, string[] _parametersNames)` (external) ](#nomonft-updateparametersnamessetunsafe-uint256-string---)
  - [`bindCardImageToParametersNamesSet(uint256 _cardImageId, uint256 _setId)` (external) ](#nomonft-bindcardimagetoparametersnamesset-uint256-uint256-)
  - [`bindCardImageToParametersNamesSetForMany(uint256[] _cardImagesIds, uint256 _setId)` (external) ](#nomonft-bindcardimagetoparametersnamessetformany-uint256---uint256-)
  - [`updateParameters(uint256 _cardImageId, uint256[] _parametersValues)` (public) ](#nomonft-updateparameters-uint256-uint256---)
  - [`updateParametersForMany(uint256[] _cardsImagesIds, uint256[] _parametersValues)` (external) ](#nomonft-updateparametersformany-uint256---uint256---)
  - [`getNumberOfNamesSets() → uint256 numberOfNamesSets` (external) ](#nomonft-getnumberofnamessets--)
  - [`getNamesSet(uint256 _setId) → string[]` (external) ](#nomonft-getnamesset-uint256-)
  - [`getParameter(uint256 _cardImageId, uint256 _parameterId) → uint256 parameterValue` (external) ](#nomonft-getparameter-uint256-uint256-)
  - [`getParameters(uint256 _cardImageId) → uint256[] parametersValues` (external) ](#nomonft-getparameters-uint256-)
  - [`getParameterValueAndName(uint256 _cardImageId, uint256 _parameterId) → uint256 parameterValue, string parameterName` (external) ](#nomonft-getparametervalueandname-uint256-uint256-)
  - [`getParameterValuesAndNames(uint256 _cardImageId) → uint256[] parametersValues, string[] parametersNames` (external) ](#nomonft-getparametervaluesandnames-uint256-)
  - [`setBaseURI(string _baseURI)` (external) ](#nomonft-setbaseuri-string-)
  - [`mintCard(address _player, uint256 _cardImageId)` (public) ](#nomonft-mintcard-address-uint256-)
  - [`mintCards(address[] _players, uint256[] _cardsImagesIds)` (external) ](#nomonft-mintcards-address---uint256---)
  - [`mintCardsToPlayer(address _player, uint256[] _cardsImagesIds)` (external) ](#nomonft-mintcardstoplayer-address-uint256---)
  - [`getNumberOfTokens() → uint256 numberOfTokenIds` (external) ](#nomonft-getnumberoftokens--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(uint256 => struct NomoNFT.CardImageData) cardsImages`
- `mapping(uint256 => string[]) parametersNamesSets`
- `mapping(uint256 => bool) namesSetToExistence`
- `mapping(uint256 => mapping(uint256 => uint256[])) cardImagesParameters`
- `uint256 PARAMETERS_DECIMALS`
- `mapping(uint256 => bool) cardImageToExistence`
- `mapping(uint256 => uint256) cardToCardImageID`
- `mapping(uint256 => string) positionCodeToName`
- `string baseURI`

## Functions <a name="functions"></a>

### `constructor()` (public) <a name="nomonft-constructor--"></a>

**Dev doc**: Contract constructor

### `setPosition(uint256 _code, string _name)` (external) <a name="nomonft-setposition-uint256-string-"></a>

*Description*: Sets a position. The corresponding name to the position code (number)


#### Params
 - `_code`: The code of the position.

 - `_name`: The name of the position.

### `createCardImage(string _name, string _imageURL, uint256 _league, uint256 _gen, uint256 _playerPosition, uint256 _setId)` (public) <a name="nomonft-createcardimage-string-string-uint256-uint256-uint256-uint256-"></a>

*Description*: Creates card image for athlete card


#### Params
 - `_name`: The name of the card corresponds to the name of the athlete. Can be changed after creation.

 - `_league`: Number of the league. Cannot be changed after creation.

 - `_gen`: Generation number.  Cannot be changed after creation.

 - `_setId`: Parameters names set id, can be changed after creation.

 - `_playerPosition`: Player's position code (number), can be changed after creation.

### `createCardsImages(string[] _names, string[] _imagesURLs, uint256[] _leagues, uint256 _gen, uint256[] _playerPositions, uint256 _setId)` (external) <a name="nomonft-createcardsimages-string---string---uint256---uint256-uint256---uint256-"></a>

*Description*: Creates a set of cards images for athletes cards


#### Params
 - `_names`: The names of the cards corresponds to the name of the athletes. Can be changed after creation.

 - `_leagues`: Numbers of the leagues. Cannot be changed after creation.

 - `_gen`: Generation number - one number for all new cards. Cannot be changed after creation.

 - `_playerPositions`: Codes (numbers) of players' positions, can be changed after creation.

 - `_setId`: Parameters names set id, can be changed after creation.

### `changeCardImageName(uint256 _cardImageId, string _newName)` (external) <a name="nomonft-changecardimagename-uint256-string-"></a>

*Description*: Changes the name of the card image

**Dev doc**: Reverts on non-existent card image id.

#### Params
 - `_cardImageId`: Card Image id

 - `_newName`: New card name


### `changeCardImagePosition(uint256 _cardImageId, uint256 _newPosition)` (external) <a name="nomonft-changecardimageposition-uint256-uint256-"></a>

*Description*: Changes the player's position of the card image

**Dev doc**: Reverts on non-existent card image id, non-existent position.

#### Params
 - `_cardImageId`: Card Image id.

 - `_newPosition`: New code (number) of the player's position of the card image.


### `getCardImage(uint256 _cardImageId) → string name, string imageURL, uint256 league, uint256 gen, uint256 playerPosition, uint256 parametersSetId, string[] parametersNames, uint256[] parametersValues, uint256 parametersUpdateTime` (external) <a name="nomonft-getcardimage-uint256-"></a>

*Description*: Returns all data from card image.

**Dev doc**: Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert
message. parametersNames.length == parametersValues.length.


#### Params
 - `_cardImageId`: Card Image id.

#### Returns
 - name - The name of the card corresponds to the name of the athlete.

 - imageURL - Link to the card's/player's image.

 - league - Number of the league.

 - gen - Number of the generation.

 - playerPosition - Code (number) of the player's position.

 - parametersSetId - Id of the parameters names set array.

 - parametersNames - Parameters names array. Must be combined with params values and displayed as NFT player
stats.

 - parametersValues - Parameters values array.

 - parametersUpdateTime - Unix timestamp when params was updated last time.

### `getCardImageDataByTokenId(uint256 _tokenId) → string name, string imageURL, uint256 league, uint256 gen, uint256 playerPosition, uint256 parametersSetId, string[] parametersNames, uint256[] parametersValues, uint256 parametersUpdateTime` (external) <a name="nomonft-getcardimagedatabytokenid-uint256-"></a>

*Description*: Returns all data from card image binded to specified token.

**Dev doc**: Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert
message. parametersNames.length == parametersValues.length.


#### Params
 - `_tokenId`: NFT id which card image data will be returned.

#### Returns
 - name - The name of the card corresponds to the name of the athlete.

 - imageURL - Link to the card's/player's image.

 - league - Number of the league.

 - gen - Number of the generation.

 - playerPosition - Code (number) of the player's position.

 - parametersSetId - Id of the parameters names set array.

 - parametersNames - Parameters names array. Must be combined with params values and displayed as NFT player
stats.

 - parametersValues - Parameters values array.

 - parametersUpdateTime - Unix timestamp when params was updated last time.

### `getCardImagePositionNameByTokenId(uint256 _tokenId) → string playerPosition` (external) <a name="nomonft-getcardimagepositionnamebytokenid-uint256-"></a>

*Description*: Returns position name from card image binded to specified token.

**Dev doc**: Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert message. parametersNames.length == parametersValues.length.


#### Params
 - `_tokenId`: NFT id which card image position name will be returned.

#### Returns
 - playerPosition - Code (number) of the player's position.

### `createParametersSet(string[] _parametersNames)` (external) <a name="nomonft-createparametersset-string---"></a>

*Description*: Creates new parameters names set. Ids of the sets starting from one, not zero.


#### Params
 - `_parametersNames`: New names values for the set

### `updateParametersNameInSet(uint256 _setId, uint256 _parameterNameId, string _parameterNewName)` (external) <a name="nomonft-updateparametersnameinset-uint256-uint256-string-"></a>

*Description*: Rewrites name in the set


#### Params
 - `_setId`: Id of the set to update

 - `_parameterNameId`: Id of the parameter name to update in the set

 - `_parameterNewName`: New name value

### `updateParametersNamesSet(uint256 _setId, string[] _parametersNames)` (external) <a name="nomonft-updateparametersnamesset-uint256-string---"></a>

*Description*: Rewrites names set with length check (checks that new names array length will be equal to previous name array length).

**Dev doc**: Be careful with names updates - values array won't be changed, thus values can refer to wrong names after incorrect names update. Consider if you can create new names set instead of changing existing one.


#### Params
 - `_setId`: Id of the set to update

 - `_parametersNames`: New names values for the set

### `updateParametersNamesSetUnsafe(uint256 _setId, string[] _parametersNames)` (external) <a name="nomonft-updateparametersnamessetunsafe-uint256-string---"></a>

*Description*: Rewrites names set without length check. New set can be bigger or smaller then previous set, thus CardImages parameters values would have missing or excess values. Consider if you can create new names set instead of changing existing one.

**Dev doc**: Front-/Back-end can get errors while trying to receive parameters with missing or excess values.


#### Params
 - `_setId`: Id of the set to update

 - `_parametersNames`: New names values for the set

### `bindCardImageToParametersNamesSet(uint256 _cardImageId, uint256 _setId)` (external) <a name="nomonft-bindcardimagetoparametersnamesset-uint256-uint256-"></a>

*Description*: Updates Card Image's parameters names set


#### Params
 - `_cardImageId`: Card Image id to bind to the set

 - `_setId`: Id of the set to bind

### `bindCardImageToParametersNamesSetForMany(uint256[] _cardImagesIds, uint256 _setId)` (external) <a name="nomonft-bindcardimagetoparametersnamessetformany-uint256---uint256-"></a>

*Description*: Updates Card Images parameters names set. Iterates through the array of the Cards Images and sets
parameters set to them.


#### Params
 - `_cardImagesIds`: Cards images ids to bind to the set

 - `_setId`: Id of the set to bind

### `updateParameters(uint256 _cardImageId, uint256[] _parametersValues)` (public) <a name="nomonft-updateparameters-uint256-uint256---"></a>

*Description*: Updates CardImage's parameters values

**Dev doc**: Parameters values have decimals


#### Params
 - `_cardImageId`: Card image to update

 - `_parametersValues`: New player's parameters values

### `updateParametersForMany(uint256[] _cardsImagesIds, uint256[] _parametersValues)` (external) <a name="nomonft-updateparametersformany-uint256---uint256---"></a>

*Description*: Updates CardsImages parameters values points. Parameters values have decimals.

**Dev doc**: All CardsImages passed to that function must have the same setId. Or you can pass CardsImages with different
sets they binded to, but these sets must have the same length.


#### Params
 - `_cardsImagesIds`: Cards images to update. All must have the same _setId.

 - `_parametersValues`: New players' parameters values. This array must contain parameters values for all
CardsImages glued together in one array. This function will iterate on them with constant step (step = length of
the names set). E.g. you passed 10 Cards Images, all of them binded to the names set that consists of the 5
names. So, you parameters values array must contain 10*5=50 values, where first 5 parameters would go to the
first CardImage, next 5 values to the second one and so on.

### `getNumberOfNamesSets() → uint256 numberOfNamesSets` (external) <a name="nomonft-getnumberofnamessets--"></a>

*Description*: Returns amount of the namesSets

#### Returns
 - numberOfNamesSets - Is current number of existing names sets ids

### `getNamesSet(uint256 _setId) → string[]` (external) <a name="nomonft-getnamesset-uint256-"></a>

*Description*: Returns names set by id


#### Params
 - `_setId`: Id of the names set to return

#### Returns
 - Names set string array

### `getParameter(uint256 _cardImageId, uint256 _parameterId) → uint256 parameterValue` (external) <a name="nomonft-getparameter-uint256-uint256-"></a>

*Description*: Returns parameter value for specified Card Image


#### Params
 - `_cardImageId`: Card Image id

 - `_parameterId`: Id of the parameter to return

#### Returns
 - parameterValue - Is the value of the parameter stored in the card image

### `getParameters(uint256 _cardImageId) → uint256[] parametersValues` (external) <a name="nomonft-getparameters-uint256-"></a>

*Description*: Returns parameters values array for specified Card Image


#### Params
 - `_cardImageId`: Card Image id

#### Returns
 - parametersValues - Is the parameters values stored in the card image

### `getParameterValueAndName(uint256 _cardImageId, uint256 _parameterId) → uint256 parameterValue, string parameterName` (external) <a name="nomonft-getparametervalueandname-uint256-uint256-"></a>

*Description*: Returns parameter value and its name for specified Card Image


#### Params
 - `_cardImageId`: Card Image id

 - `_parameterId`: Id of the parameter to return

#### Returns
 - parameterValue - Is the value of the parameter stored in the card image

 - parameterName - Is the name of the parameter stored in the card image

### `getParameterValuesAndNames(uint256 _cardImageId) → uint256[] parametersValues, string[] parametersNames` (external) <a name="nomonft-getparametervaluesandnames-uint256-"></a>

*Description*: Returns parameters values and names arrays for specified Card Image


#### Params
 - `_cardImageId`: Card Image id

#### Returns
 - parametersValues - Is the parameters values stored in the card image

 - parametersNames - Is the parameters names stored in the card image

### `setBaseURI(string _baseURI)` (external) <a name="nomonft-setbaseuri-string-"></a>

*Description*: Sets base URI for token URIs


#### Params
 - `_baseURI`: Base URI string, base URI will be concatenated with the token ID and the resulted string would be
tokenURI (look getter - tokenURI())

### `mintCard(address _player, uint256 _cardImageId)` (public) <a name="nomonft-mintcard-address-uint256-"></a>

*Description*: Assigning a token to a user and binding it to a card image

**Dev doc**: Reverts on non-existent card image id.

#### Params
 - `_player`: Player address

 - `_cardImageId`: Card Image id


### `mintCards(address[] _players, uint256[] _cardsImagesIds)` (external) <a name="nomonft-mintcards-address---uint256---"></a>

*Description*: Assigning a token to a user and binding it to a card image

**Dev doc**: Reverts on non-existent card image id. For each player creates new token with the specified card image id.
_players.length must be equal to _cardsImagesIds.length.

#### Params
 - `_players`: Players array address

 - `_cardsImagesIds`: Card Image ids array


### `mintCardsToPlayer(address _player, uint256[] _cardsImagesIds)` (external) <a name="nomonft-mintcardstoplayer-address-uint256---"></a>

*Description*: Assigning tokens to a user and binding then to cards images

**Dev doc**: Reverts on non-existent card image id. Creates new tokens and assigns them to specified account.

#### Params
 - `_player`: Player address

 - `_cardsImagesIds`: Card Image ids array


### `_baseURI() → string` (internal) <a name="nomonft-_baseuri--"></a>

**Dev doc**: Used in tokenURI standard function

#### Returns
 - Base URI

### `getNumberOfTokens() → uint256 numberOfTokenIds` (external) <a name="nomonft-getnumberoftokens--"></a>

*Description*: Getting the number of tokens

#### Returns
 - numberOfTokenIds - current number of existing token ids
## Events <a name="events"></a>
### event `NewCardImageCreated(uint256 _cardImageId, string _name, string _imageURL, uint256 _league, uint256 _gen, uint256 _playerPosition, uint256 _setId)` <a name="nomonft-newcardimagecreated-uint256-string-string-uint256-uint256-uint256-uint256-"></a>

**Dev doc**: When card image created

### event `NewCardCreated(uint256 _cardImageId, uint256 _tokenId, address _player)` <a name="nomonft-newcardcreated-uint256-uint256-address-"></a>

**Dev doc**: When card created

### event `ChangedCardImageName(uint256 _cardImageId, string _name)` <a name="nomonft-changedcardimagename-uint256-string-"></a>

**Dev doc**: When card image name changed

### event `UpdatedCardImageParameters(uint256 _cardImageId)` <a name="nomonft-updatedcardimageparameters-uint256-"></a>

**Dev doc**: When card image parameters updated

### event `CreatedPositionCode(uint256 _position, string _positionName)` <a name="nomonft-createdpositioncode-uint256-string-"></a>

**Dev doc**: When position code created

### event `ChangedCardImagePosition(uint256 _cardImageId, uint256 _position, string _positionName)` <a name="nomonft-changedcardimageposition-uint256-uint256-string-"></a>

**Dev doc**: When card image position changed

### event `CreatedParametersNamesSet(uint256 _setId)` <a name="nomonft-createdparametersnamesset-uint256-"></a>

**Dev doc**: When parameters names set created

### event `UpdatedParametersNamesSet(uint256 _setId)` <a name="nomonft-updatedparametersnamesset-uint256-"></a>

**Dev doc**: When parameters names set updated

### event `BindedCardImageToNamesSet(uint256 _cardImageId, uint256 _setId)` <a name="nomonft-bindedcardimagetonamesset-uint256-uint256-"></a>

**Dev doc**: When card image was bound to names set

