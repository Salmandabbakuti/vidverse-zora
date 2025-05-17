// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IZoraFactory {
    function deploy(
        address payoutRecipient,
        address[] memory owners,
        string memory uri,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        uint256 orderSize
    ) external payable returns (address, uint256);
}
