const { expect } = require("chai");

describe("TheBlockchainMessenger", function () {
    let contract;
    let owner, otherUser;

    beforeEach(async function () {
        [owner, otherUser] = await ethers.getSigners();

        const Messenger = await ethers.getContractFactory("TheBlockchainMessenger");
        contract = await Messenger.connect(owner).deploy(); // correct deploy
        await contract.waitForDeployment(); // <-- use this in latest Hardhat/Ethers
    });


    it("should set the deployer as the owner", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("should start with empty message and zero changeCounter", async function () {
        expect(await contract.theMessage()).to.equal("");
        expect(await contract.changeCounter()).to.equal(0);
    });

    it("should allow owner to update the message", async function () {
        await contract.updateTheMessage("Hello Blockchain");
        expect(await contract.theMessage()).to.equal("Hello Blockchain");
        expect(await contract.changeCounter()).to.equal(1);
    });

    it("should revert when non-owner tries to update message", async function () {
        await expect(
            contract.connect(otherUser).updateTheMessage("Hacker attempt")
        ).to.be.revertedWith("Only the owner can update the message");
    });
});
