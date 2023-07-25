const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PromoCode", function () {
  let PromoCodeContract;
  let promoCodeContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    PromoCodeContract = await ethers.getContractFactory("PromoCode");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    promoCodeContract = await PromoCodeContract.deploy();
    await promoCodeContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await promoCodeContract.admin()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should create a new promo code", async function () {
      await promoCodeContract.connect(owner).assignNewPromoCode("NEWCODE");
      expect(await promoCodeContract.currentCode()).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("NEWCODE")));
    });

    it("Should not create a new promo code if not admin", async function () {
      await expect(promoCodeContract.connect(addr1).assignNewPromoCode("NEWCODE")).to.be.revertedWith("Only admin can call this function.");
    });

    it("Should not create a new promo code if code is empty", async function () {
      await expect(promoCodeContract.connect(owner).assignNewPromoCode("")).to.be.revertedWith("Promo code cannot be empty.");
    });

    it("Should allow users to buy a promo code", async function () {
      await promoCodeContract.connect(owner).assignNewPromoCode("NEWCODE");
      await promoCodeContract.connect(addr1).buyPromoCode({ value: ethers.utils.parseEther("0.01") });
      expect(await promoCodeContract.connect(addr1).getBoughtPromoCode()).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("NEWCODE")));
    });

    it("Should not allow users to buy a promo code if they don't pay enough", async function () {
      await promoCodeContract.connect(owner).assignNewPromoCode("NEWCODE");
      await expect(promoCodeContract.connect(addr1).buyPromoCode({ value: ethers.utils.parseEther("0.009") })).to.be.revertedWith("You must pay at least 0.01 ETH to buy a promo code.");
    });

    it("Should not allow users to get a promo code if they haven't bought one", async function () {
      await expect(promoCodeContract.connect(addr1).getBoughtPromoCode()).to.be.revertedWith("You haven't bought a promo code yet.");
    });

    it("Should allow the admin to delete the contract", async function () {
      await promoCodeContract.connect(owner).deleteContract();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(await ethers.provider.getCode(promoCodeContract.address)).to.equal('0x');
    });

    it("Should not allow non-admins to delete the contract", async function () {
      await expect(promoCodeContract.connect(addr1).deleteContract()).to.be.revertedWith("Only admin can call this function.");
    });
  });
});