import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { Fundus } from "../../anchor/target/types/fundus";
import idl from "../../anchor/target/idl/fundus.json";
import { Campaign } from "@/utils/interfaces";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { timeStamp } from "console";

const getClusterUrl = (cluster: string): string => {
  const clusterUrl: any = {
    "mainnet-beta": "https://api.mainnet-beta.solana.com",
    testnet: "https://api.testnet.solana.com",
    devnet: "https://api.devnet.solana.com",
    localhost: "http://localhost:8899",
  };

  return clusterUrl[cluster];
};

let tx: any;
const CLUSTER: string = process.env.NEXT_PUBLIC_CLUSTER || "localhost";
const RPC_URL: string = getClusterUrl(CLUSTER);

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Fundus> | null => {
  if (!publicKey || !signTransaction) {
    console.log("Wallet not connected or missing signTransation");
    return null;
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new AnchorProvider(
    connection,
    {
      publicKey,
      signTransaction,
      sendTransaction,
    } as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<Fundus>(idl as any, provider);
};

export const getProviderReadOnly = (): Program<Fundus> => {
  const connection = new Connection(RPC_URL, "confirmed");

  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only provider cannot sign transaction");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only provider cannot sign transaction");
    },
  };

  const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {
    commitment: "processed",
  });

  return new Program<Fundus>(idl as any, provider);
};

export const createCampaign = async (
  program: Program<Fundus>,
  publicKey: PublicKey,
  title: string,
  description: string,
  image_url: string,
  goal: number
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const state = await program.account.programState.fetch(programStatePda);
  const CID = state.campaignCount.add(new BN(1));

  const [campaignPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), CID.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const goalBN = new BN(goal * 1_000_000_000);
  tx = await program.methods
    .createCampaign(title, description, image_url, goalBN)
    .accountsPartial({
      programState: programStatePda,
      campaign: campaignPda,
      creator: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );

  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const fetchActiveCampaigns = async (
  program: Program<Fundus>
): Promise<Campaign[]> => {
  const campaigns = program.account.campaign.all();
  const activeCampaigns = (await campaigns).filter((c) => c.account.active);

  return serializeCampaigns(activeCampaigns);
};

export const fetchCampaignDetails = async (
  program: Program<Fundus>,
  pda: string
): Promise<Campaign> => {
  const campaign = await program.account.campaign.fetch(pda);

  const seriazed: Campaign = {
    ...campaign,
    publicKey: pda,
    cid: campaign.cid.toNumber(),
    creator: campaign.creator.toBase58(),
    goal: campaign.goal.toNumber() / 1e9,
    amountRaised: campaign.amountRaised.toNumber() / 1e9,
    timestamp: campaign.timestamp.toNumber() * 1000,
    donors: campaign.donors.toNumber(),
    withdrawals: campaign.withdrawals.toNumber(),
    balance: campaign.balance.toNumber() / 1e9,
    active: campaign.active,
  };

  return seriazed;
};

const serializeCampaigns = (campaigns: any[]): Campaign[] => {
  const modified: Campaign[] = campaigns.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    cid: c.account.cid.toNumber(),
    creator: c.account.creator.toBase58(),
    goal: c.account.goal.toNumber() / 1e9,
    amountRaised: c.account.amountRaised.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
    donors: c.account.donors.toNumber(),
    withdrawals: c.account.withdrawals.toNumber(),
    balance: c.account.balance.toNumber() / 1e9,
    active: c.account.active,
  }));

  return modified;
};
