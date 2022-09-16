use anyhow::{anyhow, Result};
use std::{rc::Rc, str::FromStr};

use anchor_client::{
    solana_sdk::{
        commitment_config::CommitmentConfig,
        pubkey::Pubkey,
        signature::{read_keypair_file, Keypair},
        system_program,
    },
    Client, Cluster,
};
use vvtec::{state::Oracle, Feed};

use crate::{OracleResponse, Payer};

pub fn load_payer_from_solana_config() -> Result<Keypair> {
    let config_file = solana_cli_config::CONFIG_FILE
        .as_ref()
        .ok_or_else(|| anyhow!("config file path"))?;
    let cli_config = solana_cli_config::Config::load(config_file)?;
    let payer = read_keypair_file(&cli_config.keypair_path).map_err(|e| anyhow!("{}", e))?;
    Ok(payer)
}

pub fn load_payer_from_secret_key(secret_key: &str) -> Result<Keypair> {
    let payer = Keypair::from_base58_string(secret_key);
    Ok(payer)
}

pub enum SolanaNetwork {
    Testnet,
    Devnet,
    Mainnet,
}

impl SolanaNetwork {
    pub const TESTNET_SLUG: &'static str = "testnet";
    pub const DEVNET_SLUG: &'static str = "devnet";
    pub const MAINNET_SLUG: &'static str = "mainnet";

    pub fn from_slug(slug: &str) -> Option<Self> {
        match slug {
            Self::TESTNET_SLUG => Some(Self::Testnet),
            Self::DEVNET_SLUG => Some(Self::Devnet),
            Self::MAINNET_SLUG => Some(Self::Mainnet),
            _ => None,
        }
    }

    fn slug(&self) -> &'static str {
        match self {
            SolanaNetwork::Testnet => Self::TESTNET_SLUG,
            SolanaNetwork::Devnet => Self::DEVNET_SLUG,
            SolanaNetwork::Mainnet => Self::MAINNET_SLUG,
        }
    }

    fn get_name_bytes(&self, name: &str) -> [u8; 32] {
        let mut name_bytes: [u8; 32] = Default::default();
        name_bytes[..name.len()].copy_from_slice(&name.as_bytes());
        return name_bytes;
    }

    pub fn create_feed(&self, name: &str, value: Option<u128>, payer_sk: Option<Payer>) -> Result<()> {
        let payer = match payer_sk {
            None => load_payer_from_solana_config()?,
            Some(sk) => load_payer_from_secret_key(&sk.secret_key)?,
        };
        let cluster = Cluster::from_str(self.slug())?;

        let client =
            Client::new_with_options(cluster, Rc::new(payer), CommitmentConfig::processed());

        let program = client.program(vvtec::id());

        let name_bytes = self.get_name_bytes(name);
        let oracle = Pubkey::find_program_address(&[&name_bytes], &vvtec::id()).0;

        let feed = Feed {
            owner: program.payer(),
            name: name_bytes,
            value,
        };
        let req = program
            .request()
            .accounts(vvtec::accounts::Create {
                payer: program.payer(),
                oracle,
                system_program: system_program::ID,
            })
            .args(vvtec::instruction::Create { feed });

        match req.send() {
            Ok(_) => {
                Ok(())
            }
            Err(e) => Err(e.into()),
        }
    }

    pub fn update_feed(&self, name: &str, value: Option<u128>, payer_sk: Option<Payer>) -> Result<()> {
        let payer = match payer_sk {
            None => load_payer_from_solana_config()?,
            Some(sk) => load_payer_from_secret_key(&sk.secret_key)?,
        };
        let cluster = Cluster::from_str(self.slug())?;

        let client =
            Client::new_with_options(cluster, Rc::new(payer), CommitmentConfig::processed());

        let program = client.program(vvtec::id());

        let name_bytes = self.get_name_bytes(name);
        let oracle = Pubkey::find_program_address(&[&name_bytes], &vvtec::id()).0;

        let req = program
            .request()
            .accounts(vvtec::accounts::Update {
                owner: program.payer(),
                oracle,
            })
            .args(vvtec::instruction::Update { value });

        match req.send() {
            Ok(_) => {
                Ok(())
            }
            Err(e) => Err(e.into()),
        }
    }

    pub fn delete_feed(&self, name: &str, payer_sk: Option<Payer>) -> Result<()> {
        let payer = match payer_sk {
            None => load_payer_from_solana_config()?,
            Some(sk) => load_payer_from_secret_key(&sk.secret_key)?,
        };
        let cluster = Cluster::from_str(self.slug())?;

        let client =
            Client::new_with_options(cluster, Rc::new(payer), CommitmentConfig::processed());

        let program = client.program(vvtec::id());

        let name_bytes = self.get_name_bytes(name);
        let oracle = Pubkey::find_program_address(&[&name_bytes], &vvtec::id()).0;

        let req = program
            .request()
            .accounts(vvtec::accounts::Delete {
                owner: program.payer(),
                oracle,
            })
            .args(vvtec::instruction::Delete {});

        match req.send() {
            Ok(_) => Ok(()),
            Err(e) => Err(e.into()),
        }
    }

    pub fn get_last_value(&self, name: &str) -> Result<OracleResponse> {
        let payer = load_payer_from_solana_config()?;
        let cluster = Cluster::from_str(self.slug())?;

        let client =
            Client::new_with_options(cluster, Rc::new(payer), CommitmentConfig::processed());

        let program = client.program(vvtec::id());

        let name_bytes = self.get_name_bytes(name);
        let oracle_id = Pubkey::find_program_address(&[&name_bytes], &vvtec::id()).0;
        let feed: Oracle = program.account(oracle_id)?;

        Ok(OracleResponse(feed.value, feed.updated_at))
    }
}
