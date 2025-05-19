# Fundus Smart Contracts Documentation

## Overview

Fundus is a Solana-based crowdfunding platform that allows users to create campaigns, donate to campaigns, and manage funds. The platform includes a fee system for sustainability and various campaign management features.

## Program ID

```
5PeV8PheeQXh5FvUawGfDQhYMPuazPK5bNGDSY4TuHcs
```

## Instructions

### 1. Initialize

Initializes the platform with necessary accounts and settings.

```rust
pub fn initialize(ctx: Context<InitalizeCtx>) -> Result<()>
```

**Context:**

- `InitalizeCtx`: Contains the platform authority and initial settings

**Purpose:**

- Sets up the platform's initial state
- Creates necessary PDA accounts
- Initializes platform settings

### 2. Create Campaign

Creates a new fundraising campaign.

```rust
pub fn create_campaign(
    ctx: Context<CreateCampaignCtx>,
    title: String,
    description: String,
    image_url: String,
    goal: u64,
) -> Result<()>
```

**Parameters:**

- `title`: Campaign title
- `description`: Campaign description
- `image_url`: URL to campaign image
- `goal`: Fundraising goal in lamports

**Context:**

- `CreateCampaignCtx`: Contains campaign creator and campaign account

**Purpose:**

- Creates a new campaign account
- Initializes campaign state
- Sets campaign metadata

### 3. Update Campaign

Updates an existing campaign's details.

```rust
pub fn update_campaign(
    ctx: Context<UpdateCampaignCtx>,
    cid: u64,
    title: String,
    description: String,
    image_url: String,
    goal: u64,
) -> Result<()>
```

**Parameters:**

- `cid`: Campaign ID
- `title`: New campaign title
- `description`: New campaign description
- `image_url`: New campaign image URL
- `goal`: New fundraising goal

**Context:**

- `UpdateCampaignCtx`: Contains campaign authority and campaign account

**Purpose:**

- Updates campaign metadata
- Modifies fundraising goal
- Only campaign creator can update

### 4. Delete Campaign

Deletes an existing campaign.

```rust
pub fn delete_campaign(ctx: Context<DeleteCampaignCtx>, cid: u64) -> Result<()>
```

**Parameters:**

- `cid`: Campaign ID to delete

**Context:**

- `DeleteCampaignCtx`: Contains campaign authority and campaign account

**Purpose:**

- Removes campaign from the platform
- Only campaign creator can delete
- Handles fund distribution if any

### 5. Donate

Donates funds to a campaign.

```rust
pub fn donate(ctx: Context<DonateCtx>, cid: u64, amount: u64) -> Result<()>
```

**Parameters:**

- `cid`: Campaign ID to donate to
- `amount`: Donation amount in lamports

**Context:**

- `DonateCtx`: Contains donor, campaign account, and platform accounts

**Purpose:**

- Transfers funds from donor to campaign
- Calculates and collects platform fee
- Updates campaign total raised

### 6. Withdraw

Withdraws funds from a campaign.

```rust
pub fn withdraw(ctx: Context<WithdrawCtx>, cid: u64, amount: u64) -> Result<()>
```

**Parameters:**

- `cid`: Campaign ID to withdraw from
- `amount`: Amount to withdraw in lamports

**Context:**

- `WithdrawCtx`: Contains campaign authority and campaign account

**Purpose:**

- Allows campaign creator to withdraw funds
- Verifies withdrawal amount is available
- Updates campaign balance

### 7. Update Platform Settings

Updates platform-wide settings.

```rust
pub fn update_platform_settings(
    ctx: Context<UpdatePlatformSettingsCtx>,
    new_platform_fee: u64,
) -> Result<()>
```

**Parameters:**

- `new_platform_fee`: New platform fee percentage

**Context:**

- `UpdatePlatformSettingsCtx`: Contains platform authority

**Purpose:**

- Modifies platform fee structure
- Only platform authority can update
- Affects future donations

## State Accounts

### Campaign Account

- Stores campaign metadata
- Tracks fundraising progress
- Manages campaign funds

### Platform Account

- Stores platform settings
- Manages platform fees
- Tracks platform statistics

## Security Considerations

1. **Access Control**

   - Campaign updates restricted to creators
   - Platform settings restricted to authority
   - Withdrawals restricted to campaign creators

2. **Fund Management**

   - Fee calculations handled on-chain
   - Withdrawal amount validations
   - Secure fund transfers

3. **Data Validation**
   - Input validation for all parameters
   - State consistency checks
   - Error handling for edge cases

## Error Handling

The program includes custom error types for various scenarios:

- Invalid authority
- Insufficient funds
- Invalid campaign state
- Invalid parameters
- Platform errors

## Testing

Run tests using:

```bash
cd anchor
anchor test --skip-local-validator --skip-deploy
```

## Deployment

The program can be deployed to:

- Local network (for development)
- Devnet (for testing)
- Mainnet (for production)

To deploy the program:

```bash
cd anchor
anchor deploy
```

Ensure proper program ID configuration before deployment.
