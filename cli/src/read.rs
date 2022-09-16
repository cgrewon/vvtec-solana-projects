use crate::config::SolanaConfig;
use anyhow::Result;
use vvtec_client::{Network, Oracle, OracleId};
use std::str::FromStr;
use structopt::StructOpt;
use tracing::debug;

#[derive(Debug, Clone, StructOpt)]
pub(crate) struct ReadCommand {
  oracle: String,
}

impl ReadCommand {
  pub async fn invoke(self, solana: SolanaConfig) -> Result<()> {
    let oracle_id = OracleId::from_str(&self.oracle).unwrap();
    let network = Network::Custom(solana.json_rpc.clone(), solana.ws_url.clone());

    debug!("using network: {}", network);
    debug!("reading from oracle: {}", oracle_id);

    let client = Oracle::open_on_network(oracle_id, network, solana.keypair).unwrap();
    let snapshot = client.latest_snapshot()?;
    println!("Oracle {} value is {}", client.name()?, snapshot);

    Ok(())
  }
}
