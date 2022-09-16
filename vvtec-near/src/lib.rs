use near_sdk::{
  borsh::{self, BorshDeserialize, BorshSerialize},
  collections::UnorderedMap,
  env,
  json_types::{U64, U128},
  near_bindgen,
  serde::{Deserialize, Serialize},
  AccountId, BorshStorageKey,
};

const FEED_NAME_MAX_LEN: usize = 32;

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
  Oracle,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Feed {
  /// The owner of this feed.
  ///
  /// Only owners have write-access to feeds, including adding or removing child
  /// feeds, or setting a leaf value to some sequence of bytes.
  pub owner: AccountId,

  /// Human-readable name of this feed.
  ///
  /// This name may contain only lowercase letters, digits 0-9 and dashes `-`.
  /// The length is also limited to [`FEED_NAME_MAX_LEN`].
  pub name: String,

  /// A timestamp of the most recent update of the feed value.
  /// This value is provided by the [`near_sdk::env::block_timestamp_ms`]
  /// automatically during updates.
  pub updated_at: u64,

  /// The value that is stored within a single feed. In most cases, intermediate
  /// nodes or non-leaf feeds will be None (although some may decide to have a
  /// summary value for their children), and leaf feeds will have concrete values.
  pub value: Option<U128>,
}

/// Onchain state.
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Vvtec {
  /// Maps oracles names to their values.
  feeds: UnorderedMap<String, Feed>,
}

#[near_bindgen]
impl Vvtec {
  pub fn create(&mut self, name: String, value: Option<U128>) {
    assert!(
      name.len() <= FEED_NAME_MAX_LEN,
      "Feed name must be less than 32 characters"
    );
    assert!(
      is_valid_name(name.as_bytes()),
      "Feed name contains invalid characters"
    );

    let feed = Feed {
      owner: env::signer_account_id(),
      name,
      updated_at: env::block_timestamp_ms(),
      value,
    };

    assert!(
      self.feeds.insert(&feed.name, &feed).is_none(),
      "Feed already exists"
    );
  }

  pub fn update(&mut self, name: String, value: Option<U128>) {
    let mut feed = self.feeds.get(&name).expect("Unknown feed");
    assert_eq!(
      feed.owner,
      env::signer_account_id(),
      "Missing feed owner signature"
    );

    feed.updated_at = env::block_timestamp_ms();
    feed.value = value;

    self.feeds.insert(&name, &feed);
  }

  pub fn delete(&mut self, name: String) {
    let owner = self.feeds.get(&name).expect("Unknown feed").owner;
    assert_eq!(
      owner,
      env::signer_account_id(),
      "Missing feed owner signature"
    );

    self.feeds.remove(&name);
  }

  pub fn read(&self, name: String) -> (ReadResult, u64) {
    match self.feeds.get(&name) {
      Some(feed) => (ReadResult::KnownFeed(feed.value), feed.updated_at),
      None => (ReadResult::UnknownFeed, 0),
    }
  }

  pub fn num_feeds(&self) -> U64 {
    U64(self.feeds.len())
  }
}

#[derive(
  Debug, Eq, PartialEq, BorshDeserialize, BorshSerialize, Serialize, Deserialize,
)]
pub enum ReadResult {
  UnknownFeed,
  KnownFeed(Option<U128>),
}

impl Default for Vvtec {
  fn default() -> Self {
    Self {
      feeds: UnorderedMap::new(StorageKey::Oracle),
    }
  }
}

fn is_valid_name(bytes: &[u8]) -> bool {
  bytes.len() <= 32
    && bytes.iter().all(|b| {
      *b == b'_'
        || *b == b'.'
        || (b'0' <= *b && *b <= b'9')
        || (b'a' <= *b && *b <= b'z')
    })
}

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
