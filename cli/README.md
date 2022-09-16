# Vvtec command line interface

This cli is used to control on-chain oracles.

```
Vvtec CLI 0.1.0

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

## Oracle creation
```
$ vvtec create --name crypto.sol.usdt
New oracle created:
  - name: crypto.sol.usdt
  - address: 9rARYb1RaH7Cn4tPPuo1j3BPxay5179Gb2vx1vEajyWK
  - owner: G94CtTrX8yeVE3WJiGrXJiJwyGdGVhf9a3KV84vqPGTG
  - initial value: <null> @ 2022-08-02 17:03:15
  - tx: 4zJcsCfXk9uMdTSHF6Lp1CkSMn9UX1jhpWoiupzmyouQfcX3y9hai2qTm6ep9tdAba5XKiLTQzB86Fmy2xrKN2Rp
```

## Oracle update
```
$ vvtec update crypto.sol.usdt 1860000000
Oracle crypto.sol.usdt updated: 
  - address: 9rARYb1RaH7Cn4tPPuo1j3BPxay5179Gb2vx1vEajyWK
  - owner: G94CtTrX8yeVE3WJiGrXJiJwyGdGVhf9a3KV84vqPGTG
  - current value: 1860000000 @ 2022-08-02 17:10:46
  - tx: 9cFBVnEodWmiqRNYKR86EVvxYUPCQTe8XdjLbDPugj5X8avea8wwgJqS3SEmxaxAo9eCy3HeMsLBdtqH1aP2Vc8
```

## Oracle read
```
$ vvtec read crypto.sol.usdt
Oracle crypto.sol.usdt value is <null> @ 2022-08-02 17:03:15
```

## Oracle delete
```
$ vvtec delete crypto.sol.usdt
Oracle crypto.sol.usdt deleted: 
  - address: 9rARYb1RaH7Cn4tPPuo1j3BPxay5179Gb2vx1vEajyWK
  - tx: DRb47NLkyuPKPqBhW6HyY16qsycppxnGovLdvaNBE7R1kTWSJvfxXUEpJp9ZCustFimYCKmqiw3ym5s1LKeR6Kk
```