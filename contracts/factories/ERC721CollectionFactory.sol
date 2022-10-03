//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "../ERC721Collection.sol";
import "../lib/Config.sol";
import "../lib/GranularRoles.sol";

contract ERC721CollectionFactory is ERC2771Context {
    address public impl;
   
    event NewCollection(address _clone);

    constructor(
        address _impl, 
        MinimalForwarder _minimalForwarder
    ) ERC2771Context(address(_minimalForwarder)) {
        impl = _impl;
    }

    function cloneContract(
        Config.Deployment memory  deploymentConfig,
        Config.Runtime memory runtimeConfig,
        GranularRoles.RoleAddresses[] memory rolesAddresses
    ) external returns(address instance) {
        instance = Clones.clone(impl);
        ERC721NFTCustom(instance).initialize(deploymentConfig, runtimeConfig, rolesAddresses);
        emit NewCollection(instance);
        return instance;
    }
}