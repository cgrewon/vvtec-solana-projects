require('@nomiclabs/hardhat-ethers')

const contractAddress = process.env.VVTEC_FACTORY_CONTRACT_ADDRESS

const abi = [
  'event OracleUpdated(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash, uint256 value)',
  'function updateOracleValue(bytes32 _reqId, string calldata name, uint256 oracleValue) external',
]

// yarn hardhat update --name ETH-UST --value 18888888 --network localhost
task('update', 'Updates values of existing oracles on-chain')
  .addParam('reqId', `The requestID to be updated`)
  .addParam('name', `The name of the Oracle to be updated`)
  .addParam('value', `The new value of the Oracle`)
  .setAction(async ({ name, value }) => {
    console.log('The Oracle to be updated:', name)
    const signer = await ethers.getSigner()
    const address = await signer.getAddress()
    console.log('signer address:', address)

    const vvtecFactoryContract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const tx = await vvtecFactoryContract.updateOracleValue(name, value)
      console.log('updateOracleValue tx hash:', tx.hash)
      const receipt = await tx.wait()
      if (receipt.events) {
        const [result] = receipt.events
          .filter(x => { return x.event == 'OracleUpdated' })
          .map(v => {
            return { oracleAddress: v.args['oracleAddress'], nameHash: v.args['nameHash'] } 
          })
        console.log('oracleAddress:', result.oracleAddress, 'nameHash:', result.nameHash)
      }
    } catch(err) {
        console.log(err)
    }
  })

module.exports = {}
