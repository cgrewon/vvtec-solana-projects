mod error;

// reexport
pub use error::Error;

pub type Result<T> = std::result::Result<T, Error>;

pub mod state;

use anchor_lang::prelude::*;

use state::Oracle;

declare_id!("vvtecC41zqsHouFA6EqSdcyJL9MdL9sk8E3pZWNQzyAY");

#[allow(unused_variables)]
#[program]
pub mod vvtec_onchain {
    use super::*;

    pub fn create(ctx: Context<Create>, feed: Feed) -> Result<()> {
        Ok(())
    }

    pub fn update(ctx: Context<Update>, value: Option<u128>) -> Result<()> {
        Ok(())
    }

    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(feed: Oracle)]
pub struct Create<'info> {
    #[account(mut)]
    payer: Signer<'info>,
    #[account(
        init, 
        payer = payer, 
        space = 8 + 89, 
        seeds = [&feed.name],
        bump
    )]
    oracle: Account<'info, Oracle>,
    pub system_program: Program<'info, System>,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize)]
pub struct Feed {
    pub owner: Pubkey,
    pub name: [u8; 32],
    pub value: Option<u128>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        mut,
        seeds = [&oracle.name],
        bump,
        has_one = owner,
    )]
    oracle: Account<'info, Oracle>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        mut,
        seeds = [&oracle.name],
        bump,
        has_one = owner,
        close = owner,
    )]
    oracle: Account<'info, Oracle>,
}
