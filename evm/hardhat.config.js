require('@nomiclabs/hardhat-waffle');
require('@openzeppelin/hardhat-upgrades');

require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

require('./tasks/account');
require('./tasks/create');
require('./tasks/update');
require('./tasks/delete');
require('./tasks/read');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/e863021f5c3a4567a323eb99048e0937', // <---- YOUR INFURA ID! (or it won't work)
      accounts: [`0x${process.env.PRIVATE_KEY_EVM_RINKEBY}`]
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/e863021f5c3a4567a323eb99048e0937', // <---- YOUR INFURA ID! (or it won't work)
      accounts: [`0x${process.env.PRIVATE_KEY_EVM_KOVAN}`]
    },
    auroraTestnet: {
      url: 'https://testnet.aurora.dev',
      accounts: [`0x${process.env.PRIVATE_KEY_EVM_AURORA}`]
    },
    shibuya: {
      url: 'https://rpc.shibuya.astar.network:8545',
      accounts: [`0x${process.env.PRIVATE_KEY_EVM_ASTAR}`]
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          metadata: {
            bytecodeHash: 'none',
          },
        },
      },
    ],
  },
};
