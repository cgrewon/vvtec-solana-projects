use std::str::FromStr;

use crate::config::SolanaConfig;
use anyhow::{anyhow, Result};
use indicatif::ProgressBar;
use vvtec_client::{Network, Oracle, OracleId};
use solana_sdk::signer::Signer;
use structopt::StructOpt;
use tracing::{debug, error};

#[derive(Debug, Clone, StructOpt)]
pub(crate) struct DeleteCommand {
  oracle: String,
}

impl DeleteCommand {
  pub async fn invoke(self, solana: SolanaConfig) -> Result<()> {
    let oracle_id = OracleId::from_str(&self.oracle).unwrap();
    let network =
      Network::Custom(solana.json_rpc.clone(), solana.ws_url.clone());
    let funding_acc = solana.keypair.pubkey();

    debug!("using network: {}", &network);
    debug!("deleting oracle: {}", &oracle_id);
    debug!("funding account: {}", &funding_acc);

    let oracle = Oracle::open_on_network(oracle_id, network, solana.keypair)?;

    let progress = ProgressBar::new_spinner();
    progress.enable_steady_tick(50);
    progress.set_message("Deleting oracle...");

    match oracle.delete() {
      Ok(txhash) => {
        progress.finish_and_clear();
        println!("Oracle {} deleted: ", self.oracle);
        println!("  - address: {}", &oracle.id());
        println!("  - tx: {}", &txhash);
        Ok(())
      }
      Err(e) => {
        error!("Failed to update oracle: {:?}", e);
        Err(anyhow!(e))
      }
    }
  }
}
