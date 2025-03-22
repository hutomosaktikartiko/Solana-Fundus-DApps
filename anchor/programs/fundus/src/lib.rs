use anchor_lang::prelude::*;

// Program ID declaration (replace with your own ID when deploying)
declare_id!("AWMHjJYpfc8iDrHRALDryZtw8X2FQubnwH5ztGnxSatu");

#[program]
pub mod fundus {
    use super::*;

    /// Sets a greeting message in the account.
    pub fn set_greeting(ctx: Context<SetGreeting>, message: String) -> Result<()> {
        let greeting_account = &mut ctx.accounts.greeting_account;
        greeting_account.message = message;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetGreeting<'info> {
    #[account(init, payer = user, space = 8 + 64)] // 64 bytes for message string
    pub greeting_account: Account<'info, GreetingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GreetingAccount {
    pub message: String, // Stores the greeting message
}
