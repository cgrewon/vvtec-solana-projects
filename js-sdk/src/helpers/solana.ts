import {
  AnchorProvider,
  Program,
  Wallet,
  web3,
  BN,
} from "@project-serum/anchor";
import { BaseHelper, OracleResponse } from ".";
import { IDL, VvtecOnchain } from "../types/vvtec_onchain";

export type SolanaConfig = {
  endpoint: string;
  wallet: Wallet;
};

export class SolanaHelper extends BaseHelper {
  provider: AnchorProvider;
  program: Program<VvtecOnchain>;

  constructor(provider: AnchorProvider) {
    super();

    this.provider = provider;
    const ORACLE_PROGRAM_ID = new web3.PublicKey(
      "vvtecC41zqsHouFA6EqSdcyJL9MdL9sk8E3pZWNQzyAY"
    );
    this.program = new Program<VvtecOnchain>(
      IDL,
      ORACLE_PROGRAM_ID,
      this.provider
    );
  }

  async create(oracleName: string, value?: string): Promise<OracleResponse> {
    const feedName = Buffer.alloc(32);
    feedName.fill(oracleName);

    const [oracle] = await web3.PublicKey.findProgramAddress(
      [feedName],
      this.program.programId
    );
    await this.program.methods
      .create({
        name: [...feedName],
        owner: this.provider.wallet.publicKey,
        value: value ? new BN(value) : null,
      })
      .accounts({
        oracle,
      })
      .rpc();

    let oracleAcc = await this.program.account.oracle.fetch(oracle);

    return {
      address: oracle.toBase58(),
      lastUpdatedAt: oracleAcc.updatedAt.toString(),
      oracleValue: oracleAcc.value?.toString(),
    };
  }

  public async update(
    oracleName: string,
    value?: string
  ): Promise<OracleResponse> {
    const feedName = Buffer.alloc(32);
    feedName.fill(oracleName);

    const [oracle] = await web3.PublicKey.findProgramAddress(
      [feedName],
      this.program.programId
    );
    await this.program.methods
      .update(value ? new BN(value) : null)
      .accounts({
        oracle,
      })
      .rpc();

    let oracleAcc = await this.program.account.oracle.fetch(oracle);

    return {
      address: oracle.toBase58(),
      lastUpdatedAt: oracleAcc.updatedAt.toString(),
      oracleValue: oracleAcc.value?.toString(),
    };
  }

  public async delete(oracleName: string): Promise<void> {
    const feedName = Buffer.alloc(32);
    feedName.fill(oracleName);

    const [oracle] = await web3.PublicKey.findProgramAddress(
      [feedName],
      this.program.programId
    );
    await this.program.methods
      .delete()
      .accounts({
        oracle,
      })
      .rpc();
  }

  /**
   * Gets the latest Oracle value
   *
   * @param name the Oracle name to be fetched
   *
   * @return OracleResponse with address, lastUpdateAt and oracleValue
   */
  public async getCurrentValue(name: string): Promise<OracleResponse> {
    const feedName = Buffer.alloc(32);
    feedName.fill(name);

    const [oracle] = await web3.PublicKey.findProgramAddress(
      [feedName],
      this.program.programId
    );

    try {
      let oracleAcc = await this.program.account.oracle.fetch(oracle);
      return {
        address: oracle.toBase58(),
        lastUpdatedAt: oracleAcc.updatedAt.toString(),
        oracleValue: oracleAcc.value?.toString(),
      };
    } catch (e) {
      throw e;
    }
  }
}
