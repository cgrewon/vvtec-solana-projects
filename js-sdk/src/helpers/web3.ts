import { Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { BaseHelper, OracleResponse } from ".";

type Address = {
  [key: number]: string;
};

type RPC = {
  [key: number]: string | undefined;
};

type Contracts = {
  [key: string]: {
    address: Address;
    rpc: RPC;
    abi: Interface;
  };
};

export interface Web3Provider {
  chainId: string | number;
  rpcUrl?: string;
}

export class Web3Helper extends BaseHelper {
  private contracts: Contracts;
  private chainId: string | number;
  private provider: ethers.providers.JsonRpcProvider;

  constructor(provider: Web3Provider) {
    super();

    this.chainId = provider.chainId;
    this.contracts = {
      facade: {
        address: {
          // Mainnets
          1: "", // Ethereum mainnets
          1313161554: "", // Aurora

          // Testnets
          4: "0xfB46940d0B78903Cb89867f0f7bf2d797F66b046", // Rinkeby
          1313161555: "0x51F58EdEEa5D0E3aB86b872b09dFc912DD14B039", // Aurora testnet
        },
        rpc: {
          // Mainnets
          1: process.env.ETHEREUM_MAINNET_RPC, // Ethereum mainnets
          1313161554: process.env.AURORA_MAINNET_RPC, // Aurora

          // Testnets
          4: process.env.ETHEREUM_DEVNET_RPC, // Rinkeby
          1313161555: process.env.AURORA_DEVNET_RPC, // Aurora testnet
        },
        abi: new Interface([
          "function getLatestOracleValue(string calldata _oracleName) external view returns(uint256 lastUpdateAt, uint256 oracleValue)",
        ]),
      },
    };
    if (provider.rpcUrl) {
      this.provider = new ethers.providers.JsonRpcProvider(provider.rpcUrl);
    } else {
      this.provider = new ethers.providers.JsonRpcProvider(
        this.getRpc("facade", provider.chainId)
      );
    }
  }

  create(name: string, value?: string): Promise<OracleResponse> {
    throw new Error("Method not implemented.");
  }

  update(name: string, value?: string | undefined): Promise<OracleResponse> {
    throw new Error("Method not implemented.");
  }

  delete(name: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getCurrentValue(oracleName: string): Promise<OracleResponse> {
    const vvtecFactoryContract = new Contract(
      this.getContractAddress("facade", this.chainId),
      this.getContractABI("facade"),
      this.provider
    );

    try {
      const { lastUpdateAt, oracleValue } =
        await vvtecFactoryContract?.getLatestOracleValue(oracleName);

      return {
        lastUpdatedAt: lastUpdateAt?.toString(),
        oracleValue: oracleValue?.toString(),
        address: "",
      };
    } catch (err: any) {
      console.log(err);
      throw Error(err.message || err);
    }
  }

  private getContractAddress(name: string, chainId?: number | string): string {
    if (!chainId) return "";
    const { address } = this.contracts[name] || {};
    return address[Number(chainId)] || "";
  }

  private getRpc(name: string, chainId?: number | string): string {
    if (!chainId) return "";
    const { rpc } = this.contracts[name] || {};
    return rpc[Number(chainId)] || "";
  }

  private getContractABI(name: string): Interface {
    const { abi } = this.contracts[name] || {};
    return abi || new Interface([]);
  }
}
