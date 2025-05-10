const { expect } = require("chai");

describe("TokenSale", function () {
    let token, sale, deployer, buyer;

    beforeEach(async function () {
        [deployer, buyer] = await ethers.getSigners();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        token = await ERC20Mock.deploy("MockToken", "MTK", 18);
        await token.waitForDeployment();

        const TokenSale = await ethers.getContractFactory("TokenSale");
        sale = await TokenSale.deploy(token.target);
        await sale.waitForDeployment();

        // Send tokens to the sale contract
        await token.transfer(sale.target, ethers.parseUnits("1000", 18));
    });

    it("should allow user to purchase tokens and receive refund", async function () {
        const buyAmount = ethers.parseEther("3.5");

        const balanceBefore = await ethers.provider.getBalance(buyer.address);
        const tx = await sale.connect(buyer).purchase({ value: buyAmount });
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        const balanceAfter = await ethers.provider.getBalance(buyer.address);
        const refund = ethers.parseEther("0.5");

        expect(await token.balanceOf(buyer.address)).to.equal(ethers.parseUnits("3", 18));
        expect(balanceBefore - balanceAfter).to.be.closeTo(buyAmount - refund + gasUsed, ethers.parseEther("0.01"));
    });

    it("should revert if not enough ETH sent", async function () {
        await expect(sale.connect(buyer).purchase({ value: ethers.parseEther("0.5") }))
            .to.be.revertedWith("Not enough money sent");
    });
});
