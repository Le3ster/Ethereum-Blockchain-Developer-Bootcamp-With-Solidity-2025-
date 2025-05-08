// Import Chai's expect assertion style for testing
const { expect } = require("chai");

// Describe the test suite for the SendWithdrawMoney contract
describe("SendWithdrawMoney", function () {
    let contract, owner, user;

    // Deploy a fresh instance of the contract before each test
    beforeEach(async () => {
        // Retrieve the default signers provided by Hardhat
        [owner, user] = await ethers.getSigners();

        // Load the contract factory for SendWithdrawMoney
        const Contract = await ethers.getContractFactory("SendWithdrawMoney");

        // Deploy the contract using the owner account
        contract = await Contract.connect(owner).deploy();

        // Ensure the deployment is fully processed
        await contract.waitForDeployment();
    });

    // Test case: The contract should accept incoming ETH deposits
    it("should accept deposits", async () => {
        // Send 1 ETH to the contract's address from the owner
        await owner.sendTransaction({ to: contract.target, value: ethers.parseEther("1.0") });

        // Fetch the balance held by the contract
        const balance = await contract.getContractBalance();

        // Assert that the contract's balance matches the deposited amount
        expect(balance).to.equal(ethers.parseEther("1.0"));
    });

    // Test case: The balanceReceived state variable should correctly track total deposits
    it("should track balanceReceived", async () => {
        // Perform a deposit of 0.5 ETH via the contract's `deposit` function
        await contract.connect(owner).deposit({ value: ethers.parseEther("0.5") });

        // Verify that balanceReceived equals the deposited amount
        expect(await contract.balanceReceived()).to.equal(ethers.parseEther("0.5"));
    });

    // Test case: The owner should be able to withdraw all funds from the contract
    it("should withdraw all to owner", async () => {
        // First deposit 1 ETH into the contract
        await contract.connect(owner).deposit({ value: ethers.parseEther("1") });

        // Record the owner's ETH balance before withdrawal
        const before = await ethers.provider.getBalance(owner.address);

        // Trigger withdrawal of all ETH by the owner
        const tx = await contract.connect(owner).withdrawAll();
        await tx.wait();

        // Record the owner's ETH balance after withdrawal
        const after = await ethers.provider.getBalance(owner.address);

        // Assert that the balance has increased (ignoring gas costs for simplicity)
        expect(after).to.be.gt(before);
    });

    // Test case: Withdrawal should fail if attempted by a non-owner
    it("should revert if non-owner tries to withdraw", async () => {
        // Attempt to withdraw from a non-owner account and expect a revert
        await expect(contract.connect(user).withdrawAll()).to.be.revertedWith("Not the contract owner");
    });
});
