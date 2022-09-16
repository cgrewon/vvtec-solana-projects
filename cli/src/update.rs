use crate::config::SolanaConfig;
use anyhow::{anyhow, Result};
use indicatif::ProgressBar;
use vvtec_client::{Network, Oracle, OracleId};
use solana_sdk::signer::Signer;
use std::str::FromStr;
use structopt::StructOpt;
use tracing::{debug, error};

#[derive(Debug, Clone, StructOpt)]
pub(crate) struct UpdateCommand {
  oracle: String,
  feed_value: Option<u128>,
}

impl UpdateCommand {
  pub async fn invoke(self, solana: SolanaConfig) -> Result<()> {
    let oracle_id = OracleId::from_str(&self.oracle).unwrap();
    let network = Network::Custom(solana.json_rpc.clone(), solana.ws_url.clone());
    let funding_acc = solana.keypair.pubkey();

    debug!("using network: {}", &network);
    debug!("updating oracle: {}", &oracle_id);
    debug!("funding account: {}", &funding_acc);

    let oracle = Oracle::open_on_network(oracle_id, network, solana.keypair)?;

    let progress = ProgressBar::new_spinner();
    progress.enable_steady_tick(50);
    progress.set_message("Updating oracle...");

    match oracle.update_value(self.feed_value) {
      Ok(txhash) => {
        let new_value = oracle.latest_snapshot()?;
        progress.finish_and_clear();
        println!("Oracle {} updated: ", self.oracle);
        println!("  - address: {}", &oracle.id());
        println!("  - owner: {}", &oracle.owner()?);
        println!("  - current value: {}", &new_value);
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
