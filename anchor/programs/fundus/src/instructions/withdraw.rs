use crate::constants::ANCHOR_DISCRIMINATOR_SIZE;
use crate::errors::ErrorCode::*;
use crate::states::{Campaign, ProgramState, Transaction};
use anchor_lang::solana_program::address_lookup_table::instruction;
use anchor_lang::{accounts, prelude::*};

pub fn withdraw(ctx: Context<WithdrawCtx>, cid: u64, amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let creator = &ctx.accounts.withdrawer;
    let transaction = &mut ctx.accounts.transaction;
    let state = &mut ctx.accounts.program_state;
    let platform_account_info = &ctx.accounts.platform_address;

    if campaign.cid != cid {
        return Err(CampaignNotFound.into());
    }

    if campaign.creator != creator.key() {
        return Err(Unauthorized.into());
    }

    if amount <= 1_000_000_000 {
        return Err(InvalidWithdrawalAmount.into());
    }

    if amount > campaign.balance {
        return Err(InsufficientFund.into());
    }

    if platform_account_info.key() != state.platform_address {
        return Err(InvalidPlatformAddress.into());
    }

    // Comparing amount against usable balance
    let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
    if amount > **campaign.to_account_info().lamports.borrow() - rent_balance {
        msg!("Withdrawal exceed campaign's usable balance");
        return Err(InsufficientFund.into());
    }

    let platform_fee = amount * state.platform_fee / 100;
    let creator_amount = amount - platform_fee;

    // Transferring 95% to campaign creator
    **campaign.to_account_info().try_borrow_mut_lamports()? -= creator_amount;
    **creator.to_account_info().try_borrow_mut_lamports()? += creator_amount;

    // Transferring 5% to platform
    **campaign.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
    **platform_account_info
        .to_account_info()
        .try_borrow_mut_lamports()? += platform_fee;

    campaign.withdrawals += 1;
    campaign.balance -= amount;

    transaction.amount = amount;
    transaction.cid = cid;
    transaction.owner = creator.key();
    transaction.timestamp = Clock::get()?.unix_timestamp as u64;
    transaction.credited = false;

    Ok(())
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct WithdrawCtx<'info> {
    #[account(
        mut,
        seeds = [
            b"Campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = withdrawer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            b"withdraw",
            withdrawer.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.withdrawals + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: We are passing the account to be used for receiving the platform charges as the
    #[account(mut)]
    pub platform_address: AccountInfo<'info>,

    #[account(mut)]
    pub withdrawer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
