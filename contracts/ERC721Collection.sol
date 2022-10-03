// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./lib/Base64.sol";
import "./lib/Config.sol";
import "./interface/ICounter.sol";

contract ERC721NFTCustom is Initializable, ERC721URIStorage, ERC2771Context {
    using Address for address;
    using Strings for uint256;

    uint16 constant ROYALTIES_BASIS = 10000;
    bool public metadataUpdatable;
    bool public tokensBurnable;
    bool public tokensTransferable;

    //  // Token name
    string private _name;

    //  // Token symbol
    string private _symbol;

    // Mapping of individually frozen tokens
    mapping(uint256 => bool) public freezeTokenUris;

    // Mapping from owner to list of owned token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // Array with all token ids, used for enumeration
    uint256[] private _allTokens;

    // Mapping from token id to position in the allTokens array
    mapping(uint256 => uint256) private _allTokensIndex;

    string public baseURI;

    bool public royaltiesEnabled;
    address public royaltiesAddress;
    uint256 public royaltiesBasisPoints;

    bytes32 public merkleRoot;
    uint256 internal primaryMintPrice;

    address private _tokenCounter;
    address private _treasury;

    address private deployer;
    address public forwarder;

    event PermanentURI(string _value, uint256 indexed _id); // https://docs.opensea.io/docs/metadata-standards
    event PermanentURIGlobal();
    event TokenMinted(uint256 tokenId, string tokenURI);
    event RoyaltyAddressUpdated(address royaltiesSplitter);

    constructor(
        address _minimalForwarder
    ) ERC2771Context(address(_minimalForwarder)) ERC721("Decir Contract", "NFT") {
        deployer = _msgSender();
        forwarder = address(_minimalForwarder);
    }

    function initialize(
        Config.Deployment memory deploymentConfig,
        Config.Runtime memory runtimeConfig,
        RoleAddresses[] memory rolesAddresses
    ) initializer public  {
        // This is overidden from base class
        _name = deploymentConfig.name;
        _symbol= deploymentConfig.symbol;
        // ERC721(deploymentConfig.name, deploymentConfig.symbol);

        royaltiesEnabled = runtimeConfig.isRoyaltiesEnabled;
        if (royaltiesEnabled) {

            royaltiesBasisPoints = runtimeConfig.royaltiesBps;
        }

        metadataUpdatable = runtimeConfig.metadataUpdatable;
        tokensBurnable = deploymentConfig.tokensBurnable;
        tokensTransferable = runtimeConfig.tokensTransferable;

        baseURI = runtimeConfig.baseURI;

        primaryMintPrice = runtimeConfig.primaryMintPrice;

        // Initialize counter address
        _tokenCounter = deploymentConfig.tokenCounter;
        _treasury = runtimeConfig.treasuryAddress;

        // Assign more extensive roles to other
        _initRoles(_msgSender(), rolesAddresses);
    }

    function setRoyaltyAddress(address _royaltySplitter) public {
        royaltiesAddress = _royaltySplitter;
        emit RoyaltyAddressUpdated(royaltiesAddress);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            interfaceId == type(IERC2981).interfaceId;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address, uint256)
    {
        return (
            royaltiesAddress,
            (royaltiesBasisPoints * salePrice) / ROYALTIES_BASIS
        );
    }

    function contractURI() external view returns (string memory) {
        // address _royaltiesAddress = address(0);
        if (royaltiesEnabled) {
            string memory json = Base64.encode(
                bytes(
                    string(
                        abi.encodePacked(
                            // solium-disable-next-line quotes
                            '{"seller_fee_basis_points": ', // solhint-disable-line quotes
                            royaltiesBasisPoints.toString(),
                            // solium-disable-next-line quotes
                            ', "fee_recipient": "', // solhint-disable-line quotes
                            uint256(uint160(royaltiesAddress)).toHexString(20),
                            // solium-disable-next-line quotes
                            '"}' // solhint-disable-line quotes
                        )
                    )
                )
            );

            string memory output = string(
                abi.encodePacked("data:application/json;base64,", json)
            );

            return output;
        }

        return string(abi.encodePacked("data:application/json;base64,", ""));
    }

    function _baseURI()
        internal
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        return baseURI;
    }

    // Counter implementation
    function mintToCaller(
        address caller,
        string memory tokenURI
    ) public onlyRole(MINT_ROLE) returns (uint256) {

        ICounter(_tokenCounter).increment();
        uint256 tokenId = ICounter(_tokenCounter).count();

        _safeMint(caller, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // TODO: revoke mint role to caller

        return tokenId;
    }


    function whitelistedMint(
        string memory tokenURI,
        bytes32[] calldata _merkleProof
    ) public payable returns (uint256) {
        require(
            checkValidity(_merkleProof),
            "MINT_ERROR: Should be whitelisted user."
        );

        require(
            msg.value >= primaryMintPrice,
            "ERROR: Price must be equal to primary mint price"
        );

        (bool os, ) = payable(_treasury).call{value: address(this).balance}("");

        require(os);
        ICounter(_tokenCounter).increment();
        uint256 tokenId = ICounter(_tokenCounter).count();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit TokenMinted(tokenId, tokenURI);
        return tokenId;
    }

    function updateTokenUri(
        uint256 _tokenId,
        string memory _tokenUri,
        bool _isFreezeTokenUri
    ) public onlyRole(UPDATE_TOKEN_ROLE) {
        require(
            _exists(_tokenId),
            "NFT: update URI query for nonexistent token"
        );
        require(metadataUpdatable, "NFT: Token uris are frozen globally");
        require(freezeTokenUris[_tokenId] != true, "NFT: Token is frozen");
        require(
            _isFreezeTokenUri || (bytes(_tokenUri).length != 0),
            "NFT: Either _tokenUri or _isFreezeTokenUri=true required"
        );

        if (bytes(_tokenUri).length != 0) {
            require(
                keccak256(bytes(tokenURI(_tokenId))) !=
                    keccak256(
                        bytes(string(abi.encodePacked(_baseURI(), _tokenUri)))
                    ),
                "NFT: New token URI is same as updated"
            );
            _setTokenURI(_tokenId, _tokenUri);
        }
        if (_isFreezeTokenUri) {
            freezeTokenUris[_tokenId] = true;
            emit PermanentURI(tokenURI(_tokenId), _tokenId);
        }
    }

    function transferByOwner(address _to, uint256 _tokenId)
        public
        onlyRole(TRANSFER_ROLE)
    {
        require(tokensTransferable, "NFT: Transfers by owner are disabled");
        _safeTransfer(_owner, _to, _tokenId, "");
    }

    function burn(uint256 _tokenId) public onlyRole(BURN_ROLE) {
        require(tokensBurnable, "NFT: tokens burning is disabled");
        require(_exists(_tokenId), "Burn for nonexistent token");
        require(
            ERC721.ownerOf(_tokenId) == _owner,
            "NFT: tokens may be burned by owner only"
        );
        _burn(_tokenId);
    }

    function update(
        Config.Runtime calldata newConfig,
        RoleAddresses[] memory rolesAddresses
    )
        public
        // bool isRevokeNFTPortPermissions
        onlyRole(UPDATE_CONTRACT_ROLE)
    {
        // If metadata is frozen, baseURI cannot be updated
        require(
            metadataUpdatable ||
                (keccak256(abi.encodePacked(newConfig.baseURI)) ==
                    keccak256(abi.encodePacked(baseURI))),
            "Metadata is frozen"
        );

        baseURI = newConfig.baseURI;
        royaltiesBasisPoints = newConfig.royaltiesBps;

        if (!newConfig.tokensTransferable) {
            tokensTransferable = false;
        }
        if (!newConfig.metadataUpdatable && metadataUpdatable) {
            metadataUpdatable = false;
            emit PermanentURIGlobal();
        }

        _updateRoles(rolesAddresses);

        // TODO: Revoke permission for factory contract - owned by CREABO

        // if (isRevokeNFTPortPermissions) {
        //     revokeNFTPortPermissions();
        // }
    }

    function totalSupply() public view virtual returns (uint256) {
        return _allTokens.length;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        virtual
        returns (uint256)
    {
        require(index < balanceOf(owner), "ERC721: owner index out of bounds");
        return _ownedTokens[owner][index];
    }

    function tokenByIndex(uint256 index) public view virtual returns (uint256) {
        require(index < totalSupply(), "ERC721: global index out of bounds");
        return _allTokens[index];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _ownedTokensIndex[tokenId] = length;
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    /**
     * Note that
     * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     */
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId)
        private
    {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete _ownedTokensIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
        // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
        // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
        uint256 lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        _allTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(
            tokensTransferable,
            "Error: This token cannot be bought or sold."
        );
        super.transferFrom(from, to, tokenId);
    }

    // This function is used to verify whitelisting of users
    function checkValidity(bytes32[] calldata _merkleProof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "Whitelist: Address not whitelisted for minting"
        );
        return true;
    }

    function updateMerkleRoot(bytes32 _merkleRoot) public onlyRole(ADMIN_ROLE) {
        merkleRoot = _merkleRoot;

        // This should be frozen after updating the root

        // TODO: event for merkleRoot
    }

    // override _msgSender() from context here
    function _msgSender() internal view override(Context, ERC2771Context) returns(address) {
        return ERC2771Context._msgSender();
    }

    // TODO: Check if this is call data or memory
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}
