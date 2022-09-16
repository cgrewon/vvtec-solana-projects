import { Account, Contract } from "near-api-js";
import { BaseHelper, OracleResponse } from ".";

interface ReadArg {
  name: string;
}

interface CreateArg {
  args: {
    name: string;
    value: string | undefined;
  };
}

interface DeleteArg {
  args: {
    name: string;
  };
}

interface OracleContract extends Contract {
  read(args: ReadArg): Promise<any>;
  create(arg: CreateArg): Promise<any>;
  update(arg: CreateArg): Promise<any>;
  delete(arg: DeleteArg): Promise<any>;
}

export interface NearProvider {
  account: Account;
  contractId: string;
}

export class NearHelper extends BaseHelper {
  contract: OracleContract;
  provider: NearProvider;

  constructor(provider: NearProvider) {
    super();

    this.provider = provider;
    this.contract = new Contract(provider.account, provider.contractId, {
      viewMethods: ["read", "num_feeds"],
      changeMethods: ["create", "update", "delete"],
    }) as OracleContract;
  }

  /**
   * Gets the latest Oracle value
   * @param name he Oracle name to be fetched
   * @returns OracleResponse with address, lastUpdateAt and oracleValue
   */
  async getCurrentValue(name: string): Promise<OracleResponse> {
    const d = await this.contract.read({
      name: name,
    });
    if (d[0] == "UnknownFeed") {
      throw new Error("UnknownFeed");
    }
    return {
      address: this.provider.contractId,
      lastUpdatedAt: d[1],
      oracleValue: d[0]["KnownFeed"],
    };
  }

  async create(name: string, value?: string) {
    await this.contract.create({
      args: {
        name: name,
        value: value,
      },
    });

    const d = await this.contract.read({
      name: name,
    });

    return {
      address: this.provider.contractId,
      lastUpdatedAt: d[1],
      oracleValue: d[0]["KnownFeed"],
    };
  }

  async update(name: string, value?: string) {
    await this.contract.update({
      args: {
        name: name,
        value: value,
      },
    });

    const d = await this.contract.read({
      name: name,
    });

    return {
      address: this.provider.contractId,
      lastUpdatedAt: d[1],
      oracleValue: d[0]["KnownFeed"],
    };
  }

  async delete(name: string): Promise<void> {
    await this.contract.delete({
      args: {
        name: name,
      },
    });
  }
}
