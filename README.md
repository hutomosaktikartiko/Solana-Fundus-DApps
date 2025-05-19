# Fundus - Solana Web3 Application

A Next.js-based web application for interacting with Solana blockchain, built with Anchor framework.

## Documentation

- [Smart Contracts Documentation](./SMART_CONTRACTS.md) - Detailed documentation of the Solana program instructions, state accounts, and security considerations

## Requirements

- Node.js (v16 or higher)
- Rust and Cargo
- Solana CLI tools
- Anchor Framework
- Yarn (for Next.js) and pnpm (for Anchor)

## Environment Setup

1. Copy `.env_example` to `.env`:

```bash
cp .env_example .env
```

2. Configure the following environment variables in `.env`:

- `NEXT_PUBLIC_CLUSTER`: The Solana cluster to connect to (e.g., "mainnet-beta", "testnet", "devnet", "localhost")
- `PRIVATE_KEY`: Your wallet's private key (keep this secure and never commit to version control)
  - This wallet is used for initializing contracts and performing administrative operations
  - Make sure this wallet has enough SOL for deployment and transaction fees
- `ADDRESS`: Your wallet's public address
  - This should match the public key derived from your private key
  - Used for contract initialization and verification

## Building and Running

### 1. Install Dependencies

For Anchor program:

```bash
pnpm install
```

For Next.js application:

```bash
yarn install
```

### 2. Build Anchor Program

First, navigate to the anchor directory:

```bash
cd anchor
```

Then build the program:

```bash
anchor build
```

Note: All anchor-related commands must be run from within the `anchor` directory. You can either:

- Change directory to `anchor` first, or
- Use the provided npm scripts that handle the directory change automatically

### 3. Deploy Program

To deploy the program to your chosen cluster:

```bash
anchor deploy
```

### 4. Initialize Program (Required)

The initialization script must be run to set up the contract state. This is a required step before using the application:

```bash
npx esrun src/scripts/init.ts
```

This script will:

- Initialize the contract with necessary parameters
- Set up required accounts
- Configure initial state

### 5. Development

For Next.js application:

```bash
yarn dev
```

### 6. Production Build

```bash
yarn build
yarn start
```

## Cluster Options

### Local Development

If using localhost cluster:

1. Start a local Solana validator:

```bash
solana-test-validator --reset
```

### Available Clusters

- `mainnet-beta`: Production Solana network
- `testnet`: Solana test network
- `devnet`: Solana development network
- `localhost`: Local development network

## Project Structure

- `/anchor`: Solana program code
  - Contains all Solana program-related files
  - Must be in this directory to run anchor commands
  - Includes program logic, tests, and deployment configurations
- `/src`: Next.js application code
  - `/components`: React components
  - `/hooks`: Custom React hooks
  - `/scripts`: Utility scripts
  - `/store`: State management
  - `/utils`: Helper functions
- `/public`: Static assets
- `/test-ledger`: Test configuration and data

## Testing

Run Anchor tests (from the anchor directory):

```bash
cd anchor
anchor test --skip-local-validator --skip-deploy
```

Note: The `--skip-local-validator` flag is used when you're running your own validator, and `--skip-deploy` is used when you want to skip the deployment step.

## Technologies Used

- Next.js 14
- Solana Web3.js
- Anchor Framework
- TailwindCSS
- DaisyUI
- React Query
- Redux Toolkit
- TypeScript

## License

This project is licensed under the terms of the license included in the repository.

## Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project in Vercel:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Select the repository

3. Configure Environment Variables:

   - In your project settings on Vercel, go to "Environment Variables"
   - Add the following environment variable:
     ```
     NEXT_PUBLIC_CLUSTER=mainnet-beta  # or your preferred cluster (testnet, devnet)
     ```
   - Note: Only `NEXT_PUBLIC_CLUSTER` is needed for Vercel deployment as it's the only public environment variable
   - Other environment variables (`PRIVATE_KEY` and `ADDRESS`) are only needed for local development and contract initialization

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

Note: Make sure your Solana program is already deployed to the same cluster you specify in `NEXT_PUBLIC_CLUSTER`.
