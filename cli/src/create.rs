use crate::config::SolanaConfig;
use anyhow::{anyhow, Result};
use indicatif::ProgressBar;
use vvtec_client::{Network, Oracle};
use solana_sdk::signer::Signer;
use structopt::StructOpt;
use tracing::{debug, error};

#[derive(Debug, Clone, StructOpt)]
pub(crate) struct CreateCommand {
  #[structopt(
    long,
    short,
    about = "Human readable name of the oracle. Only a-z, 0-9 and .-"
  )]
  name: String,
  #[structopt(
    long,
    short,
    about = "The initial feed value for the newly created oracle"
  )]
  value: Option<u128>,
}

impl CreateCommand {
  pub async fn invoke(self, solana: SolanaConfig) -> Result<()> {
    let network = Network::Custom(solana.json_rpc.clone(), solana.ws_url.clone());
    let owner_acc = solana.keypair.pubkey();
    let funding_acc = solana.keypair.pubkey();

    debug!("funding account: {}", &funding_acc);
    debug!("owner account: {}", &owner_acc);

    let progress = ProgressBar::new_spinner();
    progress.enable_steady_tick(120);
    progress.set_message(format!("Creating oracle {}...", &self.name));
    match Oracle::create_on_network(
      self.name,
      owner_acc,
      solana.keypair,
      self.value,
      network,
    ) {
      Ok((oracle, tx)) => {
        progress.finish_and_clear();
        println!("New oracle created:");
        println!("  - name: {}", &oracle.name()?);
        println!("  - address: {}", &oracle.id());
        println!("  - owner: {}", &funding_acc);
        println!("  - initial value: {}", &oracle.latest_snapshot()?);
        println!("  - tx: {}", &tx);
        Ok(())
      }
      Err(e) => {
        error!("Failed to create oracle: {:?}", e);
        Err(anyhow!(e))
      }
    }
  }
}
