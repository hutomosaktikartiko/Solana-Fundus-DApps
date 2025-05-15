import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { Fundus } from "../../anchor/target/types/fundus";
import idl from "../../anchor/target/idl/fundus.json";
import { Campaign, ProgramState, Transaction } from "@/utils/interfaces";
import { globalActions } from "@/store/globalSlices";
import { store } from "@/store";
import { getClusterUrl } from "@/utils/helper";

let tx: any;
const { setCampaign, setDonations, setWithdrawals, setStates } = globalActions;
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

export const donateToCampaign = async (
  program: Program<Fundus>,
  publicKey: PublicKey,
  pda: string,
  amount: number
): Promise<TransactionSignature> => {
  const campaign = await program.account.campaign.fetch(pda);

  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("donor"),
      publicKey.toBuffer(),
      campaign.cid.toArrayLike(Buffer, "le", 8),
      campaign.donors.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const donation_amount = new BN(amount * 1_000_000_000);
  const tx = await program.methods
    .donate(campaign.cid, donation_amount)
    .accountsPartial({
      campaign: pda,
      transaction: transactionPda,
      donor: publicKey,
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

export const withdrawFromCampaign = async (
  program: Program<Fundus>,
  publicKey: PublicKey,
  pda: string,
  amount: number
): Promise<TransactionSignature> => {
  const campaign = await program.account.campaign.fetch(pda);

  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("withdraw"),
      publicKey.toBuffer(),
      campaign.cid.toArrayLike(Buffer, "le", 8),
      campaign.withdrawals.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const programState = await program.account.programState.fetch(
    programStatePda
  );

  const withdraw_amount = new BN(amount * 1_000_000_000);
  const tx = await program.methods
    .withdraw(campaign.cid, withdraw_amount)
    .accountsPartial({
      programState: programStatePda,
      campaign: pda,
      transaction: transactionPda,
      creator: publicKey,
      platformAddress: programState.platformAddress,
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

export const fetchUserCampaigns = async (
  program: Program<Fundus>,
  publicKey: PublicKey
): Promise<Campaign[]> => {
  const campaigns = program.account.campaign.all();
  const userCampaigns = (await campaigns).filter(
    (c) => c.account.creator.toBase58() === publicKey.toBase58()
  );

  return serializeCampaigns(userCampaigns);
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

  store.dispatch(setCampaign(seriazed));

  return seriazed;
};

export const fetchAllDonations = async (
  program: Program<Fundus>,
  pda: string
): Promise<Transaction[]> => {
  const campaign = await program.account.campaign.fetch(pda);
  const transactions = await program.account.transaction.all();

  const donations = transactions.filter(
    (tx) => tx.account.cid.eq(campaign.cid) && tx.account.credited
  );

  store.dispatch(setDonations(serializeTxs(donations)));
  return serializeTxs(donations);
};

export const fetchAllWithdrawals = async (
  program: Program<Fundus>,
  pda: string
): Promise<Transaction[]> => {
  const campaign = await program.account.campaign.fetch(pda);
  const transactions = await program.account.transaction.all();

  const withdrawals = transactions.filter(
    (tx) => tx.account.cid.eq(campaign.cid) && !tx.account.credited
  );

  store.dispatch(setWithdrawals(serializeTxs(withdrawals)));
  return serializeTxs(withdrawals);
};

export const fetchProgramState = async (
  program: Program<Fundus>
): Promise<ProgramState> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const programState = await program.account.programState.fetch(
    programStatePda
  );

  const serialized: ProgramState = {
    ...programState,
    campaignCount: programState.campaignCount.toNumber(),
    platformFee: programState.platformFee.toNumber(),
    platformAddress: programState.platformAddress.toBase58(),
  };

  store.dispatch(setStates(serialized));
  return serialized;
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

const serializeTxs = (transactions: any[]): Transaction[] => {
  return transactions.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    owner: c.account.owner.toBase58(),
    cid: c.account.cid.toNumber(),
    amount: c.account.amount.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
  }));
};
