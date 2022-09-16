require('@nomiclabs/hardhat-ethers')

const contractAddress = process.env.VVTEC_FACTORY_CONTRACT_ADDRESS

const abi = [
  'event OracleCreated(address indexed operator, address indexed oracleAddress, bytes32 indexed nameHash)',
  'function createOracle(string calldata pair, uint256 initValue) external returns(address, bytes32)',
  'function getOracleAddress(string calldata pair) external view returns(address)',
]

// yarn hardhat create --name ETH-UST --network localhost
task('create', 'Creates new oracles in the oracles tree on chain')
  .addParam('name', 'Human readable name of the oracle')
  .addOptionalParam('value', 'The initial feed value for the newly created oracle')
  .setAction(async ({ name, value }) => {
    console.log('Oracle to be created:', name)

    const signer = await ethers.getSigner()
    const address = await signer.getAddress()
    console.log('signer address:', address)

    const vvtecFactoryContract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const tx = await vvtecFactoryContract.createOracle(name, value ? value : '99999999')
      console.log('CreateOracle tx hash:', tx.hash)
      const receipt = await tx.wait()
      if (receipt.events) {
        const [result] = receipt.events
          .filter(x => { return x.event == 'OracleCreated' })
          .map(v => {
            return { oracleAddress: v.args['oracleAddress'], nameHash: v.args['nameHash'] } 
          })
        console.log('oracleAddress:', result.oracleAddress, 'nameHash:', result.nameHash)
      }
  
      const addr = await vvtecFactoryContract.getOracleAddress(name)
      console.log('oracle addr:', addr)
    } catch(err) {
      console.log(err)
    }
  })

module.exports = {}
