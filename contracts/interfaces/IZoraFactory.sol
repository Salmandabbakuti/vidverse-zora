// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IZoraFactory {
    function deploy(
        address payoutRecipient,
        address[] memory owners,
        string memory uri,
        string memory name,
        string memory symbol,
        address platformReferrer,
        address currency,
        int24 tickLower,
        uint256 orderSize
    ) external payable returns (address, uint256);
}
