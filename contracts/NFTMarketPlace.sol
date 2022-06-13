// SPDX-License-Provider: MIT
pragma solidity ^0.8.7;

// Imports
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Errors
error NFTMarketPlace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTMarketPlace__ItemNotForSale(address nftAddress, uint256 tokenId);
error NFTMarketPlace__NotListed(address nftAddress, uint256 tokenId);
error NFTMarketPlace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketPlace__NoProceeds();
error NFTMarketPlace__NotOwner();
error NFTMarketPlace__NotApprovedForMarketplace();
error NFTMarketPlace__PriceMustBeAboveZero();

contract NFTMarketPlace is ReentrancyGuard {
    // Custom Types
    struct Listing {
        uint256 price;
        address seller;
    }

    // Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    ///////////////////////
    // Getter Functions //
    /////////////////////

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
