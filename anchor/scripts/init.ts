import * as anchor from "@coral-xyz/anchor";
import { Fundus } from "../target/types/fundus";
import idl from "../target/idl/fundus.json";
import * as dotenv from "dotenv";
import path from "path";
import bs58 from "bs58";
import { getClusterUrl } from "@/utils/helper";

// Load .env from parent directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { SystemProgram, PublicKey } = anchor.web3;

const main = async (cluster: string) => {
  // Create a connection to the cluster
  const connection = new anchor.web3.Connection(
    getClusterUrl(cluster),
    "confirmed"
  );

  // Loan keypair data from PRIVATE_KEY in file .env
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  const decodedKey = bs58.decode(privateKey);
  const wallet = anchor.web3.Keypair.fromSecretKey(decodedKey);

  // Create a provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    {
      commitment: "confirmed",
    }
  );

  anchor.setProvider(provider);

  // Load the program
  const program = new anchor.Program<Fundus>(idl as any, provider);
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  try {
    const state = await program.account.programState.fetch(programStatePda);
    console.log(`Program already initialized, status: ${state.initialized}`);
  } catch (error) {
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        programState: programStatePda,
        deployer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(tx, "finalized");
    console.log("Program initialized successfully.", tx);
  }
};

// Default to localhost if NEXT_PUBLIC_CLUSTER is not set
const cluster: string = process.env.NEXT_PUBLIC_CLUSTER || "localhost";
main(cluster).catch((error) => console.error(error));
