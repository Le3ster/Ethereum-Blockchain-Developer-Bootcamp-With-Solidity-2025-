const { expect } = require("chai");

describe("SampleWallet", function () {
    let wallet, owner, user, guardian1, guardian2, guardian3;

    beforeEach(async () => {
        // Retrieve signers: deployer (owner), user, and three guardians
        [owner, user, guardian1, guardian2, guardian3] = await ethers.getSigners();

        // Deploy the SampleWallet contract
        const Wallet = await ethers.getContractFactory("SampleWallet");
        wallet = await Wallet.connect(owner).deploy();
        await wallet.waitForDeployment();

        // Set an initial allowance of 1 ETH for the user
        await wallet.connect(owner).setAllowance(user.address, ethers.parseEther("1"));
    });

    it("allows owner to receive ether", async () => {
        // Send 2 ETH to the wallet
        await owner.sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });

        // Verify wallet balance is 2 ETH
        const balance = await ethers.provider.getBalance(wallet.target);
        expect(balance).to.equal(ethers.parseEther("2"));
    });

    it("allows permitted user to send funds", async () => {
        // Fund wallet with 2 ETH
        await owner.sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });

        const payload = "0x"; // No calldata

        // User transfers 0.5 ETH to owner
        await wallet.connect(user).transfer(owner.address, ethers.parseEther("0.5"), payload);

        // Allowance should reduce by 0.5 ETH
        expect(await wallet.allowance(user.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("prevents non-permitted user", async () => {
        const payload = "0x";

        // guardian1 has no allowance; transfer should revert
        await expect(
            wallet.connect(guardian1).transfer(user.address, ethers.parseEther("0.1"), payload)
        ).to.be.reverted;
    });

    it("allows guardians to change ownership", async () => {
        // Set three guardians
        await wallet.connect(owner).setGuardian(guardian1.address, true);
        await wallet.connect(owner).setGuardian(guardian2.address, true);
        await wallet.connect(owner).setGuardian(guardian3.address, true);

        const newOwner = user.address;

        // Three guardians propose the same new owner
        await wallet.connect(guardian1).proposeNewOwner(newOwner);
        await wallet.connect(guardian2).proposeNewOwner(newOwner);
        await wallet.connect(guardian3).proposeNewOwner(newOwner);

        // Ownership should change to the new owner
        expect(await wallet.owner()).to.equal(newOwner);
    });
});
