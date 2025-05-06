// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

/// @title The Blockchain Messenger
/// @notice Allows the contract owner to update a message on-chain
/// @dev Demonstrates basic access control and state changes in Solidity
contract TheBlockchainMessenger {

    /// @notice Tracks number of times the message was updated
    uint public changeCounter;

    /// @notice Address of the contract deployer (owner)
    address public owner;

    /// @notice The current message stored on-chain
    string public theMessage;

    /// @notice Initializes the contract setting the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Updates the message (only callable by owner)
    /// @param _newMessage The new message string to store
    function updateTheMessage(string memory _newMessage) public {
        require(msg.sender == owner, "Only the owner can update the message");
        theMessage = _newMessage;
        changeCounter++;
    }
}
