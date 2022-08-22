// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../../gen1/interfaces/INomoNFT.sol";
import "./../abstracts/common-parts/SeasonSyncNonupgradeable.sol";

/// @title ALOMOST NOT A MOCK (contract witout gen1 NOMO contract)
/// @dev One division, 1 Gen2PlayerToken derived from genesis NFT image.
contract Gen2PlayerTokenMock3 is ERC721, SeasonSyncNonupgradeable {
    using Counters for Counters.Counter;

    // _______________ Storage _______________

    Counters.Counter private _tokenIds;

    // INomoNFT public nomoNFT;

    /// @notice Image id to all NFT ids
    mapping(uint256 => uint256[]) public imageIdToAllNftIds;

    /// @notice ImageId => nft Id => nft index in imageIdToAllNftIds[]
    /// @dev Auxilary mapping for deleting elements from imageIdToAllNftIds
    mapping(uint256 => mapping(uint256 => uint256)) public nftIndexInImageToAllNftIdsPlusOne;

    /// @notice NFT id => division id
    mapping(uint256 => uint256) public nftIdToDivisionId;

    /// @notice NFT id => image id
    mapping(uint256 => uint256) public nftIdToImageId;

    /// @notice NFT id => season id
    mapping(uint256 => uint256) public nftIdToSeasonId;

    /// @notice season id => divison id => image id => bool
    /// @dev Prevents having 2 NFT of the same image in the same division
    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) public isImageInDivision;

    /// @notice Extra space for future needs
    /// @dev NFT id to array of strings
    mapping(uint256 => string[]) public nftIdToData;

    /// @notice Addresses allowed to transfer tokens
    mapping(address => bool) public transferAllowlist;

    /*
     * Stores disabled position codes, it is not possible to mint players with such a position.
     * Position code => is disabled position code.
     */
    mapping(uint256 => bool) public isDisabledPosition;

    // MOCK STORAGE
    mapping(uint256 => uint256) public tokenPositions;

    // _______________ Events _______________

    event PositionMintDisablingSet(uint256 _position, bool _isDisabled);

    event GenesisNFTisSet(address _contract);
    event FantasyLeagueisSet(address _contract);
    event Gen2PlayerTokenIsMinted(
        uint256 _season,
        uint256 _playerImageId,
        uint256 _divisionId,
        uint256 _gen2PlayerTokenId,
        address _user
    );
    event Gen2PlayerTokenIsBurnt(
        uint256 _season,
        uint256 _playerImageId,
        uint256 _divisionId,
        uint256 _gen2PlayerTokenId,
        address _user
    );
    event TransferAllowListAddrStateIsChanged(address _addr, bool _state);

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // _______________ Constructor _______________

    /// @notice Contract constructor
    constructor() ERC721("LeagueDAO: Nomo Gen2 Player Token", "Gen2") SeasonSyncNonupgradeable(_msgSender()) {
        _grantRole(MINTER_ROLE, _msgSender());

        setTransferAllowListAddr(address(0), true);
    }

    // _______________ External functions _______________

    /**
     * Disables a `_position`, means it is not possible to mint players with such a position.
     *
     * @param _position A position code. See NomoNFT.sol to get better understanding of position codes.
     */
    function setPositionMintDisabling(uint256 _position, bool _isDisabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_position != 0, "Zero position code");

        isDisabledPosition[_position] = _isDisabled;
        emit PositionMintDisablingSet(_position, _isDisabled);
    }

    /// @notice Mints gen 2 player token
    /// @param _playerImageId Id of player image
    /// @param _divisionId Id of division to which NFT belongs to
    /// @param _user Address to which NFT will be minted to
    /// @return _tokenId uint256 Id of minted NFT
    function mint(
        uint256 _playerImageId,
        uint256 _divisionId,
        address _user
    ) external returns (uint256 _tokenId) {
        _tokenIds.increment();
        _tokenId = _tokenIds.current();

        // require(nomoNFT.cardImageToExistence(_playerImageId), "Impossible to create NFT from nonexisting image");
        // require(
        //     !isImageInDivision[seasonId][_divisionId][_playerImageId],
        //     "Impossible to have two NFT from one image in one division"
        // );
        // // Check that a position code of the token is not disabled
        // (, , , , uint256 position, , , , ) = nomoNFT.getCardImage(_playerImageId);
        // require(!isDisabledPosition[position], "Disabled position");

        _mint(_user, _tokenId);
        isImageInDivision[seasonId][_divisionId][_playerImageId] = true;
        nftIdToSeasonId[_tokenId] = seasonId; // NFT has a season
        nftIdToDivisionId[_tokenId] = _divisionId; // NFT belongs to division
        nftIdToImageId[_tokenId] = _playerImageId; // NFT has reference to images
        imageIdToAllNftIds[_playerImageId].push(_tokenId); // Store all players NFT derived from images
        nftIndexInImageToAllNftIdsPlusOne[_playerImageId][_tokenId] = imageIdToAllNftIds[_playerImageId].length;
        emit Gen2PlayerTokenIsMinted(seasonId, _playerImageId, _divisionId, _tokenId, _user);
    }

    /// @notice Whitelisted addresses allowed to burn tokens
    /// @param _tokenId Id of token to burn
    function burn(uint256 _tokenId) external {
        require(transferAllowlist[_msgSender()], "Address not allowed to burn nft");
        address owner = ownerOf(_tokenId);
        uint256 nftDivision = nftIdToDivisionId[_tokenId];
        uint256 nftSeason = nftIdToSeasonId[_tokenId];
        uint256 imageId = nftIdToImageId[_tokenId];
        _burn(_tokenId);

        // Removal of burnt NFT ID from `imageIdToAllNftIds`
        uint256[] storage nftIds = imageIdToAllNftIds[imageId];
        nftIds[nftIndexInImageToAllNftIdsPlusOne[imageId][_tokenId] - 1] = nftIds[nftIds.length - 1];
        nftIds.pop();

        delete nftIndexInImageToAllNftIdsPlusOne[imageId][_tokenId];
        delete nftIdToDivisionId[_tokenId];
        delete nftIdToImageId[_tokenId];
        delete nftIdToSeasonId[_tokenId];
        delete nftIdToData[_tokenId];
        delete isImageInDivision[nftSeason][nftDivision][imageId];
        emit Gen2PlayerTokenIsBurnt(seasonId, imageId, nftDivision, _tokenId, owner);
    }

    // /// @notice Sets genesis nft contract address
    // /// @param _contract Genesis NFT contract
    // function setGenesisNFT(INomoNFT _contract) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //     nomoNFT = _contract;
    //     emit GenesisNFTisSet(address(_contract));
    // }

    /// @notice Sets address permission to recive and send tokens
    /// @param _addr Address
    /// @param _state True - address is allowed to transfer and recive token, false - not allowed
    function setTransferAllowListAddr(address _addr, bool _state) public onlyRole(DEFAULT_ADMIN_ROLE) {
        transferAllowlist[_addr] = _state;
        emit TransferAllowListAddrStateIsChanged(_addr, _state);
    }

    // /**
    //  * @notice Returns Gen2 player token's position code
    //  * @dev Position code taken from the nomoNFT contract
    //  * @param _tokenId Gen2PlayerToken id which position you need to know
    //  * @return position Integer position code (look NomoNFT to get better understanding of position codes and
    //  * CardImages)
    //  */
    // function getTokenPosition(uint256 _tokenId) external view returns (uint256 position) {
    //     (, , , , position, , , , ) = nomoNFT.getCardImage(nftIdToImageId[_tokenId]);
    // }

    // _______________ Public functions _______________

    /// @dev Method is overwritten to resolve inheritance conflict
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }

    // _______________ Internal functions _______________

    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal virtual override {
    //     super._beforeTokenTransfer(from, to, tokenId);

    //     if (!transferAllowlist[from] && !transferAllowlist[to]) revert("Address not allowed to send or recive tokens");
    // }

    //_________________________MOCK FUNCTIONS ___________________________
    function setTokenPosition(uint256 _tokenId, uint256 _position) external {
        tokenPositions[_tokenId] = _position;
    }

    function getTokenPosition(uint256 _tokenId) external view returns (uint256 position) {
        return tokenPositions[_tokenId];
    }
}
