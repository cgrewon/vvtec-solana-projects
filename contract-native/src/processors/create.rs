use borsh::BorshSerialize;
use vvtec::{Error, Feed};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  clock::Clock,
  entrypoint::ProgramResult,
  msg,
  program::invoke_signed,
  program_error::ProgramError,
  pubkey::Pubkey,
  system_instruction,
  sysvar::Sysvar,
};
use std::mem::size_of;

pub(crate) fn process_create(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  initial_balance: u64,
  feed: Feed,
) -> ProgramResult {
  msg!("processing feed create");

  let accounts_iter = &mut accounts.iter();
  let payer = next_account_info(accounts_iter)?;
  let owner = next_account_info(accounts_iter)?;
  let oracle = next_account_info(accounts_iter)?;

  if owner.key == &Pubkey::default() {
    msg!("The owner cannot be zero");
    return Err(ProgramError::InvalidArgument);
  }

  if feed.name.len() > 32 {
    msg!("Oracle name must be less than 32 bytes");
    return Err(ProgramError::InvalidArgument);
  }

  let (expected_oracle_acc, seed_bump) =
    Pubkey::find_program_address(&[&feed.name], program_id);

  if !payer.is_signer {
    return Err(Error::MissingSignature.into());
  }

  if &expected_oracle_acc != oracle.key {
    return Err(Error::InvalidOracle.into());
  }

  // allocate oracle account
  invoke_signed(
    &system_instruction::create_account(
      payer.key,
      oracle.key,
      initial_balance,
      size_of::<Feed>() as u64,
      program_id,
    ),
    &[payer.clone(), oracle.clone()],
    &[&[&feed.name, &[seed_bump]]],
  )?;

  let mut feed = feed;
  feed.updated_at = Clock::get()?.unix_timestamp;
  Ok(feed.serialize(&mut oracle.data.borrow_mut().as_mut())?)
}
