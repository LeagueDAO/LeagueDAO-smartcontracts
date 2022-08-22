// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

/**
 * @title NFT athletes contract.
 * @notice This contract is the NFTs cards for NOMO fantasy sport.
 * @dev Each token/card/NFT ID refers to the one card image. CardImage stores athletes data, their names,scores, etc.
 * CardImages and cards/NFTs starts from first id (1), not from zero id. That's done in that way because we don't want
 * to mess up with default zero value in variables.
 */
contract NomoNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    // ============ Structs ============

    /// @dev Struct of card image data set
    struct CardImageData {
        string name;
        string imageURL;
        uint256 league;
        uint256 gen;
        uint256 playerPosition;
        uint256 parametersUpdateTime;
        uint256 parametersSetId;
    }

    // ============ Variables ============

    /// @dev Counter of tokens
    Counters.Counter private _tokenIds;

    /// @dev Counter of card images
    Counters.Counter private _cardImageIds;

    /// @dev Counter of name sets
    Counters.Counter private _namesSetsIds;

    /**
     * @notice Stores created card images. Card image is the data of the card. All NFTs are linked to appropriate image
     * card.
     */
    mapping(uint256 => CardImageData) public cardsImages;

    /// @notice parametersSetId => parameters names
    mapping(uint256 => string[]) public parametersNamesSets;

    /// @notice namesSetId => existence
    mapping(uint256 => bool) public namesSetToExistence;

    /**
     * @notice Parameters names set id => card image id => parameters values array
     * @dev Values indexes must be the same as corresponding names indexes in the parametersNamesSet
     */
    mapping(uint256 => mapping(uint256 => uint256[])) public cardImagesParameters;

    /// @notice Parameters have 2 decimals, thus, for example, parameter value 3.4 must be stored as 340
    uint256 public constant PARAMETERS_DECIMALS = 100;

    /// @notice cardImageId => existence
    mapping(uint256 => bool) public cardImageToExistence;

    /// @notice token id => card image id
    mapping(uint256 => uint256) public cardToCardImageID;

    /// @notice position code => position name
    mapping(uint256 => string) public positionCodeToName;

    /// @notice base for tokens URIs
    string public baseURI;

    // ============ Events ============

    /// @dev When card image created
    event NewCardImageCreated(
        uint256 indexed _cardImageId,
        string _name,
        string _imageURL,
        uint256 indexed _league,
        uint256 indexed _gen,
        uint256 _playerPosition,
        uint256 _setId
    );

    /// @dev When card created
    event NewCardCreated(uint256 indexed _cardImageId, uint256 indexed _tokenId, address indexed _player);

    /// @dev When card image name changed
    event ChangedCardImageName(uint256 indexed _cardImageId, string _name);

    /// @dev When card image parameters updated
    event UpdatedCardImageParameters(uint256 indexed _cardImageId);

    /// @dev When position code created
    event CreatedPositionCode(uint256 indexed _position, string _positionName);

    /// @dev When card image position changed
    event ChangedCardImagePosition(uint256 indexed _cardImageId, uint256 indexed _position, string _positionName);

    /// @dev When parameters names set created
    event CreatedParametersNamesSet(uint256 indexed _setId);

    /// @dev When parameters names set updated
    event UpdatedParametersNamesSet(uint256 indexed _setId);

    /// @dev When card image was bound to names set
    event BindedCardImageToNamesSet(uint256 indexed _cardImageId, uint256 indexed _setId);

    // ============ Constructor ============

    /// @dev Contract constructor
    constructor() ERC721("LeagueDAO: Nomo Player Token", "NOMO") {}

    // ============ Modifiers ============

    /**
     * @dev Allows only if card image exist
     * @param _cardImageId ID of the card image
     */
    modifier onlyExistingCardImage(uint256 _cardImageId) {
        require(cardImageToExistence[_cardImageId], "Card image !exists");
        _;
    }

    /**
     * @dev Allows only if names set exist
     * @param _setId ID of the names set
     */
    modifier onlyExistingParametersNamesSet(uint256 _setId) {
        require(namesSetToExistence[_setId], "Params names set !exists");
        _;
    }

    /**
     * @dev Allows only if not empty name
     * @param _name Name string
     */
    modifier nonEmptyName(string memory _name) {
        require(keccak256(abi.encodePacked(_name)) != keccak256(abi.encodePacked("")), "Empty name");
        _;
    }

    // ============ Positions functionality ============

    /**
     * @notice Sets a position. The corresponding name to the position code (number)
     * @param _code The code of the position.
     * @param _name The name of the position.
     */
    function setPosition(uint256 _code, string memory _name) external nonEmptyName(_name) onlyOwner {
        positionCodeToName[_code] = _name;
        emit CreatedPositionCode(_code, _name);
    }

    // ============ Cards Images functionality ============

    /**
     * @notice Creates card image for athlete card
     * @param _name The name of the card corresponds to the name of the athlete. Can be changed after creation.
     * @param _league Number of the league. Cannot be changed after creation.
     * @param _gen Generation number.  Cannot be changed after creation.
     * @param _setId Parameters names set id, can be changed after creation.
     * @param _playerPosition Player's position code (number), can be changed after creation.
     */
    function createCardImage(
        string memory _name,
        string memory _imageURL,
        uint256 _league,
        uint256 _gen,
        uint256 _playerPosition,
        uint256 _setId
    ) public nonEmptyName(_name) onlyOwner {
        // we didn't create modifier for this require (and second same require) because of gas optimization
        require(
            keccak256(abi.encodePacked(positionCodeToName[_playerPosition])) != keccak256(abi.encodePacked("")),
            "Unknown position code"
        );

        _cardImageIds.increment();
        uint256 _cardImageId = _cardImageIds.current();
        CardImageData storage cardImage = cardsImages[_cardImageId];
        cardImage.name = _name;
        cardImage.imageURL = _imageURL;
        cardImage.league = _league;
        cardImage.gen = _gen;
        cardImage.playerPosition = _playerPosition;
        cardImage.parametersSetId = _setId;

        cardImageToExistence[_cardImageId] = true;
        emit NewCardImageCreated(_cardImageId, _name, _imageURL, _league, _gen, _playerPosition, _setId);
        emit BindedCardImageToNamesSet(_cardImageId, _setId);
    }

    /**
     * @notice Creates a set of cards images for athletes cards
     * @param _names The names of the cards corresponds to the name of the athletes. Can be changed after creation.
     * @param _leagues Numbers of the leagues. Cannot be changed after creation.
     * @param _gen Generation number - one number for all new cards. Cannot be changed after creation.
     * @param _playerPositions Codes (numbers) of players' positions, can be changed after creation.
     * @param _setId Parameters names set id, can be changed after creation.
     */
    function createCardsImages(
        string[] memory _names,
        string[] memory _imagesURLs,
        uint256[] calldata _leagues,
        uint256 _gen,
        uint256[] calldata _playerPositions,
        uint256 _setId
    ) external onlyOwner {
        require(_names.length == _leagues.length, "names.length != leagues.length");
        require(_imagesURLs.length == _names.length, "imagesURLs.length != names.length");
        require(_playerPositions.length == _names.length, "playerPositions.length != names.length");
        for (uint256 i = 0; i < _names.length; i++) {
            createCardImage(_names[i], _imagesURLs[i], _leagues[i], _gen, _playerPositions[i], _setId);
        }
    }

    /**
     * @notice Changes the name of the card image
     * @param _cardImageId Card Image id
     * @param _newName New card name
     * @dev Reverts on non-existent card image id.
     */
    function changeCardImageName(uint256 _cardImageId, string calldata _newName)
        external
        nonEmptyName(_newName)
        onlyExistingCardImage(_cardImageId)
        onlyOwner
    {
        cardsImages[_cardImageId].name = _newName;
        emit ChangedCardImageName(_cardImageId, _newName);
    }

    /**
     * @notice Changes the player's position of the card image
     * @param _cardImageId Card Image id.
     * @param _newPosition New code (number) of the player's position of the card image.
     * @dev Reverts on non-existent card image id, non-existent position.
     */
    function changeCardImagePosition(uint256 _cardImageId, uint256 _newPosition)
        external
        onlyExistingCardImage(_cardImageId)
        onlyOwner
    {
        string memory positionName = positionCodeToName[_newPosition];
        require(keccak256(abi.encodePacked(positionName)) != keccak256(abi.encodePacked("")), "Unknown position code");
        cardsImages[_cardImageId].playerPosition = _newPosition;
        emit ChangedCardImagePosition(_cardImageId, _newPosition, positionName);
    }

    // ============ Cards Images getters ============

    /**
     * @notice Returns all data from card image.
     * @dev Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert
     * message. parametersNames.length == parametersValues.length.
     * @param _cardImageId Card Image id.
     * @return name - The name of the card corresponds to the name of the athlete.
     * @return imageURL - Link to the card's/player's image.
     * @return league - Number of the league.
     * @return gen - Number of the generation.
     * @return playerPosition - Code (number) of the player's position.
     * @return parametersSetId - Id of the parameters names set array.
     * @return parametersNames - Parameters names array. Must be combined with params values and displayed as NFT player
     * stats.
     * @return parametersValues - Parameters values array.
     * @return parametersUpdateTime - Unix timestamp when params was updated last time.
     */
    function getCardImage(uint256 _cardImageId)
        external
        view
        onlyExistingCardImage(_cardImageId)
        returns (
            string memory name,
            string memory imageURL,
            uint256 league,
            uint256 gen,
            uint256 playerPosition,
            uint256 parametersSetId,
            string[] memory parametersNames,
            uint256[] memory parametersValues,
            uint256 parametersUpdateTime
        )
    {
        CardImageData memory cardImage = cardsImages[_cardImageId];
        name = cardImage.name;
        imageURL = cardImage.imageURL;
        league = cardImage.league;
        gen = cardImage.gen;

        playerPosition = cardImage.playerPosition;

        parametersSetId = cardImage.parametersSetId;
        parametersValues = cardImagesParameters[parametersSetId][_cardImageId];
        parametersNames = parametersNamesSets[parametersSetId];
        parametersUpdateTime = cardImage.parametersUpdateTime;
    }

    /**
     * @notice Returns all data from card image binded to specified token.
     * @dev Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert
     * message. parametersNames.length == parametersValues.length.
     * @param _tokenId NFT id which card image data will be returned.
     * @return name - The name of the card corresponds to the name of the athlete.
     * @return imageURL - Link to the card's/player's image.
     * @return league - Number of the league.
     * @return gen - Number of the generation.
     * @return playerPosition - Code (number) of the player's position.
     * @return parametersSetId - Id of the parameters names set array.
     * @return parametersNames - Parameters names array. Must be combined with params values and displayed as NFT player
     * stats.
     * @return parametersValues - Parameters values array.
     * @return parametersUpdateTime - Unix timestamp when params was updated last time.
     */
    function getCardImageDataByTokenId(uint256 _tokenId)
        external
        view
        returns (
            string memory name,
            string memory imageURL,
            uint256 league,
            uint256 gen,
            uint256 playerPosition,
            uint256 parametersSetId,
            string[] memory parametersNames,
            uint256[] memory parametersValues,
            uint256 parametersUpdateTime
        )
    {
        uint256 cardImageId = cardToCardImageID[_tokenId];
        require(cardImageToExistence[cardImageId], "Card image !exists");
        CardImageData memory cardImage = cardsImages[cardImageId];
        name = cardImage.name;
        imageURL = cardImage.imageURL;
        league = cardImage.league;
        gen = cardImage.gen;
        playerPosition = cardImage.playerPosition;

        parametersSetId = cardImage.parametersSetId;
        parametersValues = cardImagesParameters[parametersSetId][cardImageId];
        parametersNames = parametersNamesSets[parametersSetId];

        parametersUpdateTime = cardImage.parametersUpdateTime;
    }

    /**
     * @notice Returns position name from card image binded to specified token.
     * @dev Reverts on non-existent card image id => revert on non-existent NFT with "Card image !exists" revert message. parametersNames.length == parametersValues.length.
     * @param _tokenId NFT id which card image position name will be returned.
     * @return playerPosition - Code (number) of the player's position.
     */
    function getCardImagePositionNameByTokenId(uint256 _tokenId) external view returns (string memory playerPosition) {
        uint256 cardImageId = cardToCardImageID[_tokenId];
        require(cardImageToExistence[cardImageId], "Card image !exists");
        playerPosition = positionCodeToName[cardsImages[cardImageId].playerPosition];
    }

    // ============ Card Images parameters functionality ============

    /**
     * @notice Creates new parameters names set. Ids of the sets starting from one, not zero.
     * @param _parametersNames New names values for the set
     */
    function createParametersSet(string[] memory _parametersNames) external onlyOwner {
        _namesSetsIds.increment();
        uint256 setId = _namesSetsIds.current();

        parametersNamesSets[setId] = _parametersNames;
        namesSetToExistence[setId] = true;
        emit CreatedParametersNamesSet(setId);
    }

    /**
     * @notice Rewrites name in the set
     * @param _setId Id of the set to update
     * @param _parameterNameId Id of the parameter name to update in the set
     * @param _parameterNewName New name value
     */
    function updateParametersNameInSet(
        uint256 _setId,
        uint256 _parameterNameId,
        string memory _parameterNewName
    ) external onlyExistingParametersNamesSet(_setId) onlyOwner {
        parametersNamesSets[_setId][_parameterNameId] = _parameterNewName;
        emit UpdatedParametersNamesSet(_setId);
    }

    /**
     * @notice Rewrites names set with length check (checks that new names array length will be equal to previous name array length).
     * @dev Be careful with names updates - values array won't be changed, thus values can refer to wrong names after incorrect names update. Consider if you can create new names set instead of changing existing one.
     * @param _setId Id of the set to update
     * @param _parametersNames New names values for the set
     */
    function updateParametersNamesSet(uint256 _setId, string[] memory _parametersNames)
        external
        onlyExistingParametersNamesSet(_setId)
        onlyOwner
    {
        require(parametersNamesSets[_setId].length == _parametersNames.length, "New set length differs");

        parametersNamesSets[_setId] = _parametersNames;
        emit UpdatedParametersNamesSet(_setId);
    }

    /**
     * @notice Rewrites names set without length check. New set can be bigger or smaller then previous set, thus CardImages parameters values would have missing or excess values. Consider if you can create new names set instead of changing existing one.
     * @dev Front-/Back-end can get errors while trying to receive parameters with missing or excess values.
     * @param _setId Id of the set to update
     * @param _parametersNames New names values for the set
     */
    function updateParametersNamesSetUnsafe(uint256 _setId, string[] memory _parametersNames)
        external
        onlyExistingParametersNamesSet(_setId)
        onlyOwner
    {
        parametersNamesSets[_setId] = _parametersNames;
        emit UpdatedParametersNamesSet(_setId);
    }

    /**
     * @notice Updates Card Image's parameters names set
     * @param _cardImageId Card Image id to bind to the set
     * @param _setId Id of the set to bind
     */
    function bindCardImageToParametersNamesSet(uint256 _cardImageId, uint256 _setId)
        external
        onlyExistingCardImage(_cardImageId)
        onlyExistingParametersNamesSet(_setId)
        onlyOwner
    {
        CardImageData storage cardImage = cardsImages[_cardImageId];
        cardImage.parametersSetId = _setId;
        emit BindedCardImageToNamesSet(_cardImageId, _setId);
    }

    /**
     * @notice Updates Card Images parameters names set. Iterates through the array of the Cards Images and sets
     * parameters set to them.
     * @param _cardImagesIds Cards images ids to bind to the set
     * @param _setId Id of the set to bind
     */
    function bindCardImageToParametersNamesSetForMany(uint256[] calldata _cardImagesIds, uint256 _setId)
        external
        onlyExistingParametersNamesSet(_setId)
        onlyOwner
    {
        for (uint256 i = 0; i < _cardImagesIds.length; i++) {
            uint256 cardImageId = _cardImagesIds[i];

            require(cardImageToExistence[cardImageId], "Card image !exists");

            CardImageData storage cardImage = cardsImages[cardImageId];
            cardImage.parametersSetId = _setId;
            emit BindedCardImageToNamesSet(cardImageId, _setId);
        }
    }

    /**
     * @notice Updates CardImage's parameters values
     * @dev Parameters values have decimals
     * @param _cardImageId Card image to update
     * @param _parametersValues New player's parameters values
     */
    function updateParameters(uint256 _cardImageId, uint256[] calldata _parametersValues) public onlyOwner {
        CardImageData storage cardImage = cardsImages[_cardImageId];
        uint256 setId = cardImage.parametersSetId;
        uint256 parametersLength = parametersNamesSets[setId].length;

        require(parametersLength == _parametersValues.length, "unexpected parameters length");

        cardImagesParameters[setId][_cardImageId] = _parametersValues;
        cardImage.parametersUpdateTime = block.timestamp;

        emit UpdatedCardImageParameters(_cardImageId);
    }

    /**
     * @notice Updates CardsImages parameters values points. Parameters values have decimals.
     * @dev All CardsImages passed to that function must have the same setId. Or you can pass CardsImages with different
     * sets they binded to, but these sets must have the same length.
     * @param _cardsImagesIds Cards images to update. All must have the same _setId.
     * @param _parametersValues New players' parameters values. This array must contain parameters values for all
     * CardsImages glued together in one array. This function will iterate on them with constant step (step = length of
     * the names set). E.g. you passed 10 Cards Images, all of them binded to the names set that consists of the 5
     * names. So, you parameters values array must contain 10*5=50 values, where first 5 parameters would go to the
     * first CardImage, next 5 values to the second one and so on.
     */
    function updateParametersForMany(uint256[] calldata _cardsImagesIds, uint256[] calldata _parametersValues)
        external
        onlyOwner
    {
        uint256 setId = cardsImages[_cardsImagesIds[0]].parametersSetId;
        uint256 parametersLength = parametersNamesSets[setId].length;
        uint256 expectedParametersLength = parametersLength * _cardsImagesIds.length;

        require(expectedParametersLength == _parametersValues.length, "unexpected parameters length");

        for (uint256 i = 0; i < _cardsImagesIds.length; i++) {
            updateParameters(_cardsImagesIds[i], _parametersValues[i * parametersLength:(i + 1) * parametersLength]);
        }
    }

    // ============ Card Images parameters getters ============

    /**
     * @notice Returns amount of the namesSets
     * @return numberOfNamesSets - Is current number of existing names sets ids
     */
    function getNumberOfNamesSets() external view returns (uint256 numberOfNamesSets) {
        numberOfNamesSets = _namesSetsIds.current();
    }

    /**
     * @notice Returns names set by id
     * @param _setId Id of the names set to return
     * @return Names set string array
     */
    function getNamesSet(uint256 _setId) external view returns (string[] memory) {
        return parametersNamesSets[_setId];
    }

    /**
     * @notice Returns parameter value for specified Card Image
     * @param _cardImageId Card Image id
     * @param _parameterId Id of the parameter to return
     * @return parameterValue - Is the value of the parameter stored in the card image
     */
    function getParameter(uint256 _cardImageId, uint256 _parameterId) external view returns (uint256 parameterValue) {
        uint256 setId = cardsImages[_cardImageId].parametersSetId;
        parameterValue = cardImagesParameters[setId][_cardImageId][_parameterId];
    }

    /**
     * @notice Returns parameters values array for specified Card Image
     * @param _cardImageId Card Image id
     * @return parametersValues - Is the parameters values stored in the card image
     */
    function getParameters(uint256 _cardImageId) external view returns (uint256[] memory parametersValues) {
        uint256 setId = cardsImages[_cardImageId].parametersSetId;
        parametersValues = cardImagesParameters[setId][_cardImageId];
    }

    /**
     * @notice Returns parameter value and its name for specified Card Image
     * @param _cardImageId Card Image id
     * @param _parameterId Id of the parameter to return
     * @return parameterValue - Is the value of the parameter stored in the card image
     * @return parameterName - Is the name of the parameter stored in the card image
     */
    function getParameterValueAndName(uint256 _cardImageId, uint256 _parameterId)
        external
        view
        returns (uint256 parameterValue, string memory parameterName)
    {
        uint256 setId = cardsImages[_cardImageId].parametersSetId;
        parameterValue = cardImagesParameters[setId][_cardImageId][_parameterId];
        parameterName = parametersNamesSets[setId][_parameterId];
    }

    /**
     * @notice Returns parameters values and names arrays for specified Card Image
     * @param _cardImageId Card Image id
     * @return parametersValues - Is the parameters values stored in the card image
     * @return parametersNames - Is the parameters names stored in the card image
     */
    function getParameterValuesAndNames(uint256 _cardImageId)
        external
        view
        returns (uint256[] memory parametersValues, string[] memory parametersNames)
    {
        uint256 setId = cardsImages[_cardImageId].parametersSetId;
        parametersValues = cardImagesParameters[setId][_cardImageId];
        parametersNames = parametersNamesSets[setId];
    }

    // ============ Tokens functionality ============

    /**
     * @notice Sets base URI for token URIs
     * @param _baseURI Base URI string, base URI will be concatenated with the token ID and the resulted string would be
     * tokenURI (look getter - tokenURI())
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice Assigning a token to a user and binding it to a card image
     * @param _player Player address
     * @param _cardImageId Card Image id
     * @dev Reverts on non-existent card image id.
     */
    function mintCard(address _player, uint256 _cardImageId) public onlyExistingCardImage(_cardImageId) onlyOwner {
        _tokenIds.increment();
        uint256 _tokenId = _tokenIds.current();

        _mint(_player, _tokenId);

        cardToCardImageID[_tokenId] = _cardImageId;

        emit NewCardCreated(_cardImageId, _tokenId, _player);
    }

    /**
     * @notice Assigning a token to a user and binding it to a card image
     * @param _players Players array address
     * @param _cardsImagesIds Card Image ids array
     * @dev Reverts on non-existent card image id. For each player creates new token with the specified card image id.
     * _players.length must be equal to _cardsImagesIds.length.
     */
    function mintCards(address[] calldata _players, uint256[] calldata _cardsImagesIds) external onlyOwner {
        require(_players.length == _cardsImagesIds.length);
        for (uint256 i = 0; i < _players.length; i++) {
            mintCard(_players[i], _cardsImagesIds[i]);
        }
    }

    /**
     * @notice Assigning tokens to a user and binding then to cards images
     * @param _player Player address
     * @param _cardsImagesIds Card Image ids array
     * @dev Reverts on non-existent card image id. Creates new tokens and assigns them to specified account.
     */
    function mintCardsToPlayer(address _player, uint256[] calldata _cardsImagesIds) external onlyOwner {
        for (uint256 i = 0; i < _cardsImagesIds.length; i++) {
            mintCard(_player, _cardsImagesIds[i]);
        }
    }

    // ============ Tokens getters ============

    /**
     * @dev Used in tokenURI standard function
     * @return Base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Getting the number of tokens
     * @return numberOfTokenIds - current number of existing token ids
     */
    function getNumberOfTokens() external view returns (uint256 numberOfTokenIds) {
        numberOfTokenIds = _tokenIds.current();
    }
}
