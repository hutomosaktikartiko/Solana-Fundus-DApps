import { Keypair } from "@solana/web3.js";
import fs from "fs";

const user = Keypair.generate();
const keypairData = JSON.stringify(Array.from(user.secretKey));

fs.writeFileSync("user.json", keypairData);
console.log("User generated: ", user.publicKey.toBase58());
