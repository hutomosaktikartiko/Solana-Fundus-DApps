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

    pub fn create_campaign(
        ctx: Context<CreateCampaignCtx>,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        instructions::create_campaign(ctx, title, description, image_url, goal)
    }

    pub fn update_campaign(
        ctx: Context<UpdateCampaignCtx>,
        cid: u64,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        instructions::update_campaign(ctx, cid, title, description, image_url, goal)
    }

    pub fn delete_campaign(ctx: Context<DeleteCampaignCtx>, cid: u64) -> Result<()> {
        instructions::delete_campaign(ctx, cid)
    }
}
