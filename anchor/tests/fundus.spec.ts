import * as anchor from "@coral-xyz/anchor";
import { Fundus } from "anchor/target/types/fundus";
import idl from "../target/idl/fundus.json";
const { SystemProgram, PublicKey } = anchor.web3;

describe("fundus", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = new anchor.Program<Fundus>(idl as any, provider);

  let CID: any;

  it("create a campaign", async () => {
    const creator = provider.wallet;

    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );

    const state = await program.account.programState.fetch(programStatePda);
    CID = state.campaignCount.add(new anchor.BN(1));

    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), CID.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const title = `Test Campaign Title #${CID.toString()}`;
    const description = `Test campaign description #${CID.toString()}`;
    const image_url = `https://dummy_image_${CID.toString()}.png`;
    const goal = new anchor.BN(25 * 1_000_000_000); // 25 SOL

    const tx = await program.methods
      .createCampaign(title, description, image_url, goal)
      .accountsPartial({
        programState: programStatePda,
        campaign: campaignPda,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Campaign created: ", tx);

    const campaign = await program.account.campaign.fetch(campaignPda);
    console.log("Campaign: ", campaign);
  });
});
