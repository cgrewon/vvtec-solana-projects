require('dotenv').config();

const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    mainnet: {
      address:'TMJzeBma9zZrG95n5rNN7w3qLo4wCyrBrW',
      privateKey: process.env.PRIVATE_KEY_TRON_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1e8,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_TRON_SHASTA,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: process.env.PRIVATE_KEY_TRON_NILE,
      // userFeePercentage: 100,
      // feeLimit: 1e8,
      fullHost: 'https://api.nileex.io',
      network_id: '3'
    },
    development: {
      privateKey: process.env.PRIVATE_KEY_TRON_DEV,
      fullHost: `http://127.0.0.1:${port}`,
      network_id: '9'
    },
    compilers: {
      solc: {
        version: "0.8.6",
      },
    },
  },

  // solc compiler optimize
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    evmVersion: "istanbul",
  },
};
