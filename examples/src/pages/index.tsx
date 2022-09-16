import type { NextPage } from 'next'
import { Chain, configureChains, defaultChains, useAccount, useConnect, useContract, useDisconnect, useProvider } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import supportedChains, { defaultChainId } from '../utils/supportedChains'
import { useEffect, useState } from 'react'
import { getContractABI, getContractAddress } from '../utils/contracts'

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY

const auroraChain: Chain = {
  id: 1313161554,
  name: 'Aurora',
  network: 'Aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'Aurora',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://mainnet.aurora.dev',
  },
  blockExplorers: {
    default: { name: '', url: 'https://explorer.mainnet.aurora.dev' }
  },
  testnet: false,
}

const auroraTestnetChain: Chain = {
  id: 1313161555,
  name: 'Aurora Testnet',
  network: 'Aurora Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Aurora Testnet',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'https://testnet.aurora.dev',
  },
  blockExplorers: {
    default: { name: '', url: 'https://explorer.testnet.aurora.dev' }
  },
  testnet: true,
}

const { chains } = configureChains(
  [...defaultChains, auroraTestnetChain, auroraChain],
  [
    alchemyProvider({ apiKey: alchemyApiKey }),
    infuraProvider({ apiKey: infuraApiKey }),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== auroraTestnetChain.id) return null
        return { http: chain.rpcUrls.default }
      },
    }),
    publicProvider(),
  ],
  { stallTimeout: 5000 },
)

const Home: NextPage = () => {
  const provider = useProvider()
  const { address, isConnected } = useAccount()
  const { connect, data: connectData } = useConnect({
    connector: new InjectedConnector({ chains }),
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })
  const { disconnect } = useDisconnect()

  const isInSupportedChains = () => {
    if (connectData?.chain?.id) {
      return Object.keys(supportedChains).includes(` ${connectData?.chain?.id.toString()}`);
    }
    return false
  }

  const [latestValue, setLatestValue] = useState('')
  const [updateAt, setUpdatedAt] = useState(0)

  const contract = useContract({
    addressOrName: getContractAddress('facade', connectData?.chain?.id || defaultChainId),
    contractInterface: getContractABI('facade'),
    signerOrProvider: provider
  })

  useEffect(() => {
    const getValue = async () => {
      const { lastUpdateAt, oracleValue } = await contract?.getLatestOracleValue('ETH-VVTEC')
      setLatestValue(oracleValue.toString())
      setUpdatedAt(Number(lastUpdateAt))
    }

    if (address && contract) {
      getValue()
    }
  }, [contract, address])

  return (
    <div>
      {
        !isConnected ? (
          <div>
            <button className='button' onClick={() => connect()}>Connect Wallet</button>
          </div>
        ) : !isInSupportedChains() ? (
          <>
            <div>
              <button className='button' onClick={() => disconnect()} title={'Click to disconnect'}>{address}</button>
            </div>
            <p>
              Please switch to the supported networks, like {`${Object.values(supportedChains).map(val => val.name).join(', ')}`}, and try again!
            </p>
          </>
        ) : address ? (
          <>
            <div>
              <button className='button' onClick={() => disconnect()} title={'Click to disconnect'}>{address}</button>
            </div>
            <p>
              Oracle value: {latestValue}
            </p>
            {
              updateAt > 0 ? <p>Last updated at: {new Date(updateAt).toDateString()}</p> : ''
            }
          </>
        ) : ''
      }
    </div>
  )
}

export default Home
