module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const react = await ethers.getContract("ReactToken")
  const syrup = await ethers.getContract("XStakeBar")

  const { address } = await deploy("ReactMaster", {
    from: deployer,
    args: [react.address, syrup.address, dev, "1000000000000000000000", "0", "1000000000000000000000"],
    log: true,
    deterministicDeployment: false
  })

  const MINTER_ROLE = ethers.utils.id('MINTER_ROLE')
  let tx = await react.grantRole(MINTER_ROLE, address)
  process.stdout.write(
      `Grant ReactToken MINTER_ROLE to ReactMaster (tx: ${tx.hash})...: `
  )

  let receipt = await tx.wait()
  if (receipt.status) {
    console.log(
        `done (block: ${
            receipt.blockNumber
        }) with ${receipt.gasUsed.toNumber()} gas`
    )
  } else {
    console.log(`REVERTED!`)
  }

  const reactMaster = await ethers.getContract("ReactMaster")
  if (await reactMaster.owner() !== dev) {
    // Transfer ownership of ReactMaster to dev
    console.log("Transfer ownership of ReactMaster to dev")
    await (await reactMaster.transferOwnership(dev)).wait()
  }
}

module.exports.tags = ["ReactMaster"]
module.exports.dependencies = ["Factory", "Router", "ReactToken", "XStakeBar"]
