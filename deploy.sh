# builds the on-chain contract and deployes it to the 
# system-configured default chain

cd contract 
anchor build
solana program deploy target/deploy/vvtec_onchain.so --program-id ../../vvtec-keypair.json