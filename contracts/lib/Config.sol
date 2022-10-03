// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Config {
    /// Fixed at deployment time
    struct Deployment {
        // Name of the NFT contract.
        string name;
        // Symbol of the NFT contract.
        string symbol;
        // The contract owner address. If you wish to own the contract, then set it as your wallet address.
        // This is also the wallet that can manage the contract on NFT marketplaces.
        address owner;
        // If true, tokens may be burned by owner. Cannot be changed later.
        bool tokensBurnable;
        // Add token counter for this collection
        address tokenCounter;
    }

    /// Updatable by admins and owner
    struct Runtime {
        // Metadata base URI for tokens, NFTs minted in this contract will have metadata URI of `baseURI` + `tokenID`.
        // Set this to reveal token metadata.
        string baseURI;
        // If true, the base URI of the NFTs minted in the specified contract can be updated after minting (token URIs
        // are not frozen on the contract level). This is useful for revealing NFTs after the drop. If false, all the
        // NFTs minted in this contract are frozen by default which means token URIs are non-updatable.
        bool metadataUpdatable;
        // If true, tokens may be transferred by owner. Default is true. Can be only changed to false.
        bool tokensTransferable;
        bool isRoyaltiesEnabled;
        // Secondary market royalties in basis points (100 bps = 1%)
        uint256 royaltiesBps;
        // Primary mint price
        uint256 primaryMintPrice;
        // Primary mint royalty percentage in basis point (100 bps = 1%)
        // uint256 primaryRoyaltiesBps;

        address treasuryAddress;
        // bool primaryRoyaltyEnabled;
        // uint256 primaryRoyaltyBps;
    }

    // Tiers can be managed from web3 API backend - only metadata changes for tiers
    struct TierConfig {
        uint256 id;
        string name;
        uint256 value;
    }

    struct PaymentSplitter {
        address[] receivers;
        uint256[] shares;
        address collection;
    }
    
    struct DAOConfig {
        string name;
        address owner;
        address treasury;
    }
}
