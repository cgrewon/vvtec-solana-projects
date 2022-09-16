use anchor_client::{
  solana_sdk::pubkey::Pubkey,
  solana_sdk::{
    commitment_config::CommitmentConfig,
    signature::{Keypair, Signature, Signer},
    system_program,
  },
  Client, ClientError, Cluster, Program,
};
use chrono::NaiveDateTime;
use vvtec::state::{Oracle as OracleState, Timestamp};
use vvtec::Feed;
use vvtec::Result as VvtecResult;
use std::{
  fmt::{Display, Formatter},
  rc::Rc,
  str::FromStr,
};
use tracing::debug;

pub enum Network {
  Devnet,
  Testnet,
  Mainnet,
  Custom(String, String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Snapshot(pub Option<u128>, pub Timestamp);

impl Display for Snapshot {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let value_fmt = match &self.0 {
      None => "<null>".to_owned(),
      Some(v) => v.to_string(),
    };
    write!(
      f,
      "{} @ {}",
      value_fmt,
      NaiveDateTime::from_timestamp(self.1 as i64, 0)
    )
  }
}

impl Network {
  fn rpc_url(&self) -> String {
    match self {
      Network::Devnet => "https://api.devnet.solana.com",
      Network::Testnet => "https://api.testnet.solana.com",
      Network::Mainnet => "https://api.mainnet-beta.solana.com",
      Network::Custom(rpc_url, _) => rpc_url,
    }
    .to_owned()
  }

  fn ws_url(&self) -> String {
    match self {
      Network::Devnet => "wss://api.devnet.solana.com",
      Network::Testnet => "wss://api.testnet.solana.com",
      Network::Mainnet => "wss://api.mainnet-beta.solana.com",
      Network::Custom(_, ws_url) => ws_url,
    }
    .to_owned()
  }
}

impl Display for Network {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.rpc_url())
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OracleId(Pubkey);

impl OracleId {
  pub fn from_address(address: Pubkey) -> Self {
    OracleId(address)
  }
  pub fn from_name(name: &str) -> Self {
    let mut name_bytes: [u8; 32] = Default::default();
    name_bytes[..name.len()].copy_from_slice(&name.as_bytes());
    OracleId(Pubkey::find_program_address(&[&name_bytes], &vvtec::id()).0)
  }
}

impl FromStr for OracleId {
  type Err = vvtec::Error;

  fn from_str(s: &str) -> VvtecResult<Self> {
    Ok(match Pubkey::from_str(s) {
      Ok(pubkey) => OracleId::from_address(pubkey),
      Err(_) => OracleId::from_name(s),
    })
  }
}

impl Display for OracleId {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.0)
  }
}

pub struct Oracle {
  id: OracleId,
  program: Program,
}

impl Oracle {
  #[cfg(debug_assertions)]
  pub fn open(id: OracleId, payer: Keypair) -> Result<Self, ClientError> {
    Oracle::open_on_network(id, Network::Devnet, payer)
  }

  #[cfg(not(debug_assertions))]
  pub fn open(id: OracleId) -> Result<Self> {
    Oracle::open_on_network(id, Network::Mainnet)
  }

  pub fn open_on_network(
    id: OracleId,
    network: Network,
    payer: Keypair,
  ) -> Result<Self, ClientError> {
    let client = Client::new_with_options(
      Cluster::Custom(network.rpc_url(), network.ws_url()),
      Rc::new(payer),
      CommitmentConfig::processed(),
    );
    let program = client.program(vvtec::id());
    Ok(Self { id, program })
  }

  #[cfg(debug_assertions)]
  pub fn create(
    name: String,
    owner: Pubkey,
    payer: Keypair,
    initial_value: Option<u128>,
  ) -> Result<(Self, Signature), ClientError> {
    Oracle::create_on_network(
      name,
      owner,
      payer,
      initial_value,
      Network::Devnet,
    )
  }

  #[cfg(not(debug_assertions))]
  pub fn create(
    name: String,
    owner: Pubkey,
    payer: Keypair,
    balance: u64,
    initial_value: Option<FeedValue>,
  ) -> Result<(Self, Signature)> {
    Oracle::create_on_network(
      name,
      owner,
      payer,
      balance,
      initial_value,
      Network::Mainnet,
    )
  }

  pub fn create_on_network(
    name: String,
    owner: Pubkey,
    payer: Keypair,
    initial_value: Option<u128>,
    network: Network,
  ) -> Result<(Self, Signature), ClientError> {
    assert!(name.len() > 2);
    assert!(name.len() <= 32);
    assert!(owner != Pubkey::default());
    assert!(payer.pubkey() != Pubkey::default());

    let mut name_bytes: [u8; 32] = Default::default();
    name_bytes[..name.len()].copy_from_slice(&name.as_bytes());

    let url = Cluster::Custom(network.rpc_url(), network.ws_url());
    let client = Client::new_with_options(
      url,
      Rc::new(payer),
      CommitmentConfig::processed(),
    );
    let program_acc = vvtec::id();
    let oracle_id =
      Pubkey::find_program_address(&[&name_bytes], &program_acc).0;
    let initial_feed = Feed {
      owner,
      name: name_bytes,
      value: initial_value,
    };

    debug!("Running on network: {}", &network);
    debug!("Using Vvtec program id {}", &program_acc);
    debug!("Derived Oracle address: {}", &oracle_id);
    debug!("initial feed value for oracle: {:?}", &initial_feed);

    let program = client.program(program_acc);

    let req = program
      .request()
      .accounts(vvtec::accounts::Create {
        payer: program.payer(),
        oracle: oracle_id,
        system_program: system_program::ID,
      })
      .args(vvtec::instruction::Create { feed: initial_feed });

    match req.send() {
      Ok(txhash) => Ok((
        Self {
          id: OracleId::from_address(oracle_id),
          program,
        },
        txhash,
      )),
      Err(e) => Err(e.into()),
    }
  }

  pub fn id(&self) -> OracleId {
    self.id
  }

  pub fn latest_snapshot(&self) -> Result<Snapshot, ClientError> {
    let feed: OracleState = self.program.account(self.id.0)?;
    Ok(Snapshot(feed.value, feed.updated_at))
  }

  pub fn owner(&self) -> Result<Pubkey, ClientError> {
    let feed: OracleState = self.program.account(self.id.0)?;
    Ok(feed.owner)
  }

  pub fn name(&self) -> Result<String, ClientError> {
    let feed: OracleState = self.program.account(self.id.0)?;
    Ok(String::from_utf8_lossy(&feed.name).to_string())
  }

  pub fn update_value(
    &self,
    value: Option<u128>,
  ) -> Result<Signature, ClientError> {
    self
      .program
      .request()
      .accounts(vvtec::accounts::Update {
        owner: self.program.payer(),
        oracle: self.id.0,
      })
      .args(vvtec::instruction::Update { value })
      .send()
  }

  pub fn delete(&self) -> Result<Signature, ClientError> {
    self
      .program
      .request()
      .accounts(vvtec::accounts::Delete {
        owner: self.program.payer(),
        oracle: self.id.0,
      })
      .args(vvtec::instruction::Delete {})
      .send()
  }
}

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
