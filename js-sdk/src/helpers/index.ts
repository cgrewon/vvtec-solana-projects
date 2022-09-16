export interface OracleResponse {
  address: string;
  lastUpdatedAt: string;
  oracleValue: string;
}

export abstract class BaseHelper {
  /**
   * Gets the latest Oracle value
   * @param name he Oracle name to be fetched
   * @returns OracleResponse with address, lastUpdateAt and oracleValue
   */
  abstract getCurrentValue(name: string): Promise<OracleResponse>;
  abstract create(name: string, value?: string): Promise<OracleResponse>;
  abstract update(name: string, value?: string): Promise<OracleResponse>;
  abstract delete(name: string): Promise<void>;
}

export * from "./web3";
export * from "./solana";
export * from "./near";
