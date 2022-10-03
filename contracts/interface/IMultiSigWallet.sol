// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMultiSigWallet {
    function initialize(address[] memory, uint256) external;

    function withdraw(
        address,
        uint256,
        bytes memory
    ) external;

    function confirmTransaction(uint256) external;

    function executeTransactoin(uint256) external;

    function revokeTransaction(uint256) external;
}
