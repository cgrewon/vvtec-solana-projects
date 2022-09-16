# EVM smart contracts

<details>
  <summary>Testnet Addresses:</summary>
  
  |   Chain Name   |  Chain ID  |           Oracle Factory Contract            |              VVTEC Token Contract             |
  | :------------: | :--------: | :------------------------------------------: | :------------------------------------------: |
  |    Rinkeby     |     4      | `0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039` | `0xE43645CfeA343d13D1b4DbC1DAe88877Fe8907D5` |
  |     Kovan      |     42     | `0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039` | `0xE43645CfeA343d13D1b4DbC1DAe88877Fe8907D5` |
  | Aurora Testnet | 1313161555 | `0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039` | `0xE43645CfeA343d13D1b4DbC1DAe88877Fe8907D5` |
  | Plasm Testnet  | 1313161555 | `0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039` | `0xE43645CfeA343d13D1b4DbC1DAe88877Fe8907D5` |
  
</details>

## Install

`yarn` or `yarn install`

## Compile

`yarn compile`

## Deploy to EVM chains

### Deploy Oracle Factory

`yarn deploy-factory --network <YOUR_NETWORK>`, e.g. `yarn deploy-factory --network localhost`



## Deploy to Tron

`tronbox deploy --network <YOUR_NETWORK>`, e.g. `tronbox deploy --network shasta`


## Check hardhat cli tasks

`yarn hardhat --help`

## Oracle creation

`yarn hardhat create --name <ORACLE_NAME> --network <YOUR_NETWORK>`, e.g. `yarn hardhat create --name ETH-UST --network localhost`

## Oracle update

`yarn hardhat update --name <ORACLE_NAME> --value <NEW_VALUE> --network <YOUR_NETWORK>`, e.g.`yarn hardhat update --name ETH-UST --value 18888888 --network localhost`

## Oracle read

`yarn hardhat read --name <ORACLE_NAME> --network <YOUR_NETWORK>`, e.g. `yarn hardhat read --name ETH-UST --network localhost`

## Oracle delete

`yarn hardhat delete --name <ORACLE_NAME> --network <YOUR_NETWORK>`, e.g. `yarn hardhat delete --name ETH-UST --network localhost`

## Run tests

`yarn test`
