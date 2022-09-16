use anchor_lang::prelude::*;

/// The data in a an oracle feed is always prefixed with this structure.
/// The remainder of the datata in a specific feed depends on the `class`
#[account]
pub struct Oracle {
    /// The owner of this feed.
    ///
    /// Only owners have write-access to feeds, including adding or removing child
    /// feeds, or setting a leaf value to some sequence of bytes.
    pub owner: Pubkey,

    /// A UTF-8 encoded human-readable name of this feed.
    ///
    /// This name is used in hash calculation along with its parent
    /// This name may contain only lowercase letters, digits 0-9 and dashes `-`.
    pub name: [u8; 32],

    /// A unix timestamp of the most recent update of the feed value.
    /// This value is provided by the validator sysclock account
    /// automatically during updates.
    pub updated_at: i64,

    /// The value that is stored within a single feed. In most cases, intermediate
    /// nodes or non-leaf feeds will be None (although some may decide to have a
    /// summary value for their children), and leaf feeds will have concrete values.
    pub value: Option<u128>,
}
