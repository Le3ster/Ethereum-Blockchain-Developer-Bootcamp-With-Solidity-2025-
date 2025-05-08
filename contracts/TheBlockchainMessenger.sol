// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

/// @title The Blockchain Messenger
/// @notice Allows the contract owner to update a message on-chain
/// @dev Demonstrates basic access control and state changes in Solidity
contract TheBlockchainMessenger {

    /// @notice Tracks the number of times the message has been updated
    uint public changeCounter;

    /// @notice Stores the address of the contract deployer (owner)
    address public owner;

    /// @notice Holds the current message stored on-chain
    string public theMessage;

    /// @notice Constructor that sets the deployer as the initial owner of the contract
    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    /// @notice Updates the on-chain message to a new value
    /// @dev This function is restricted to the owner of the contract
    /// @param _newMessage The new message to be stored on the blockchain
    function updateTheMessage(string memory _newMessage) public {
        require(msg.sender == owner, "Only the owner can update the message");
        theMessage = _newMessage; // Update the message state variable
        changeCounter++; // Increment the update counter
    }
}
