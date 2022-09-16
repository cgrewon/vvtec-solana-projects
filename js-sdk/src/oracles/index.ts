import { AnchorProvider } from "@project-serum/anchor";
import { Chain } from "../consts";
import {
  BaseHelper,
  NearHelper,
  NearProvider,
  SolanaHelper,
  Web3Helper,
  Web3Provider,
} from "../helpers";

export class OracleInfo {
  helpers: Map<Chain, any>;

  constructor() {
    this.helpers = new Map();
    this.helpers.set(Chain.AURORA, Web3Helper);
    this.helpers.set(Chain.SOLANA, SolanaHelper);
    this.helpers.set(Chain.NEAR, NearHelper);
  }

  async inner(
    chain: Chain,
    config: AnchorProvider | NearProvider | Web3Provider
  ): Promise<BaseHelper> {
    const klass = this.helpers.get(chain);
    return new klass(config);
  }
}
