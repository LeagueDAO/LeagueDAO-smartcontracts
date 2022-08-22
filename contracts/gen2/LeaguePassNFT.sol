// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../gen1/interfaces/IMintableToken.sol";
import "./abstracts/common-parts/SeasonSync.sol";

/// @title NFT pass contract.
/// @dev Each address can have only 1 NFT, except whitelisted addresses
contract LeaguePassNFT is ERC721Upgradeable, SeasonSync {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    CountersUpgradeable.Counter private _tokenIds;

    /// @notice Token to be transferred to users after using NFT pass to join the league
    IMintableToken public dLeagueToken;

    /// @notice Address of contract leag pass payment will be sent to
    address public financialManager;

    /// @notice Amount of tokens to be provided for user after using NFT pass to join the league
    uint256 public dLeagAmount;

    /// @notice Deadline after NFT passes cannot be minted
    uint256 public saleDeadline;

    /// @notice Moment in time after which users can join the league
    uint256 public leagueStartDate;

    /// @notice Deadline to join the league
    uint256 public leagueJoinDeadline;

    /// @notice Switch to limit amount of tokens per account to 1
    bool public oneTokenPerAccount;

    /// @notice Can leag pass be used in different seasons?
    bool public isPassValidInAllSeasons;

    /// @notice Base for tokens URIs
    string public baseURI;

    /// @notice NFT pass id to season
    mapping(uint256 => uint256) public passIdToSeasonId;

    /// @notice Price for NFT pass in different ERC20 tokens
    mapping(address => uint256) public passPriceList;

    /// @notice Addresses allowed to have more than 1 pass
    mapping(address => bool) public whitelist;

    /// @notice Addresses allowed to join the division after deadline to fill last incomplete division
    mapping(address => bool) public isAllowedToFillLastDivision;

    /// @notice Addresses allowed to mint one free LeagPass (for marketing needs)
    mapping(address => bool) public isInMarketingList;

    /// @notice Addresses which have joined the league
    /// @dev True if user joined the league. Prevents users from joining twice.
    /// @dev Season Id => user address => is part of league in this season?
    mapping(uint256 => mapping(address => bool)) public leagueParticipants;

    ///______________________________EVENTS_______________________________
    event NewPassCreated(uint256 _tokenId, address _player, uint256 _price, address _token);
    event NewPlayerJoinedTheLeague(address _player, uint256 _nftPass);
    event PaymentTokenIsSet(address _token, uint256 _nftPrice);
    event DleagueTokenIsSet(address _addr);
    event DleagueTokenAmountIsSet(uint256 _amount);
    event WhitelistChanged(address _addr, bool _val);
    event IsAllowedToFillLastDivisionChanged(address _addr, bool _val);
    event IsInMarketingListChanged(address _addr, bool _val);
    event SaleDeadlineIsSet(uint256 _deadline);
    event BaseURLforNFTisSet(string _url);
    event LeagueStartDateIsSet(uint256 _date);
    event LeagueJoinDeadlineIsSet(uint256 _deadline);
    event FantasyLeagueContractIsSet(address _addr);
    event OneTokenPerAccountIsSet(bool _state);
    event FinancialManagerIsSet(address _address);

    function initialize(
        address _dLeagueToken,
        uint256 _dLeagAmount,
        string calldata _baseURI,
        uint256 _saleDeadline,
        uint256 _leagueStartDate,
        uint256 _leagueJoinDeadline,
        address[] calldata _tokenAddresses,
        uint256[] calldata _nftPrices
    ) external initializer {
        require(_tokenAddresses.length == _nftPrices.length, "Token and nft price length mismatch");
        __ERC721_init("LeaguePassNFT", "PNFT");
        init_SeasonSync_unchained(_msgSender());

        setDleagueToken(_dLeagueToken);
        setDleagueTokenAmount(_dLeagAmount);
        setBaseURI(_baseURI);
        setSaleDeadline(_saleDeadline);
        setLeagueStartDate(_leagueStartDate);
        setLeagueJoinDeadline(_leagueJoinDeadline);

        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            setPaymentToken(_tokenAddresses[i], _nftPrices[i]);
        }

        oneTokenPerAccount = true;
        isPassValidInAllSeasons = false;
    }

    /// @notice Mints League Pass NFT in exchange for ERC20 tokens
    /// @param _token contract of token you want to buy NFT with
    function mint(IERC20Upgradeable _token) external {
        require(block.timestamp <= saleDeadline, "Sale is over!");
        require(passPriceList[address(_token)] != 0, "This token is not acceptable");
        _token.safeTransferFrom(_msgSender(), financialManager, passPriceList[address(_token)]);
        _tokenIds.increment();
        _mint(_msgSender(), _tokenIds.current());
        passIdToSeasonId[_tokenIds.current()] = seasonId;
        emit NewPassCreated(_tokenIds.current(), _msgSender(), passPriceList[address(_token)], address(_token));
    }

    /// @notice Mints free League Pass NFT if user is in marketing list, then removes user from marketing list
    function marketingMint() external {
        require(isInMarketingList[_msgSender()], "You are not in marketing list");
        require(block.timestamp <= saleDeadline, "Sale is over!");
        isInMarketingList[_msgSender()] = false;
        _tokenIds.increment();
        _mint(_msgSender(), _tokenIds.current());
        passIdToSeasonId[_tokenIds.current()] = seasonId;
        emit NewPassCreated(_tokenIds.current(), _msgSender(), 0, address(0));
    }

    /// @notice Burn NFT pass and let you join the league
    /// @param _nftId Id of users NFT pass
    function joinTheLeague(uint256 _nftId) external {
        require(block.timestamp >= leagueStartDate, "League has not started yet");
        require(leagueParticipants[seasonId][_msgSender()] == false, "You have already joined the league");
        require(balanceOf(_msgSender()) >= 1, "You do not have the pass to join the league");
        require(_msgSender() == ownerOf(_nftId), "That isn't your pass");
        require(isPassValidInAllSeasons || passIdToSeasonId[_nftId] == seasonId, "Pass is not valid it this season");
        _validateDeadlineToJoinLeague(_msgSender());
        _burn(_nftId);
        leagueParticipants[seasonId][_msgSender()] = true;
        fantasyLeague.addUser(_msgSender());
        dLeagueToken.mint(_msgSender(), dLeagAmount);
        emit NewPlayerJoinedTheLeague(_msgSender(), _nftId);
    }

    /// @notice Gets number of NFT passes minted
    function getLeagPassCount() external view returns (uint256) {
        return _tokenIds.current();
    }

    /// @dev Check that user joins the league before deadline to join the league or if he is allowed to fill last division. If user is allowed to fill last division, then we check if current amount of users in FantasyLeague less then necessary to create full divisions.
    /// @notice Reverts is user can't join the league
    /// @param _user User address
    function _validateDeadlineToJoinLeague(address _user) internal view {
        if (block.timestamp < leagueJoinDeadline) return;
        require(isAllowedToFillLastDivision[_user], "You are not allowed to fill last division");
        require(fantasyLeague.getNumberOfUsers() % fantasyLeague.DIVISION_SIZE() != 0, "Last division is full");
    }

    /// @dev This function prevents users from having more than 1 NFT pass if they are not whitelisted.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (oneTokenPerAccount) {
            require(whitelist[to] == true || to == address(0) || balanceOf(to) == 0, "Only one pass per account!");
        }
    }

    //_______________________SETTERS____________________________

    /// @notice Adds payment method for NFT pass
    /// @param _token Address of ERC20 token contract
    /// @param _nftPrice Price for NFT pass in ERC20 tokens
    function setPaymentToken(address _token, uint256 _nftPrice) public onlyRole(DEFAULT_ADMIN_ROLE) {
        passPriceList[_token] = _nftPrice;
        emit PaymentTokenIsSet(_token, _nftPrice);
    }

    /// @notice Sets address of financial manager
    /// @param _address Address of financial manager contract
    function setFinancialManager(address _address) public onlyRole(DEFAULT_ADMIN_ROLE) {
        financialManager = _address;
        emit FinancialManagerIsSet(_address);
    }

    /// @notice Sets token address to be transferred to users after using NFT pass
    /// @param _token Address of token to be transferred to users after using NFT pass
    function setDleagueToken(address _token) public onlyRole(DEFAULT_ADMIN_ROLE) {
        dLeagueToken = IMintableToken(_token);
        emit DleagueTokenIsSet(_token);
    }

    /// @notice Sets amount of tokens to be transferred to users after using NFT pass
    /// @param _amount Amount of tokens to be transferred to users after using NFT pass
    function setDleagueTokenAmount(uint256 _amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        dLeagAmount = _amount;
        emit DleagueTokenAmountIsSet(_amount);
    }

    /// @notice Sets base URI for token URIs
    /// @param _baseURI Base URI string, base URI will be concatenated with the token ID and the resulted string would be tokenURI (look getter - tokenURI())
    function setBaseURI(string memory _baseURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = _baseURI;
        emit BaseURLforNFTisSet(_baseURI);
    }

    /// @notice Sets deadline for minting NFT pass
    /// @param _deadline Time after which minting NFT pass is not possible
    function setSaleDeadline(uint256 _deadline) public onlyRole(DEFAULT_ADMIN_ROLE) {
        saleDeadline = _deadline;
        emit SaleDeadlineIsSet(_deadline);
    }

    /// @notice Sets date after which users can join the league
    /// @param _date Date after which users can join the league
    function setLeagueStartDate(uint256 _date) public onlyRole(DEFAULT_ADMIN_ROLE) {
        leagueStartDate = _date;
        emit LeagueStartDateIsSet(_date);
    }

    /// @notice Sets deadline for joining the league
    /// @param _deadline Time after which joining the league is not possible
    function setLeagueJoinDeadline(uint256 _deadline) public onlyRole(DEFAULT_ADMIN_ROLE) {
        leagueJoinDeadline = _deadline;
        emit LeagueJoinDeadlineIsSet(_deadline);
    }

    /// @notice Sets address as whitelisted if _val is true
    /// @param _addr Address of the user
    /// @param _val If value is true address is whitelisted, if value is false address is not whitelisted
    function setWhitelistedAddr(address _addr, bool _val) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelist[_addr] = _val;
        emit WhitelistChanged(_addr, _val);
    }

    /// @notice Sets address as allowed to mint one free pass if _val is true
    /// @param _addr Address of the user
    /// @param _val If value is true address is allowed to mint one free pass and vice versa
    function setIsInMarketingList(address _addr, bool _val) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isInMarketingList[_addr] = _val;
        emit IsInMarketingListChanged(_addr, _val);
    }

    /// @notice Sets if user allowed to join division after deadline to fill last division
    /// @param _addr Address of the user
    /// @param _val If value is true user is allowed to join division after deadline and vice versa.
    function setIsAllowedToFillLastDivision(address _addr, bool _val) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isAllowedToFillLastDivision[_addr] = _val;
        emit IsAllowedToFillLastDivisionChanged(_addr, _val);
    }

    /// @notice Enable or halt limit for one token per account
    /// @param _state If value is true limit is on, if value is false limit is off
    function setOneTokenPerAccount(bool _state) external onlyRole(DEFAULT_ADMIN_ROLE) {
        oneTokenPerAccount = _state;
        emit OneTokenPerAccountIsSet(_state);
    }

    /**
     * @dev Used in tokenURI standard function
     * @return Base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /// @notice Return same URI for every existing token
    /// @param _tokenId Id of token
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _baseURI();
    }

    /// @dev Method is overwritten to resolve inheritance conflict
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) || AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}
