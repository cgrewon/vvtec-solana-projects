import assert from "assert";
import { AnchorProvider, BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import { Chain, OracleInfo } from "../src";

dotenv.config();

describe("vvtec oracles", () => {
  const oracleInfo = new OracleInfo();

  // it("get current value - crypto.sol.usdt", async () => {
  //   let value = await oracleInfo.getCurrentValue("crypto.sol.usdt");
  //   console.log(value);
  // });

  // it("get current value - crypto.usdt.sol", async () => {
  //   let value = await oracleInfo.getCurrentValue("crypto.usdt.sol");
  //   console.log(value);
  // });

  // it("get current value - crypto.usdc.sol", async () => {
  //   let value = await oracleInfo.getCurrentValue("crypto.usdc.sol");
  //   console.log(value);
  // });

  it("solana - get current value - crypto.usdt.sol", async () => {
    const provider = AnchorProvider.local();
    const solana = await oracleInfo.inner(Chain.SOLANA, provider);

    let data = await solana.getCurrentValue("crypto.usdt.sol");
    console.log(data);
  });
});
