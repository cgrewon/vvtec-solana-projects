import { Interface } from 'ethers/lib/utils'
import { Contract, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'

type Address = {
  [key: number]: string
}

type Contracts = {
  [key: string]: {
    address: Address,
    abi: Interface
  }
}

const contracts: Contracts = {
  'facade': {
    address: {
      // Mainnets
      1: '', // Ethereum mainnets
      1313161554: '', // Aurora

      // Testnets
      4: '0xfB46940d0B78903Cb89867f0f7bf2d797F66b046', // Rinkeby
      1313161555: '0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039', // Aurora testnet
    },
    abi: new Interface([
      'function getLatestOracleValue(string calldata _oracleName) external view returns(uint256 lastUpdateAt, uint256 oracleValue)',
    ])
  },
}

const getContractAddress = (name: string, chainId?: number | string) : string => {
  if (!chainId) return ''
  const { address } = contracts[name] || {}
  return address[Number(chainId)] || ''
}

const getContractABI = (name: string) : Interface => {
  const { abi } = contracts[name] || {}
  return abi || new Interface([])
}

const createContract = (
  name: string,
  library: Signer | Provider | undefined,
  chainId: number | undefined
) : Contract | undefined => {
  if (name && library && chainId) {
    const { address, abi } = contracts[name]
    return address[chainId] ? new Contract(address[chainId], abi, library) : undefined
  }
  return undefined
}

const createContractWithAddress = (
  name: string,
  library: Signer | Provider | undefined,
  address:  string
) : Contract | undefined => {
  if (name && library && address) {
    const { abi } = contracts[name]
    return address ? new Contract(address, abi, library) : undefined
  }
  return undefined
}

export {
  createContract,
  createContractWithAddress,
  getContractAddress,
  getContractABI,
}
