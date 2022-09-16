require('@nomiclabs/hardhat-ethers')

const contractAddress = process.env.VVTEC_FACTORY_CONTRACT_ADDRESS

const abi = [
  'function getLatestOracleValue(string calldata _oracleName) external view returns(uint256 lastUpdateAt, uint256 oracleValue)',
]

// yarn hardhat read --name ETH-UST --network localhost
task('read', 'Reads values of existing oracles on-chain')
  .addParam('name', `The name of the Oracle`)
  .setAction(async ({ name }) => {
    const signer = await ethers.getSigner()
    const address = await signer.getAddress()
    console.log('signer address:', address)

    const vvtecFactoryContract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const value = await vvtecFactoryContract.getLatestOracleValue(name)
      console.log('The latest value of', name, 'is:', value.toString())
    } catch(err) {
      console.log(err)
    }
  })

module.exports = {}
