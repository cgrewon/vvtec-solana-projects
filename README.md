# VVTEC Oracles Contracts

This repository is broken down into several projects.

## Modules

- vvtec-cli
- vvtec-client
- vvtec-onchain
- vvtec-core
- vvtec-evm
- vvtec-network-oracles
- vvtec-near


EVM (Aurora, Tron, Astar, Ethereum, Polygon) + Near + Solana based high-fidelity data platform.

## Build Instructions

Make sure that you have Rust toolchains setup and configured on your machine:

```
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then build the root directory of this repository:

```
$ cargo build --release
```

## CLI Usage

This CLI is used to control on-chain oracles.

```
$ vvtec --help
VVtec CLI 0.1.0

USAGE:
    vvtec [FLAGS] <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information
    -v, --verbose    

SUBCOMMANDS:
    create    Creates new oracles in the oracles tree on chain
    delete    Deletes oracles from the blockchain
    help      Prints this message or the help of the given subcommand(s)
    read      Reads values of existing oracles on-chain
    update    Updates values of existing oracles on-chain

```

## API Access

[tbd]

## Build Instructions (EVM)
```
$ yarn compile
$ yarn install
```
