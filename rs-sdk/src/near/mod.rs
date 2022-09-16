use crate::{OracleResponse, Payer};
use anyhow::{anyhow, Result};
use near_jsonrpc_client::{methods, JsonRpcClient};
use near_jsonrpc_primitives::types::query::QueryResponseKind;
use near_primitives::{
    transaction::{Action, FunctionCallAction, Transaction},
    types::{BlockReference, Finality, FunctionArgs},
    views::{FinalExecutionStatus::{SuccessValue, Failure}, QueryRequest},
};
use serde::Deserialize;
use serde_json::{from_slice, json};

#[derive(Debug, Deserialize)]
pub enum ReadResult {
    UnknownFeed,
    KnownFeed(Option<String>),
}

pub enum NearNetwork {
    Mainnet,
    Testnet,
    Betanet,
}

impl NearNetwork {
    pub const TESTNET_SLUG: &'static str = "testnet";
    pub const BETANET_SLUG: &'static str = "betanet";
    pub const MAINNET_SLUG: &'static str = "mainnet";

    pub const CONTRACT_ID: &'static str = "rocalex-oracle.testnet";

    pub fn from_slug(slug: &str) -> Option<Self> {
        match slug {
            Self::TESTNET_SLUG => Some(Self::Testnet),
            Self::BETANET_SLUG => Some(Self::Betanet),
            Self::MAINNET_SLUG => Some(Self::Mainnet),
            _ => None,
        }
    }

    fn slug(&self) -> &'static str {
        match self {
            NearNetwork::Testnet => Self::TESTNET_SLUG,
            NearNetwork::Betanet => Self::BETANET_SLUG,
            NearNetwork::Mainnet => Self::MAINNET_SLUG,
        }
    }

    pub async fn create_feed(&self, name: &str, value: Option<u128>, payer: Payer) -> Result<()> {
        let client = JsonRpcClient::connect(format!("https://rpc.{}.near.org", self.slug()));

        let signer_account_id = payer.account_id.unwrap().parse()?;
        let signer_secret_key = payer.secret_key.parse()?;

        let signer =
            near_crypto::InMemorySigner::from_secret_key(signer_account_id, signer_secret_key);

        let access_key_query_response = client
            .call(methods::query::RpcQueryRequest {
                block_reference: BlockReference::latest(),
                request: near_primitives::views::QueryRequest::ViewAccessKey {
                    account_id: signer.account_id.clone(),
                    public_key: signer.public_key.clone(),
                },
            })
            .await?;

        let current_nonce = match access_key_query_response.kind {
            QueryResponseKind::AccessKey(access_key) => access_key.nonce,
            _ => return Err(anyhow!("failed to extract current nonce")),
        };

        let args = match value {
            Some(v) => json!({
                "name": name,
                "value": v.to_string()
            })
            .to_string()
            .into_bytes(),

            None => json!({
                "name": name,
            })
            .to_string()
            .into_bytes(),
        };

        let transaction = Transaction {
            signer_id: signer.account_id.clone(),
            public_key: signer.public_key.clone(),
            nonce: current_nonce + 1,
            receiver_id: Self::CONTRACT_ID.parse()?,
            block_hash: access_key_query_response.block_hash,
            actions: vec![Action::FunctionCall(FunctionCallAction {
                method_name: "create".to_string(),
                args,
                gas: 3_000_000_000_000, // 3 TeraGas
                deposit: 0,
            })],
        };

        let request = methods::broadcast_tx_commit::RpcBroadcastTxCommitRequest {
            signed_transaction: transaction.sign(&signer),
        };

        let res = client.call(request).await?;

        match res.status {
            SuccessValue(_) => Ok(()),
            Failure(e) => Err(anyhow!(e.to_string())),
            _ => todo!(),
        }
    }

    pub async fn update_feed(&self, name: &str, value: Option<u128>, payer: Payer) -> Result<()> {
        let client = JsonRpcClient::connect(format!("https://rpc.{}.near.org", self.slug()));

        let signer_account_id = payer.account_id.unwrap().parse()?;
        let signer_secret_key = payer.secret_key.parse()?;

        let signer =
            near_crypto::InMemorySigner::from_secret_key(signer_account_id, signer_secret_key);

        let access_key_query_response = client
            .call(methods::query::RpcQueryRequest {
                block_reference: BlockReference::latest(),
                request: near_primitives::views::QueryRequest::ViewAccessKey {
                    account_id: signer.account_id.clone(),
                    public_key: signer.public_key.clone(),
                },
            })
            .await?;

        let current_nonce = match access_key_query_response.kind {
            QueryResponseKind::AccessKey(access_key) => access_key.nonce,
            _ => return Err(anyhow!("failed to extract current nonce")),
        };

        let args = match value {
            Some(v) => json!({
                "name": name,
                "value": v.to_string()
            })
            .to_string()
            .into_bytes(),

            None => json!({
                "name": name,
            })
            .to_string()
            .into_bytes(),
        };

        let transaction = Transaction {
            signer_id: signer.account_id.clone(),
            public_key: signer.public_key.clone(),
            nonce: current_nonce + 1,
            receiver_id: Self::CONTRACT_ID.parse()?,
            block_hash: access_key_query_response.block_hash,
            actions: vec![Action::FunctionCall(FunctionCallAction {
                method_name: "update".to_string(),
                args,
                gas: 3_000_000_000_000, // 3 TeraGas
                deposit: 0,
            })],
        };

        let request = methods::broadcast_tx_commit::RpcBroadcastTxCommitRequest {
            signed_transaction: transaction.sign(&signer),
        };

        let res = client.call(request).await?;

        match res.status {
            SuccessValue(_) => Ok(()),
            Failure(e) => Err(anyhow!(e.to_string())),
            _ => todo!(),
        }
    }

    pub async fn delete_feed(&self, name: &str, payer: Payer) -> Result<()> {
        let client = JsonRpcClient::connect(format!("https://rpc.{}.near.org", self.slug()));

        let signer_account_id = payer.account_id.unwrap().parse()?;
        let signer_secret_key = payer.secret_key.parse()?;

        let signer =
            near_crypto::InMemorySigner::from_secret_key(signer_account_id, signer_secret_key);

        let access_key_query_response = client
            .call(methods::query::RpcQueryRequest {
                block_reference: BlockReference::Finality(Finality::Final),
                request: near_primitives::views::QueryRequest::ViewAccessKey {
                    account_id: signer.account_id.clone(),
                    public_key: signer.public_key.clone(),
                },
            })
            .await?;

        let current_nonce = match access_key_query_response.kind {
            QueryResponseKind::AccessKey(access_key) => access_key.nonce,
            _ => return Err(anyhow!("failed to extract current nonce")),
        };

        let transaction = Transaction {
            signer_id: signer.account_id.clone(),
            public_key: signer.public_key.clone(),
            nonce: current_nonce + 1,
            receiver_id: Self::CONTRACT_ID.parse()?,
            block_hash: access_key_query_response.block_hash,
            actions: vec![Action::FunctionCall(FunctionCallAction {
                method_name: "delete".to_string(),
                args: json!({
                    "name": name,
                })
                .to_string()
                .into_bytes(),
                gas: 3_000_000_000_000, // 3 TeraGas
                deposit: 0,
            })],
        };

        let request = methods::broadcast_tx_commit::RpcBroadcastTxCommitRequest {
            signed_transaction: transaction.sign(&signer),
        };

        let res = client.call(request).await?;

        match res.status {
            SuccessValue(_) => Ok(()),
            Failure(e) => Err(anyhow!(e.to_string())),
            _ => todo!(),
        }
    }

    pub async fn get_last_value(&self, name: &str) -> Result<OracleResponse> {
        let client = JsonRpcClient::connect(format!("https://rpc.{}.near.org", self.slug()));
        let request = methods::query::RpcQueryRequest {
            block_reference: BlockReference::Finality(Finality::Final),
            request: QueryRequest::CallFunction {
                account_id: Self::CONTRACT_ID.parse()?,
                method_name: "read".to_string(),
                args: FunctionArgs::from(json!({ "name": name }).to_string().into_bytes()),
            },
        };

        let response = client.call(request).await?;
        if let QueryResponseKind::CallResult(result) = response.kind {
            let feed = from_slice::<(ReadResult, u64)>(&result.result)?;
            return match feed.0 {
                ReadResult::KnownFeed(value) => match value {
                    Some(v) => Ok(OracleResponse(Some(v.parse::<u128>().unwrap()), feed.1 as i64)),
                    None => Ok(OracleResponse(None, feed.1 as i64)),
                },
                ReadResult::UnknownFeed => Err(anyhow!("unknown feed")),
            };
        };
        Err(anyhow!("parsing error"))
    }
}
