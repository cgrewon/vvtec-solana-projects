use crate::processors::{
  create::process_create, delete::process_delete, update::process_update,
};
use borsh::BorshDeserialize;
use vvtec::OracleInstruction;
use solana_program::{
  account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
  program_error::ProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);
fn process_instruction(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  instruction_data: &[u8],
) -> ProgramResult {
  msg!("Solana smart contract began processing instructions");

  let instruction = OracleInstruction::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

  match instruction {
    OracleInstruction::Create { feed, balance } => {
      process_create(program_id, accounts, balance, feed)
    }

    OracleInstruction::Update(value) => {
      process_update(program_id, accounts, value)
    }

    OracleInstruction::Delete => process_delete(program_id, accounts),
  }
}
