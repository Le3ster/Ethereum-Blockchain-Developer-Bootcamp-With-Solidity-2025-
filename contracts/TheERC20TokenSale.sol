// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IERC20 {
    function transfer(address to, uint amount) external;
    function decimals() external view returns(uint);
}

/// @title ERC20 Token Sale Contract
/// @notice Allows users to buy ERC20 tokens at a fixed rate with ETH
contract TokenSale {
    uint public constant tokenPriceInWei = 1 ether;

    IERC20 public token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    /// @notice Buy tokens with ETH, refunding any leftover ETH
    function purchase() public payable {
        require(msg.value >= tokenPriceInWei, "Not enough money sent");

        uint tokensToTransfer = msg.value / tokenPriceInWei;
        uint remainder = msg.value - tokensToTransfer * tokenPriceInWei;

        token.transfer(msg.sender, tokensToTransfer * (10 ** token.decimals()));

        if (remainder > 0) {
            payable(msg.sender).transfer(remainder);
        }
    }
}
