use std::mem::size_of;

use borsh::{BorshDeserialize, BorshSerialize};
use vvtec::{Error, Feed, FeedValue};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  clock::Clock,
  entrypoint::ProgramResult,
  msg,
  program_error::ProgramError,
  program_pack::IsInitialized,
  pubkey::Pubkey,
  sysvar::Sysvar,
};

fn get_account_data<T: BorshDeserialize + IsInitialized>(
  account_info: &AccountInfo,
  owner_program_id: &Pubkey,
) -> Result<T, ProgramError> {
  if account_info.data_is_empty() {
    return Err(ProgramError::UninitializedAccount);
  }
  if account_info.owner != owner_program_id {
    return Err(Error::OwnerMismatch.into());
  }

  let account: T = solana_program::borsh::try_from_slice_unchecked(
    &account_info.data.borrow()[..size_of::<Feed>()],
  )?;
  if !account.is_initialized() {
    Err(ProgramError::UninitializedAccount)
  } else {
    Ok(account)
  }
}

pub(crate) fn process_update(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  value: Option<FeedValue>,
) -> ProgramResult {
  let accounts_iter = &mut accounts.iter();
  let owner = next_account_info(accounts_iter)?;
  let oracle = next_account_info(accounts_iter)?;

  if owner.key == &Pubkey::default() {
    msg!("The owner cannot be zero");
    return Err(ProgramError::InvalidArgument);
  }

  if !owner.is_signer {
    msg!("missing oracle owner signature");
    return Err(Error::MissingSignature.into());
  }

  let mut feed = get_account_data::<Feed>(oracle, program_id)?;

  if feed.owner != *owner.key {
    return Err(Error::OwnerMismatch.into());
  }

  feed.value = value;
  feed.updated_at = Clock::get()?.unix_timestamp;
  Ok(feed.serialize(&mut oracle.data.borrow_mut().as_mut())?)
}
