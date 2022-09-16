const supportedTestnets = {
  ' 4': { name: 'Rinkeby' },
  ' 1313161555': { name: 'Aurora Testnet' },
}

const supportedMainnets = {
  ' 1': { name: 'Mainnet' },
  ' 1313161554': { name: 'Aurora' },
}

const isOnAppHost = () => {
  const hostname = window.location.hostname
  return !!(hostname && hostname.startsWith('app'));
}

const getSupportedChains = () => {
  // if (isOnAppHost()) {
  //   return supportedMainnets
  // }

  return supportedTestnets
}

const supportedChains = getSupportedChains()

type ReadOnlyUrls = {
  [key: number]: string
}

const supportedChainUrls: ReadOnlyUrls = {}

// const defaultChainId = isOnAppHost() ? 1 : 4
const defaultChainId = 4

export default supportedChains
export { supportedChainUrls, defaultChainId }
