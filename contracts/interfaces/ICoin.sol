// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICoin {
    function balanceOf(address account) external view returns (uint256);

    function setContractURI(string memory newURI) external;

    function setPayoutRecipient(address newPayoutRecipient) external;

    function buy(
        address recipient,
        uint256 orderSize,
        uint256 minAmountOut,
        uint160 sqrtPriceLimitX96,
        address tradeReferrer
    ) external payable returns (uint256, uint256);

    function sell(
        address recipient,
        uint256 orderSize,
        uint256 minAmountOut,
        uint160 sqrtPriceLimitX96,
        address tradeReferrer
    ) external returns (uint256, uint256);

    function tokenURI() external view returns (string memory);

    function platformReferrer() external view returns (address);
}
