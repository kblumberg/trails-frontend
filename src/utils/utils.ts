import { BN, web3 } from '@project-serum/anchor';
import { account, util, WalletI } from 'easy-spl';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IState } from "src/store/interfaces/state";
import { Slide } from "../models/Slide";
import { ClaimRewardResult } from "src/enums/ClaimRewardResult";
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SOL_ADDRESS } from 'src/constants/constants';
import { MadTrailScorecard } from "../models/MadTrailScorecard";

export const cleanProjectName = (program: string) => {
	const program_d: any = {
		'Magic': 'Magic Eden'
		, 'Exchange': 'Exchange Art'
		, 'MadWars': 'Mad Wars'
		, 'FamousFoxFederation': 'Famous Fox Federation'
		, 'FamousFoxFederation2': 'Famous Fox Federation'
		, 'ZetaMarkets': 'Zeta Markets'
		, 'JupiterExchange': 'Jupiter Exchange'
		, 'AverExchange': 'Aver Exchange'
		, 'MarinadeFinance': 'Marinade Finance'
	};
	const programName: string = program && Object.hasOwn(program_d, program) ? program_d[program] : program;
	return(programName);
}

const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.height;
export const isMobile = width < 768;
export const getTokenFromMint = (mint: string) => {
		const mintToTokenMap: any = {
				'So11111111111111111111111111111111111111112': 'SOL'
				, '5SosK71HJr9UpcwopNam8X9ZnuonDoGERjziWSnws4u4': 'USDC'
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

export const getTxUrl = (txId: string) => {
	return(`https://solana.fm/tx/${txId}?cluster=http%253A%252F%252F127.0.0.1%253A8899%252F`);
}

export const formatDate = (timestamp: number, useMinutes: boolean = false, useWeekday: boolean = true) => {
		const date = new Date(timestamp);
	
		// Get the day of the week (e.g., "Wed")
		const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const dayOfWeek = `${daysOfWeek[date.getDay()]} `;
	
		// Get the month (e.g., "Jun")
		const months = [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
		];
		const month = months[date.getMonth()];
	
		// Get the day of the month (e.g., 10th, 1st, 2nd, etc.)
		const day = date.getDate();
		const suffix = getNumberSuffix(day); // Get the appropriate suffix for the day
	
		// Get the hour (e.g., 9) and AM/PM indicator
		let hour = date.getHours();
		let minute = date.getMinutes();
		const minutes = useMinutes ? (minute >= 10 ? `:${minute}` : `:0${minute}`) : '';
		const amPm = hour >= 12 ? 'pm' : 'am';
		hour = hour % 12 || 12; // Convert to 12-hour format

		return `${useWeekday ? dayOfWeek : ''}${month} ${day}${suffix} ${hour}${minutes}${amPm}`;
	}
	
	const getNumberSuffix = (number: number) => {
		if (number >= 11 && number <= 13) {
			return 'th';
		}
	
		const lastDigit = number % 10;
	
		switch (lastDigit) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
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
	// if (mint.toString() == SOL_ADDRESS) {
	// 	return(owner);
	// }
	const address = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true);
	if (await account.exists(conn, address)) {
		console.log(`token address for ${owner.toString()} exists ${address}`);
		return address
	}
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
    const amt = Math.min(1000000, s.volume);
    return(
        (s.hasApt ? 10 : 0)
        + (s.hasArb ? 10 : 0)
        + (s.hasBtc ? 10 : 0)
        + (s.hasEth ? 10 : 0)
        + (s.hasLong ? 10 : 0)
        + (s.hasShort ? 10 : 0)
        + (s.hasSol ? 10 : 0)
        // + (s.numProfit1 * 5)
        // + (s.numProfit5 * 10)
        // + (s.numProfit10 * 20)
        // + (s.numProfit50 * 50)
        // + (s.numProfit100 * 100)
        // + (Math.min(3, s.numVolume10) * 5)
        // + (Math.min(3, s.numVolume50) * 10)
        // + (Math.min(3, s.numVolume100) * 20)
        // + (Math.min(3, s.numVolume500) * 50)
        // + (Math.min(3, s.numVolume1000) * 100)
        + Math.floor(amt / 1000)
        + Math.floor(Math.log10(amt)) * 15
    )
}


export const ordinal_suffix_of = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) {
        return(i + 'st');
    }
    if (j == 2 && k != 12) {
        return(i + 'nd');
    }
    if (j == 3 && k != 13) {
        return(i + 'rd');
    }
    return(i + 'th');
}