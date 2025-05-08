// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/// @title Smart Wallet to Accept and Withdraw ETH
/// @author You
/// @notice Allows only the owner to withdraw funds from the smart contract
contract SendWithdrawMoney {

    // Address of the owner (the account that deployed the contract)
    address public owner;

    // Total amount of ETH received through deposits
    uint public balanceReceived;

    // Event emitted when ETH is deposited into the contract
    event Deposited(address indexed sender, uint amount);

    // Event emitted when ETH is withdrawn from the contract
    event Withdrawn(address indexed to, uint amount);

    /// @notice Constructor sets the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Modifier to restrict function access to the contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    /// @notice Called when ETH is sent to the contract with empty calldata
    /// @dev Internally calls the `deposit` function to handle the received ETH
    receive() external payable {
        deposit();
    }

    /// @notice Called when ETH is sent to the contract with non-empty calldata or no matching function
    /// @dev Also forwards the received ETH to the `deposit` function
    fallback() external payable {
        deposit();
    }

    /// @notice Handles deposit of ETH and updates the total received balance
    /// @dev Emits a `Deposited` event upon successful deposit
    function deposit() public payable {
        balanceReceived += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Returns the current balance held by the contract
    /// @return The balance in wei
    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    /// @notice Allows the owner to withdraw all ETH from the contract to their own address
    /// @dev Emits a `Withdrawn` event after successful transfer
    function withdrawAll() public onlyOwner {
        uint balance = getContractBalance();
        payable(owner).transfer(balance);
        emit Withdrawn(owner, balance);
    }

    /// @notice Allows the owner to withdraw all ETH from the contract to a specified address
    /// @param to The address to which the ETH will be transferred
    /// @dev Emits a `Withdrawn` event after successful transfer
    function withdrawToAddress(address payable to) public onlyOwner {
        uint balance = getContractBalance();
        to.transfer(balance);
        emit Withdrawn(to, balance);
    }
}
