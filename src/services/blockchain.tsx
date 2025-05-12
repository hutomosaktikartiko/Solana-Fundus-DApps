import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Fundus } from "../../anchor/target/types/fundus";
import idl from "../../anchor/target/idl/fundus.json";

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
  sendTransaction: any,
  signTransaction: any
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
