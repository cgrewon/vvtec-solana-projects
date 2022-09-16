use anyhow::Result;
use near::NearNetwork;
use vvtec::state::Timestamp;
use solana::SolanaNetwork;

pub mod solana;
pub mod near;

#[derive(Debug)]
pub struct OracleResponse(pub Option<u128>, pub Timestamp);

#[derive(Debug, Clone)]
pub struct Payer {
    account_id: Option<String>,
    secret_key: String,
}

pub enum OracleInfo {
    Solana(SolanaNetwork),
    Near(NearNetwork),
}

impl OracleInfo {
    pub const SOLANA_SLUG: &'static str = "solana";
    pub const NEAR_SLUG: &'static str = "near";

    pub fn from_slug(platform_slug: &str, network_slug: &str) -> Option<Self> {
        match platform_slug {
            Self::SOLANA_SLUG => SolanaNetwork::from_slug(network_slug).map(Self::Solana),
            Self::NEAR_SLUG => NearNetwork::from_slug(network_slug).map(Self::Near),
            _ => None,
        }
    }
    
    pub async fn get_last_value(&self, name: &str) -> Result<OracleResponse> {
        match self {
            OracleInfo::Solana(net) => net.get_last_value(name),
            OracleInfo::Near(net) => net.get_last_value(name).await,
        }
    }

    pub async fn create(&self, name: &str, value: Option<u128>, payer: Option<Payer>) -> Result<()> {
        match self {
            OracleInfo::Solana(net) => net.create_feed(name, value, payer),
            OracleInfo::Near(net) => net.create_feed(name, value, payer.unwrap()).await,
        }
    }

    pub async fn update(&self, name: &str, value: Option<u128>, payer: Option<Payer>) -> Result<()> {
        match self {
            OracleInfo::Solana(net) => net.update_feed(name, value, payer),
            OracleInfo::Near(net) => net.update_feed(name, value, payer.unwrap()).await,
        }
    }

    pub async fn delete(&self, name: &str, payer: Option<Payer>) -> Result<()> {
        match self {
            OracleInfo::Solana(net) => net.delete_feed(name, payer),
            OracleInfo::Near(net) => net.delete_feed(name, payer.unwrap()).await,
        }
    }
}

#[cfg(test)]
mod tests {
    use tokio::runtime::Runtime;

    use super::*;

    // #[test]
    // fn on_solana() -> Result<()> {
    //     let oracle_info = OracleInfo::from_slug("solana", "devnet").unwrap();
    //     let payer = Payer {
    //         account_id: None,
    //         secret_key: "YOUR_PRIVATE_KEY_HERE".to_string()
    //     };
    //     Runtime::new().unwrap().block_on(oracle_info.create("crypto.sol.usdt", Some(0), Some(payer.clone())))?;

    //     let res = Runtime::new().unwrap().block_on(oracle_info.get_last_value("crypto.sol.usdt"))?;
    //     println!("{:?}", res);

    //     Runtime::new().unwrap().block_on(oracle_info.update("crypto.sol.usdt", Some(1), Some(payer.clone())))?;

    //     let res = Runtime::new().unwrap().block_on(oracle_info.get_last_value("crypto.sol.usdt"))?;
    //     println!("{:?}", res);

    //     Runtime::new().unwrap().block_on(oracle_info.delete("crypto.sol.usdt", Some(payer.clone())))?;

    //     Ok(())
    // }

    // #[test]
    // fn on_near() -> Result<()> {
    //     let oracle_info = OracleInfo::from_slug("near", "testnet").unwrap();
    //     let payer = Payer {
    //         account_id: Some("YOUR_ACCOUNT_ID_HERE".to_string()),
    //         secret_key: "YOUR_PRIVATE_KEY_HERE".to_string()
    //     };
    //     // Runtime::new().unwrap().block_on(oracle_info.create("feed1", Some(0), Some(payer.clone())))?;

    //     // let res = Runtime::new().unwrap().block_on(oracle_info.get_last_value("feed1"))?;
    //     // println!("{:?}", res);

    //     // Runtime::new().unwrap().block_on(oracle_info.update("feed1", Some(1), Some(payer.clone())))?;

    //     // let res = Runtime::new().unwrap().block_on(oracle_info.get_last_value("crypto.sol.usdt"))?;
    //     // println!("{:?}", res);

    //     Runtime::new().unwrap().block_on(oracle_info.delete("feed1", Some(payer.clone())))?;

    //     Ok(())
    // }
}
