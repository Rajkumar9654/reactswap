import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import {ReactToken, ReactToken__factory} from "../types";

describe("ReactToken", function () {
  before(async function () {
    this.ReactToken = (await ethers.getContractFactory(
        'ReactToken'
    )) as ReactToken__factory
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.react = (await upgrades.deployProxy(this.ReactToken, {
      kind: 'uups',
    })) as ReactToken

    await this.react.deployed()
    this.react.grantRole(ethers.utils.id('MINTER_ROLE'), this.alice.address)
  })

  it("should have correct name and symbol and decimal", async function () {
    const name = await this.react.name()
    const symbol = await this.react.symbol()
    const decimals = await this.react.decimals()
    expect(name, "ReactToken")
    expect(symbol, "REACT")
    expect(decimals, "18")
  })

  it("should only allow owner to mint token", async function () {
    await this.react.mint(this.alice.address, "100")
    await this.react.mint(this.bob.address, "1000")
    await expect(this.react.connect(this.bob).mint(this.carol.address, "1000", { from: this.bob.address })).to.be.revertedWith(
      "is missing role"
    )
    const totalSupply = await this.react.totalSupply()
    const aliceBal = await this.react.balanceOf(this.alice.address)
    const bobBal = await this.react.balanceOf(this.bob.address)
    const carolBal = await this.react.balanceOf(this.carol.address)
    expect(totalSupply).to.equal("1100")
    expect(aliceBal).to.equal("100")
    expect(bobBal).to.equal("1000")
    expect(carolBal).to.equal("0")
  })

  it("should supply token transfers properly", async function () {
    await this.react.mint(this.alice.address, "100")
    await this.react.mint(this.bob.address, "1000")
    await this.react.transfer(this.carol.address, "10")
    await this.react.connect(this.bob).transfer(this.carol.address, "100", {
      from: this.bob.address,
    })
    const totalSupply = await this.react.totalSupply()
    const aliceBal = await this.react.balanceOf(this.alice.address)
    const bobBal = await this.react.balanceOf(this.bob.address)
    const carolBal = await this.react.balanceOf(this.carol.address)
    expect(totalSupply, "1100")
    expect(aliceBal, "90")
    expect(bobBal, "900")
    expect(carolBal, "110")
  })

  it("should fail if you try to do bad transfers", async function () {
    await this.react.mint(this.alice.address, "100")
    await expect(this.react.transfer(this.carol.address, "110")).to.be.revertedWith("ERC20: transfer amount exceeds balance")
    await expect(this.react.connect(this.bob).transfer(this.carol.address, "1", { from: this.bob.address })).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance"
    )
  })
})
