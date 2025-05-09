// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/// @title Smart Wallet with Allowance and Guardian Ownership Recovery
contract SampleWallet {

    address payable public owner; // Current owner of the wallet

    mapping(address => uint) public allowance; // Spending limit per address
    mapping(address => bool) public isAllowedToSend; // Tracks if address is allowed to send funds

    mapping(address => bool) public guardian; // Guardians who can propose ownership change
    address payable public nextOwner; // Proposed next owner by guardians
    uint public guardiansResetCount; // Number of guardians that have confirmed ownership reset
    uint public constant confirmationsFromGuardiansForReset = 3; // Required confirmations

    constructor() {
        owner = payable(msg.sender); // Initialize contract owner
    }

    /// @notice Allows a guardian to propose a new owner
    /// @param newOwner The address of the proposed new owner
    function proposeNewOwner(address payable newOwner) public {
        require(guardian[msg.sender], "Not a guardian");

        if (nextOwner != newOwner) {
            nextOwner = newOwner;
            guardiansResetCount = 0; // Reset count if a different owner is proposed
        }

        guardiansResetCount++;

        if (guardiansResetCount >= confirmationsFromGuardiansForReset) {
            owner = nextOwner; // Ownership transfer
            nextOwner = payable(address(0)); // Clear proposal
        }
    }

    /// @notice Set allowance for an address
    /// @param _from The address receiving the allowance
    /// @param _amount The allowed amount in wei
    function setAllowance(address _from, uint _amount) public {
        require(msg.sender == owner, "Only owner");
        allowance[_from] = _amount;
        isAllowedToSend[_from] = true;
    }

    /// @notice Assign or revoke guardian role to an address
    /// @param _guardian The address to modify
    /// @param _isGuardian Boolean indicating if address is guardian
    function setGuardian(address _guardian, bool _isGuardian) public {
        require(msg.sender == owner, "Only owner");
        guardian[_guardian] = _isGuardian;
    }

    /// @notice Revoke send permission from an address
    /// @param _from The address to be denied
    function denySending(address _from) public {
        require(msg.sender == owner, "Only owner");
        isAllowedToSend[_from] = false;
    }

    /// @notice Transfer funds with optional payload execution
    /// @param _to Destination address
    /// @param _amount Amount to send in wei
    /// @param payload Optional data to call
    /// @return returnData Return data from call
    function transfer(address payable _to, uint _amount, bytes memory payload) public returns (bytes memory) {
        require(_amount <= address(this).balance, "Insufficient balance");

        if (msg.sender != owner) {
            require(isAllowedToSend[msg.sender], "Not allowed");
            require(allowance[msg.sender] >= _amount, "Allowance exceeded");
            allowance[msg.sender] -= _amount;
        }

        (bool success, bytes memory returnData) = _to.call{value: _amount}(payload);
        require(success, "Transaction failed");
        return returnData;
    }

    /// @notice Allow contract to receive ether
    receive() external payable {}
}
