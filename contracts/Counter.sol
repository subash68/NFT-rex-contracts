// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

contract Counter  is ERC2771Context {
    uint256 public count;

    constructor(MinimalForwarder _minimalForwarder)  ERC2771Context(address(_minimalForwarder)) {}

    function increment() external {
        count += 1;
    }
}