import { web3, BN, Wallet } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {PublicKey, Keypair} from "@solana/web3.js";
import { BACKEND_URL } from '../constants/constants';
import axios from 'axios';
// import { SOL_ADDRESS } from '../../constants/constants';

// RPC call to initialize the pool
export async function initialize(
    program: any,

	// the account to store all the data in
	rewardPoolAccount: Keypair,

	// this will be the Props wallet
	authority: PublicKey,

	poolAuthority: PublicKey,
	walletContext: Wallet,

) {
	console.log(`initialize`);
	console.log(`rewardPoolAccount = ${rewardPoolAccount.publicKey.toString()}`);
	console.log(`authority = ${authority.toString()}`);
	console.log(`poolAuthority = ${poolAuthority.toString()}`);
	console.log(`systemProgram = ${web3.SystemProgram.programId}`);

	try {
		const txId = await program.rpc.initialize(
			{
				accounts: {
					rewardPoolAccount: rewardPoolAccount.publicKey,
					authority: authority,
	
					poolAuthority: poolAuthority,

					// tokenProgram: TOKEN_PROGRAM_ID,
					// rent: web3.SYSVAR_RENT_PUBKEY,
					// clock: web3.SYSVAR_CLOCK_PUBKEY,
					systemProgram: web3.SystemProgram.programId,
				},
				signers: [walletContext],
			}
		);
		console.log(`txId`);
		console.log(txId);

		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/rewardPoolAccount/addPool',
			data: {'txId': txId, 'trailheadId': 6}
		});
		console.log(`response`);
		console.log(response);
		// dispatch(actions.setHikes(hikes));
	} catch (error) {
		console.log(`program.rpc.initialize error`);
		console.log(error);
		return(1);
	}
	return(0);
}
