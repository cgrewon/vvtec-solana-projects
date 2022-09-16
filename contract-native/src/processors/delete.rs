use solana_program::{
  account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};

pub(crate) fn process_delete(
  _program_id: &Pubkey,
  _accounts: &[AccountInfo],
) -> ProgramResult {
  msg!("processing feed delete");
  todo!()
}
