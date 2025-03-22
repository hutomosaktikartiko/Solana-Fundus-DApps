use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
#[allow(unused_imports)]
use states::*;

// Program ID declaration (replace with your own ID when deploying)
declare_id!("5Z1U7HwvHvLyaSqcKAa9VrydcVoDGhT6NC8SWMqERB6A");

#[program]
pub mod fundus {
    use super::*;

    pub fn initialize(ctx: Context<InitalizeCtx>) -> Result<()> {
        instructions::initialize(ctx)
    }
}
