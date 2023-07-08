import { account, util } from 'easy-spl';
import { PublicKey } from '@solana/web3.js';
import { Network } from 'src/enums/Network';
import { web3 } from '@project-serum/anchor';
import { MadTrailScorecard } from '../models/MadTrailScorecard';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PROGRAM_NETWORK, SOL_ADDRESS, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../constants/constants';

// check if device is mobile or desktop
const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.height;
export const isMobile = width < 768;

export const cleanProjectName = (program: string) => {
	const program_d: any = {
	};
	const programName: string = program && Object.hasOwn(program_d, program) ? program_d[program] : program.replace(/([A-Z])/g, ' $1').trim().replace(new RegExp('[0-9]', 'g'), '');
	return(programName);
}

export const getTokenFromMint = (mint: string) => {
	const mintToTokenMap: any = {
		'So11111111111111111111111111111111111111112': 'SOL'
		, '5SosK71HJr9UpcwopNam8X9ZnuonDoGERjziWSnws4u4': 'USDC'
		, '7EAEXC5NFwhC1xDTNNxScPT51CiXDp1KZHnpkjawXasf': 'USDC'
	}
	if (Object.hasOwn(mintToTokenMap, mint)) {
			return(mintToTokenMap[mint]);
	}
	return(mint);
}

export const toTitleCase = (str: string) => {
	return str.replace(
		/\w\S*/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

export const parseMessage = (message: string) => {
	return(toTitleCase(message.replaceAll('_', ' ')) );
}

export const getExplorerUrl = (pref: string, val: string) => {
	// @ts-ignore
	if (PROGRAM_NETWORK === Network.LOCALNET) {
		return(`https://solana.fm/${pref}/${val}?cluster=http%253A%252F%252F127.0.0.1%253A8899%252F`);
	}
	// @ts-ignore
	else if (PROGRAM_NETWORK === Network.DEVNET) {
		return(`https://solscan.io/${pref}/${val}?cluster=devnet`);
	}
	return(`https://solscan.io/${pref}/${val}`);
}

export const formatDate = (timestamp: number, useMinutes: boolean = false, useWeekday: boolean = true) => {
	const date = new Date(timestamp);

	// Get the day of the week (e.g., 'Wed')
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dayOfWeek = `${daysOfWeek[date.getDay()]} `;

	// Get the month (e.g., 'Jun')
	const months = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];
	const month = months[date.getMonth()];

	// Get the day of the month (e.g., 10th, 1st, 2nd, etc.)
	const day = date.getDate();
	const suffix = ordinal_suffix_of(day); // Get the appropriate suffix for the day

	// Get the hour (e.g., 9) and AM/PM indicator
	let hour = date.getHours();
	let minute = date.getMinutes();
	const minutes = useMinutes ? (minute >= 10 ? `:${minute}` : `:0${minute}`) : '';
	const amPm = hour >= 12 ? 'pm' : 'am';
	hour = hour % 12 || 12; // Convert to 12-hour format

	return `${useWeekday ? dayOfWeek : ''}${month} ${suffix} ${hour}${minutes}${amPm}`;
}
	
export const getCurrentTimestamp = () => {
	return(new Date().getTime())
}


// create an associated token account
export const createAssociatedTokenAccountSendUnsigned = async (
	conn: web3.Connection,
	mint: web3.PublicKey,
	owner: web3.PublicKey,
	wallet: WalletContextState
) => {
	// if an address already has a token account, return it
	const address = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true);
	if (await account.exists(conn, address)) {
		return address
	}
	// otherwise, create it
	if (wallet.publicKey) {
		const instruction = Token.createAssociatedTokenAccountInstruction(
				ASSOCIATED_TOKEN_PROGRAM_ID,
				TOKEN_PROGRAM_ID,
				mint,
				address,
				owner,
				wallet.publicKey
		)
		const tx = await util.wrapInstructions(conn, [ instruction ], wallet.publicKey );
		if (wallet && wallet.signTransaction) {
			const signed_tx = await wallet.signTransaction(tx);
			await util.sendAndConfirm(conn, signed_tx)
			return(address);
		}
	}
	return('');
}

export const getXpFromMadWarsScorecard = (s: MadTrailScorecard) => {
	// get the mad trail scorecard for a user
    const amt = Math.min(1000000, s.volume);
    const xp = (
        (s.hasApt ? 10 : 0)
        + (s.hasArb ? 10 : 0)
        + (s.hasBtc ? 10 : 0)
        + (s.hasEth ? 10 : 0)
        + (s.hasLong ? 10 : 0)
        + (s.hasShort ? 10 : 0)
        + (s.hasSol ? 10 : 0)
        + Math.floor(amt / 1000)
        + Math.floor(Math.max(0, Math.log10(amt))) * 15
    )
    return(xp);
}

export const ordinal_suffix_of = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) {
        return(i + 'st');
    }
    if (j === 2 && k !== 12) {
        return(i + 'nd');
    }
    if (j === 3 && k !== 13) {
        return(i + 'rd');
    }
    return(i + 'th');
}

export const findAssociatedTokenAddress = (
	walletAddress: PublicKey,
	tokenMintAddress: PublicKey
) => {
	// get a user's associated token address
	if (tokenMintAddress.toString() === SOL_ADDRESS) {
		return(walletAddress);
	}
	return PublicKey.findProgramAddressSync(
		[
			walletAddress.toBuffer(),
			TOKEN_PROGRAM_ID.toBuffer(),
			tokenMintAddress.toBuffer(),
		],
		SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
	)[0];
}


export const cleanTxId = (txId: string) => {
	// users can submit urls when they submit their tx, so we do some cleaning
    const cleaned_0 = txId.split('/')
    const i = cleaned_0.length;
    const cleaned_1 = cleaned_0[i - 1].split('?')[0];
    return(cleaned_1);
}