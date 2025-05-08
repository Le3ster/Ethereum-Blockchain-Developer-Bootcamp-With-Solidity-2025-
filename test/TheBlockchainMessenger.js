// Import Chai's `expect` assertion style for use in tests
const { expect } = require("chai");

// Define the test suite for the TheBlockchainMessenger contract
describe("TheBlockchainMessenger", function () {
    let contract;
    let owner, otherUser;

    // Deploy a new instance of the contract before each test
    beforeEach(async function () {
        // Retrieve signers provided by Hardhat: owner and a secondary user
        [owner, otherUser] = await ethers.getSigners();

        // Get the contract factory and deploy the contract using the owner account
        const Messenger = await ethers.getContractFactory("TheBlockchainMessenger");
        contract = await Messenger.connect(owner).deploy();

        // Ensure deployment is completed (required with recent Hardhat versions)
        await contract.waitForDeployment();
    });

    // Test Case 1: Owner should be correctly set to the deployer
    it("should set the deployer as the owner", async function () {
        // Verify that the contract's owner matches the deployer's address
        expect(await contract.owner()).to.equal(owner.address);
    });

    // Test Case 2: Initial state of the message and change counter should be empty/zero
    it("should start with empty message and zero changeCounter", async function () {
        // Check that the message is an empty string
        expect(await contract.theMessage()).to.equal("");

        // Check that the change counter is initialised to 0
        expect(await contract.changeCounter()).to.equal(0);
    });

    // Test Case 3: Owner should be able to update the message and increment the counter
    it("should allow owner to update the message", async function () {
        // Call the function to update the message
        await contract.updateTheMessage("Hello Blockchain");

        // Verify that the new message is correctly stored
        expect(await contract.theMessage()).to.equal("Hello Blockchain");

        // Verify that the change counter was incremented
        expect(await contract.changeCounter()).to.equal(1);
    });

    // Test Case 4: Non-owner should be restricted from updating the message
    it("should revert when non-owner tries to update message", async function () {
        // Attempt to update the message using a non-owner account
        await expect(
            contract.connect(otherUser).updateTheMessage("Hacker attempt")
        ).to.be.revertedWith("Only the owner can update the message");
    });
});
