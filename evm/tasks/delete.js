require('@nomiclabs/hardhat-ethers')

const contractAddress = process.env.VVTEC_FACTORY_CONTRACT_ADDRESS

const abi = [
  'event OracleDeleted(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash)',
  'function deleteOracle(string calldata name) external',
]

// yarn hardhat delete --name ETH-UST --network localhost
task('delete', 'Deletes oracles from the blockchain')
  .addParam('name', 'The name of the Oracle to be deleted')
  .setAction(async ({ name }) => {
    console.log('Oracle to be deleted:', name)

    const signer = await ethers.getSigner()
    const address = await signer.getAddress()
    console.log('signer address:', address)

    const vvtecFactoryContract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const tx = await vvtecFactoryContract.deleteOracle(name)
      console.log('deleteOracle tx hash:', tx.hash)
      const receipt = await tx.wait()
      if (receipt.events) {
        const [result] = receipt.events
          .filter(x => { return x.event == 'OracleDeleted' })
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
