const { ethers } = require('hardhat');
const { expect } = require('chai');

const INIT_VALUE = 666
const ORACLE_NAME = 'ETH-VVTEC'
const UPDATED_VALUE = 999

describe('VvtecFlow', function () {
  let erc20Mock, vvtecOracle, treasuryWallet, bizMock, vvtecFactory, signers, deployer, operator

  before(async function () {
    signers = await ethers.getSigners()
    deployer = signers[0]
    operator = signers[1]
    treasuryWallet = signers[2]

    console.log('deployer:', deployer.address)
    console.log('operator:', operator.address)

    this.ERC20Mock = await ethers.getContractFactory('ERC20Mock', deployer)
    this.BizMock = await ethers.getContractFactory('BizMock', deployer)

    this.VvtecFacade = await ethers.getContractFactory('VvtecFacade', deployer)
    this.VvtecOracle = await ethers.getContractFactory('VvtecOracle', deployer)
  })

  beforeEach(async function () {
    const totalAmount = ethers.utils.parseUnits('10000')
    erc20Mock = await this.ERC20Mock.deploy('VVTEC Test Token', 'OTT', totalAmount)

    vvtecOracle = await this.VvtecOracle.deploy()
    await vvtecOracle.deployed()

    vvtecFactory = await this.VvtecFacade.deploy(vvtecOracle.address)
    await vvtecFactory.deployed()
    await vvtecFactory.setVvtecToken(erc20Mock.address)

    bizMock = await this.BizMock.deploy(erc20Mock.address, vvtecFactory.address)
    console.log('biz mock deployed to:', bizMock.address)

    listener()

    await createOracle(ORACLE_NAME, INIT_VALUE)
  })

  it('should be failed to update the Oracle with Insufficient balance error', async function () {
    let { oracleValue } = await vvtecFactory.getLatestOracleValue(ORACLE_NAME)
    expect(oracleValue).to.eq(INIT_VALUE)

    const fee = ethers.utils.parseUnits('1')
    await vvtecFactory.connect(deployer).setDefaultRequestFee(fee)

    await expect(
      bizMock.connect(deployer).updateOracle()
    ).to.be.revertedWith("Insufficient balance")
  })

  it('should be able to update an Oracle', async function () {
    let { oracleValue } = await vvtecFactory.getLatestOracleValue(ORACLE_NAME)
    expect(oracleValue).to.eq(INIT_VALUE)

    const defaultReqFee = await vvtecFactory.defaultRequestFee()
    expect(defaultReqFee).to.eq(0)

    const amount = ethers.utils.parseUnits('5')
    await erc20Mock.connect(deployer).transfer(bizMock.address, amount)

    const tx = await bizMock.connect(deployer).updateOracle()
    setTimeout(() => { mineNBlocks(3) }, 5000)
    await tx.wait(2)

    let currBalance = await erc20Mock.balanceOf(bizMock.address)
    // should not be charged any fee as the initial default request fee is 0
    expect(currBalance).to.eq(amount)

    const { oracleValue: updatedValue } = await vvtecFactory.getLatestOracleValue(ORACLE_NAME)
    expect(updatedValue).to.eq(UPDATED_VALUE)

    // change the default request fee
    const fee = ethers.utils.parseUnits('1')
    await vvtecFactory.connect(deployer).setDefaultRequestFee(fee)

    await bizMock.connect(deployer).updateOracle()

    currBalance = await erc20Mock.balanceOf(bizMock.address)
    expect(Number(currBalance)).to.eq(amount - fee)
    // ethers.utils.formatEther(balance)

    // change PartnerRequestFee
    const partnerFee = ethers.utils.parseUnits('4')
    await vvtecFactory.connect(deployer).setPartnerRequestFee(bizMock.address, partnerFee)
    // set the treasury wallet
    await vvtecFactory.connect(deployer).setTreasuryWallet(treasuryWallet.address)
    expect(await erc20Mock.balanceOf(treasuryWallet.address)).to.eq(0)

    await bizMock.connect(deployer).updateOracle()

    currBalance = await erc20Mock.balanceOf(bizMock.address)
    expect(Number(currBalance)).to.eq(0)

    // The treasury wallet should be received 5 VVTEC token
    await vvtecFactory.connect(deployer).setTreasuryWallet(treasuryWallet.address)
    expect(await erc20Mock.balanceOf(treasuryWallet.address)).to.eq(ethers.utils.parseUnits('5'))
  })

  // 1. Mock a node to listen to the New Request event
  function listener() {
    vvtecFactory.on('NewRequest', async (requestId, requester, datetime) => {
      console.log('new request received', requestId, requester, datetime.toString())
      await vvtecFactory.connect(deployer).updateOracleValue(requestId, ORACLE_NAME, UPDATED_VALUE)
    })
  }

  // 2. Create an Oracle
  async function createOracle(name, initValue) {
    await vvtecFactory.connect(deployer).createOracle(name, initValue)
    const { oracleValue } = await vvtecFactory.getLatestOracleValue(name)
    expect(oracleValue).to.eq(initValue)
  }

  async function mineNBlocks(n) {
    for (let index = 0; index < n; index++) {
      await ethers.provider.send('evm_mine');
    }
  }
});
