use anchor_lang::prelude::*;

/// Errors that may be returned by the program.
#[error_code]
pub enum Error {
  #[msg("Lamport balance below rent-exempt threshold")]
  NotRentExempt,

  #[msg("Insufficient funds")]
  InsufficientFunds,

  #[msg("Owner does not match")]
  OwnerMismatch,

  #[msg("Missing signature")]
  MissingSignature,

  #[msg("Signature format is invalid")]
  InvalidSignature,

  #[msg("Invalid oracle")]
  InvalidOracle,

  #[msg("Oracle is unititialized")]
  UninitializedOracle,

  #[msg("Invalid instruction")]
  InvalidInstruction,

  #[msg("State is invalid for requested operation")]
  InvalidState,

  #[msg("Value format is not support")]
  InvalidValue,

  #[msg("Cannot connect to validtor cluster")]
  InvalidNetwork,

  #[msg("Error in the underlying RPC")]
  RpcError,

  #[msg("Internal system error")]
  IoError,

  #[msg("Solana program error")]
  ProgramError,
}
