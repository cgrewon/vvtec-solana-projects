import assert from 'assert';
import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { VvtecOnchain } from "../target/types/vvtec_onchain";

describe("vvtec-onchain", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.VvtecOnchain as Program<VvtecOnchain>;

    it("Create!", async () => {
        const feedName = Buffer.alloc(32);
        feedName.fill("test");
        const value = new BN(0)

        const [oracle] = await PublicKey.findProgramAddress(
            [feedName],
            program.programId
        );
        const tx = await program.methods
            .create({
                name: [...feedName],
                owner: provider.wallet.publicKey,
                value,
            })
            .accounts({
                oracle,
            })
            .rpc();
        console.log("Your transaction signature", tx);

        let oracleAcc = await program.account.oracle.fetch(oracle)

        assert.ok(oracleAcc.owner.equals(provider.wallet.publicKey))
        assert.ok(feedName.equals(Buffer.from(oracleAcc.name)))
        assert.ok(oracleAcc.value.eq(value))
    });

    it("Update!", async () => {
        const feedName = Buffer.alloc(32);
        feedName.fill("test");
        const value = null

        const [oracle] = await PublicKey.findProgramAddress(
            [feedName],
            program.programId
        );
        const tx = await program.methods
            .update(value)
            .accounts({
                oracle,
            })
            .rpc();
        console.log("Your transaction signature", tx);

        let oracleAcc = await program.account.oracle.fetch(oracle)

        assert.ok(oracleAcc.owner.equals(provider.wallet.publicKey))
        assert.ok(feedName.equals(Buffer.from(oracleAcc.name)))
        assert.ok(oracleAcc.value == value)
    });

    it("Delete!", async () => {
        const feedName = Buffer.alloc(32);
        feedName.fill("test");

        const [oracle] = await PublicKey.findProgramAddress(
            [feedName],
            program.programId
        );
        const tx = await program.methods
            .delete()
            .accounts({
                oracle,
            })
            .rpc();
        console.log("Your transaction signature", tx);

        let oracleAcc = await program.account.oracle.fetchNullable(oracle)
        assert.ok(oracleAcc == null)
    });
});
