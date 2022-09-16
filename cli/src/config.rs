use crate::{
  create::CreateCommand, delete::DeleteCommand, read::ReadCommand,
  update::UpdateCommand,
};
use anyhow::{anyhow, Result};
use solana_sdk::signature::{read_keypair_file, Keypair};
use std::{env, io::stdout};
use structopt::StructOpt;
use tracing_subscriber::EnvFilter;

#[derive(Debug, StructOpt)]
pub(crate) enum Command {
  #[structopt(about = "Creates new oracles in the oracles tree on chain")]
  Create(CreateCommand),
  #[structopt(about = "Reads values of existing oracles on-chain")]
  Read(ReadCommand),
  #[structopt(about = "Updates values of existing oracles on-chain")]
  Update(UpdateCommand),
  #[structopt(about = "Deletes oracles from the blockchain")]
  Delete(DeleteCommand),
}

#[derive(Debug)]
pub(crate) struct SolanaConfig {
  pub json_rpc: String,
  pub ws_url: String,
  pub keypair: Keypair,
}

#[derive(StructOpt, Debug)]
#[structopt(name = "Vvtec CLI")]
pub(crate) struct SystemSettings {
  #[structopt(short, long, parse(from_occurrences))]
  pub verbose: u8,

  #[structopt(subcommand)]
  pub command: Command,

  #[structopt(skip)]
  pub solana: SolanaConfig,
}

pub(crate) fn configure_logging(level: u8) {
  let filter = match env::var_os("RUST_LOG") {
    Some(_) => EnvFilter::try_from_default_env() // dotenv file?
      .expect("Invalid `RUST_LOG` provided"),
    None => match level {
      0 => EnvFilter::new("info"),
      1 => EnvFilter::new("debug"),
      _ => EnvFilter::new("trace"),
    },
  };

  tracing_subscriber::fmt::Subscriber::builder()
    .with_writer(stdout)
    .with_env_filter(filter)
    .init();
}

fn load_solana_config() -> Result<SolanaConfig> {
  let config_file = solana_cli_config::CONFIG_FILE
    .as_ref()
    .ok_or_else(|| anyhow!("config file path"))?;
  let cli_config = solana_cli_config::Config::load(&config_file)?;
  Ok(SolanaConfig {
    json_rpc: cli_config.json_rpc_url,
    ws_url: cli_config.websocket_url,
    keypair: read_keypair_file(&cli_config.keypair_path)
      .map_err(|e| anyhow!("{}", e))?,
  })
}

impl SystemSettings {
  pub fn load_from_env() -> Result<Self> {
    let settings = Self {
      solana: load_solana_config()?,
      ..Self::from_args()
    };
    configure_logging(settings.verbose);
    Ok(settings)
  }
}

impl Default for SolanaConfig {
  fn default() -> Self {
    load_solana_config().unwrap()
  }
}
