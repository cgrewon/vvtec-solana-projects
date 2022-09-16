const { ethers } = require('hardhat');
const { expect } = require('chai');

const INIT_VALUE = 999999

describe('VvtecFacade', function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.deployer = this.signers[0]
    this.operator = this.signers[1]
    this.hacker = this.signers[2]

    console.log('deployer:', this.deployer.address)
    console.log('operator:', this.operator.address)
    console.log('hacker:', this.hacker.address)

    this.VvtecFacade = await ethers.getContractFactory('VvtecFacade', this.deployer)
    this.VvtecOracle = await ethers.getContractFactory('VvtecOracle', this.deployer)
  })

  beforeEach(async function () {
    this.vvtecOracle = await this.VvtecOracle.deploy()
    await this.vvtecOracle.deployed()

    this.vvtecFactory = await this.VvtecFacade.deploy(this.vvtecOracle.address)
    await this.vvtecFactory.deployed()
  })

  it('should be able to create a new Oracle', async function () {
    const name = 'ETH-VVTEC'
    await this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)

    const oracleAddr = await this.vvtecFactory.getOracleAddress(name)
    expect(oracleAddr).not.null
    expect(oracleAddr).not.equal(ethers.constants.AddressZero)

    const { oracleValue } = await this.vvtecFactory.getLatestOracleValue(name)
    expect(oracleValue).to.eq(INIT_VALUE)
  })

  it('negative cases when creating a new Oracle', async function () {
    const name = 'ETH-VVTEC'
    await this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)

    // The same name Oracle should not be created more than once
    await expect(
      this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)
    ).to.be.revertedWith('OracleExistedAlready()')

    // should not be able to create Oracle if the address is not belong to operator
    await expect(
      this.vvtecFactory.connect(this.operator).createOracle('ETH-USDT', INIT_VALUE)
    ).to.be.revertedWith('Not allowed')

    await this.vvtecFactory.connect(this.deployer).granteOperatorRole(this.operator.address)

    await this.vvtecFactory.connect(this.operator).createOracle('ETH-USDT', INIT_VALUE)
    const { oracleValue } = await this.vvtecFactory.getLatestOracleValue('ETH-USDT')
    expect(oracleValue).to.eq(INIT_VALUE)
  })

  it.skip('should be able to update an Oracle', async function () {
    const name = 'ETH-VVTEC'
    await this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)

    let { oracleValue } = await this.vvtecFactory.getLatestOracleValue(name)
    expect(oracleValue).to.eq(INIT_VALUE)

    await this.vvtecFactory.updateOracleValue(name, 10000)

    let { oracleValue: updatedValue } = await this.vvtecFactory.getLatestOracleValue(name)
    expect(updatedValue).to.eq(10000)
  })

  it('should be able to remove an Oracle', async function () {
    const name = 'ETH-VVTEC'
    await this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)

    await this.vvtecFactory.deleteOracle(name)

    await expect(
      this.vvtecFactory.getLatestOracleValue(name)
    ).to.be.revertedWith('OracleDoesNotExist()')
  })

  it('should revert the call when the contract is paused', async function () {
    await this.vvtecFactory.connect(this.deployer).pause()

    const name = 'ETH-VVTEC'
    await expect(
      this.vvtecFactory.connect(this.deployer).createOracle(name, INIT_VALUE)
    ).to.be.revertedWith('Pausable: paused')
  })
  
});
