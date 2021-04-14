// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title ItargoNFT
 * ItargoNFT - a contract that serves as a bank. 
 */
contract ItargoNFT is Initializable, ERC721URIStorageUpgradeable, OwnableUpgradeable {
    /**
     * @dev To use upgradeable patterns, do not set initial values for variables.
     */
    function initialize(string memory name, string memory symbol) public initializer {
        __ItargoNFT_init(name, symbol);
    }
    
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // To track the number of internally minted tokens.
    // There is no problem even if the token ID and this number are not one-on-one.
    CountersUpgradeable.Counter private _tokenIdTracker;

    // Mapping from token ID to the creator's address.
    mapping(uint256 => address) private _tokenCreators;

    // Mapping from token ID to the doc.
    mapping(uint256 => string) private _tokenDocs;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function __ItargoNFT_init(string memory name_, string memory symbol_) internal initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained(name_, symbol_);
        __ERC721URIStorage_init_unchained();
        __Ownable_init_unchained();
        __ItargoNFT_init_unchained(name_, symbol_);
    }

    function __ItargoNFT_init_unchained(string memory name_, string memory symbol_) internal initializer {
    }

    /**
     * @dev Mints `tokenId` for creator, set `tokenURI`, and transfers `tokenId` from `creator` to `receiver`.
     * Eliminates the burden of minting costs to the creator.
     * 
     * Requirements:
     *
     * - the caller must be the owner.
     *
     * Emits two {Transfer} events.
     *
     * See {ERC721Upgradeable-_mint, safeTransferFrom. ERC721URIStorageUpgradeable-_setTokenURI}.
     */
    function lazyMint(
        address creator,
        address receiver,
        uint256 tokenId,
        string memory _tokenURI
    )
        external
        onlyOwner
    {
        // We separate into creator, buyer logic to generate two transactions.
        // Create.
        _mint(creator, tokenId);
        _setTokenCreator(creator, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Transfer.
        safeTransferFrom(creator, receiver, tokenId);

        _tokenIdTracker.increment();
    }

    /**
     * @dev Common mint function. Creates a new token for `creator`. 
     * If the offchain service generates a token ID as an random number, 
     * the token ID and _tokenIdTracker.current() do not match. 
     * Therefore, in mint function, the token ID is received as a parameter.
     * 
     * See {ERC721Upgradeable-_mint}.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     *
     * Emits a {IERC721-Transfer} event.
     */
    function mint(address creator, uint256 tokenId) external onlyOwner {
        _mint(creator, tokenId);
        _setTokenCreator(creator, tokenId);

        _tokenIdTracker.increment();
    }

    /**
     * @dev Sets `_tokenDoc` as the tokenDoc of `tokenId`.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     * - `tokenId` must exist.
     */
    function setTokenDocs(string memory doc, uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "ItargoNFT: doc set of nonexistent token");
        _tokenDocs[tokenId] = doc;
    }

    /**
     * @dev Gets the doc of the token.
     * @param tokenId uint256 ID of the token.
     * @return doc of the token id. 
     */
    function docOf(uint256 tokenId) external view returns (string memory) {
        return _tokenDocs[tokenId];
    }

    /**
     * @dev Gets the creator of the token.
     * @param tokenId uint256 ID of the token.
     * @return address of the creator.
     */
    function creatorOf(uint256 tokenId) external view returns (address) {
        return _tokenCreators[tokenId];
    }

    /**
     * @dev Gets the current number of the Itargo NFT token.
     * This value is the total number of tokens currently minted because `burn` function is not implemented.
     * There is no problem even if the token ID and this number are not one-on-one.
     */
    function count() public view returns (uint256) {
        return _tokenIdTracker.current();
    }

    /**
     * @dev Sets `_tokenCreator` as the creator of `tokenId`.
     * private function.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenCreator(address creator, uint256 tokenId) private {
        require(_exists(tokenId), "ItargoNFT: creator set of nonexistent token");
        _tokenCreators[tokenId] = creator;
    }
}