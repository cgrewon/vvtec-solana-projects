use near_sdk::json_types::{U64, U128};

use vvtec_near::ReadResult;
// macro allowing us to convert args into JSON bytes to be read by the contract.
use serde_json::json;

// Additional convenient imports that allows workspaces to function readily.
use workspaces::{
  network::{NetworkClient, NetworkInfo},
  prelude::*,
  result::CallExecutionDetails,
  Account, Contract, Worker,
};

async fn read<T: NetworkClient + NetworkInfo + Send + Sync>(
  contract: &Contract,
  worker: &Worker<T>,
  name: &str,
) -> (ReadResult, u64) {
  contract
    .call(worker, "read")
    .args_json(json!({ "name": name }))
    .unwrap()
    .view()
    .await
    .unwrap()
    .json()
    .unwrap()
}

async fn create<T: NetworkClient + NetworkInfo + Send + Sync>(
  account: &Account,
  contract: &Contract,
  worker: &Worker<T>,
  name: &str,
  value: Option<U128>,
) -> anyhow::Result<CallExecutionDetails> {
  account
    .call(&worker, contract.id(), "create")
    .args_json(json!({"name": name, "value": value}))?
    .transact()
    .await
}

async fn update<T: NetworkClient + NetworkInfo + Send + Sync>(
  account: &Account,
  contract: &Contract,
  worker: &Worker<T>,
  name: &str,
  value: Option<U128>,
) -> anyhow::Result<CallExecutionDetails> {
  account
    .call(&worker, contract.id(), "update")
    .args_json(json!({"name": name, "value": value}))?
    .transact()
    .await
}

async fn delete<T: NetworkClient + NetworkInfo + Send + Sync>(
  account: &Account,
  contract: &Contract,
  worker: &Worker<T>,
  name: &str,
) -> anyhow::Result<CallExecutionDetails> {
  account
    .call(&worker, contract.id(), "delete")
    .args_json(json!({ "name": name }))?
    .transact()
    .await
}

async fn num_feeds<T: NetworkClient + NetworkInfo + Send + Sync>(
  contract: &Contract,
  worker: &Worker<T>,
) -> U64 {
  contract
    .call(&worker, "num_feeds")
    .args_json(json!({}))
    .unwrap()
    .view()
    .await
    .unwrap()
    .json()
    .unwrap()
}

#[tokio::test]
async fn test_contract() -> anyhow::Result<()> {
  tracing_subscriber::fmt::init();
  let worker = workspaces::sandbox().await?;

  let wasm = include_bytes!(
    "../../target/wasm32-unknown-unknown/release/vvtec_near.wasm"
  );

  let contract = worker.dev_deploy(wasm).await?;

  let root_account = worker.root_account()?;
  println!("Root account: {:?}", root_account.id());
  let subaccount = root_account
    .create_subaccount(&worker, "sub1")
    .initial_balance(10_000_000_000_000_000_000_000_000)
    .transact()
    .await
    .unwrap()
    .unwrap();
  println!("Subaccount: {:?}", subaccount.id());

  // The initial number of feeds is zero.
  assert_eq!(num_feeds(&contract, &worker).await.0, 0);

  // Value of unknown feed.
  assert_eq!(
    read(&contract, &worker, "dummy").await.0,
    ReadResult::UnknownFeed
  );

  // Create a feed.
  create(
    &root_account,
    &contract,
    &worker,
    "feed1",
    Some(U128(1)),
  )
  .await
  .unwrap();

  // check initial feed value
  assert_eq!(
    read(&contract, &worker, "feed1").await.0,
    ReadResult::KnownFeed(Some(U128(1)))
  );

  // Create another feed.
  create(
    &subaccount,
    &contract,
    &worker,
    "feed2",
    Some(U128(u128::MAX)),
  )
  .await
  .unwrap();

  // check initial feed value
  assert_eq!(
    read(&contract, &worker, "feed2").await.0,
    ReadResult::KnownFeed(Some(U128(u128::MAX)))
  );

  // Create third feed.
  create(&root_account, &contract, &worker, "feed3", None)
    .await
    .unwrap();

  // check initial feed value
  assert_eq!(
    read(&contract, &worker, "feed3").await.0,
    ReadResult::KnownFeed(None)
  );

  // Now there are three feeds,
  assert_eq!(num_feeds(&contract, &worker).await.0, 3);

  // Client shouldn't be able to create existing feed.
  let result = create(
    &root_account,
    &contract,
    &worker,
    "feed1",
    Some(U128(0)),
  )
  .await;
  assert!(result
    .unwrap_err()
    .to_string()
    .contains("Feed already exists"));

  // check that feed1 value is not affected
  assert_eq!(
    read(&contract, &worker, "feed1").await.0,
    ReadResult::KnownFeed(Some(U128(1)))
  );

  // There are still three feeds
  assert_eq!(num_feeds(&contract, &worker).await.0, 3);

  // Update feed value
  update(
    &root_account,
    &contract,
    &worker,
    "feed1",
    Some(U128(0)),
  )
  .await
  .unwrap();
  assert_eq!(
    read(&contract, &worker, "feed1").await.0,
    ReadResult::KnownFeed(Some(U128(0)))
  );

  // Only owner should be able to update a feed.
  let result = update(&root_account, &contract, &worker, "feed2", None).await;
  assert!(result
    .unwrap_err()
    .to_string()
    .contains("Missing feed owner signature"));

  // Update feed that does not exist
  let result = update(
    &root_account,
    &contract,
    &worker,
    "feed4",
    Some(U128(0)),
  )
  .await;
  assert!(result.unwrap_err().to_string().contains("Unknown feed"));

  // Delete feed
  delete(&root_account, &contract, &worker, "feed3")
    .await
    .unwrap();
  assert_eq!(
    read(&contract, &worker, "feed3").await.0,
    ReadResult::UnknownFeed
  );

  // Only owner should be able to delete a feed.
  let result = delete(&root_account, &contract, &worker, "feed2").await;
  assert!(result
    .unwrap_err()
    .to_string()
    .contains("Missing feed owner signature"));

  // Delete another feed
  delete(&subaccount, &contract, &worker, "feed2")
    .await
    .unwrap();
  assert_eq!(
    read(&contract, &worker, "feed3").await.0,
    ReadResult::UnknownFeed
  );

  // Now there are two feeds
  assert_eq!(num_feeds(&contract, &worker).await.0, 1);

  // Delete feed that does not exist
  let result = delete(&root_account, &contract, &worker, "feed3").await;
  assert!(result.unwrap_err().to_string().contains("Unknown feed"));

  Ok(())
}
