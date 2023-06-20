import { web3, BN } from '@project-serum/anchor';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, ButtonGroup, Dropdown, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
// import Button from 'react-bootstrap/Button';
// import ButtonGroup from 'react-bootstrap/ButtonGroup';
// import Dropdown from 'react-bootstrap/Dropdown';
import { account, Mint, Wallet } from 'easy-spl';
import { CONFIG, NETWORK, SOL_ADDRESS, PROGRAM_ID, BACKEND_URL, TEST_TOKEN } from '../constants/constants';
import { IState } from 'src/store/interfaces/state';
import { useSelector } from 'react-redux';

import idl from '../idl.json';
import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, Keypair, ConnectionConfig, Transaction, TransactionInstruction, sendAndConfirmTransaction, LAMPORTS_PER_SOL, SendOptions } from '@solana/web3.js';
import RewardPoolAccount, { IRewardPoolAccount } from '../models/RewardPoolAccount';
import { initialize } from '../api/pool';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import axios from 'axios';
import HttpStatusCodes from 'http-status-codes';
import { CustomWallet } from '../models/CustomWallet';



const depositFunds = async (
	trailheadId: number
	, rewardPoolAccount: IRewardPoolAccount
	, userAddress: string
	, walletContext: WalletContextState
	, mintAddress: string
	, amount: number
	, isDeposit: boolean
	) => {
	console.log(`depositFunds userAddress = ${userAddress} isDeposit = ${isDeposit}`);
	try {
		console.log(`Adding ${trailheadId}`);
		
		const connection = new Connection(NETWORK, CONFIG);
		const mint = new Mint(connection, new PublicKey(mintAddress));
		const decimals = await mint.getDecimals();

		const programIdl: any = idl;
        const programId = new anchor.web3.PublicKey(PROGRAM_ID);

		if (walletContext) {
			// @ts-ignore
			const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
			const program = new anchor.Program(
				programIdl,
				programId,
				provider,
			);

			const mint = new PublicKey(mintAddress)
			console.log(`mint = ${mint.toString()}`)

			let txId = ''
			if (isDeposit) {
				txId = await program.methods
				.depositFunds(new BN(amount * Math.pow(10, decimals)))
				.accounts({
					poolAuthority: new PublicKey(userAddress),
					escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
					vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
					token: mint,
					systemProgram: web3.SystemProgram.programId,
				})
				.rpc()
			} else {
				txId = await program.methods
				.withdrawFunds(new BN(amount * Math.pow(10, decimals)))
				.accounts({
					poolAuthority: new PublicKey(userAddress),
					escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
					vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
	
					// tokenProgram: TOKEN_PROGRAM_ID,
					// rent: web3.SYSVAR_RENT_PUBKEY,
					// clock: web3.SYSVAR_CLOCK_PUBKEY,
					// systemProgram: web3.SystemProgram.programId,
					token: mint,
					systemProgram: web3.SystemProgram.programId,
				})
				// .signers([rewardPoolAccount])
				// .transaction() // use .transaction instead of .rpc
				.rpc() // use .transaction instead of .rpc
				// console.log(`transaction = ${transaction}`);
			}
			console.log(`txId`);
			console.log(txId);
		}

	}
	catch (err) {			
		console.log(`depositFunds error`);
		console.log(err);
		return(1);
	}
}

const addRewardPool = async (
	trailheadId: number
	, poolAuthorityKey: string
	, userAddress: string
	, walletContext: WalletContextState
) => {
	console.log(`addRewardPool`);
	try {
		console.log(`Adding ${trailheadId}`);

        // make sure this is a valid trailheadId and we don't already have it

        const programId = new anchor.web3.PublicKey(PROGRAM_ID);

		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/rewardPoolAccount/getRewardPoolAccounts',
			data: {
				'trailheadId': 6
			}
		});
        if (response.status != HttpStatusCodes.OK) {
            return('Pool Already Exists')
        }

		const connection = new Connection(NETWORK, CONFIG);

		const programIdl: any = idl;

		const escrowAccount = Keypair.generate();

		const seedString = `${poolAuthorityKey}`;
		const [ vaultAccount, nonce ] = await anchor.web3.PublicKey.findProgramAddress(
			[ (escrowAccount.publicKey).toBuffer() ],
			programId
		);
		console.log(`vaultAccount = ${vaultAccount}. nonce = ${nonce}`);

		// const signature = await connection.requestAirdrop(rewardPoolAccount.publicKey, 1000000000);
		// console.log(`signature = ${signature}`);
		// await connection.confirmTransaction(signature);


		// const walletSeed: Uint8Array = new Uint8Array(trailsWalletSeed);
		// const trailsKeypair = Keypair.fromSeed(walletSeed);
		// const trailsWallet: CustomWallet = new CustomWallet(trailsKeypair);

		// const { wallet } = useWallet();


		// const provider = new anchor.Provider(connection, trailsWallet, CONFIG);
		if (walletContext) {
			// @ts-ignore
			const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
			const program = new anchor.Program(
				programIdl,
				programId,
				provider,
			);
	
			// const result = await initialize(
			// 	program,
			// 	rewardPoolAccount,
			// 	new PublicKey(userAddress),
			// 	new PublicKey(poolAuthorityKey),
			// 	walletContext
			// );



			const txId = await program.methods
			.initializeEscrow(nonce)
			.accounts({
				escrowAccount: escrowAccount.publicKey,
				vaultAccount: vaultAccount,
				authority: new PublicKey(userAddress),

				poolAuthority: new PublicKey(poolAuthorityKey),

				// tokenProgram: TOKEN_PROGRAM_ID,
				// rent: web3.SYSVAR_RENT_PUBKEY,
				// clock: web3.SYSVAR_CLOCK_PUBKEY,
				systemProgram: web3.SystemProgram.programId,
			})
			.signers([escrowAccount])
			// .transaction() // use .transaction instead of .rpc
			.rpc() // use .transaction instead of .rpc
			// console.log(`transaction = ${transaction}`);
			console.log(`txId`);
			console.log(txId);
	
			let response = await axios({
				method: 'post',
				url: BACKEND_URL+'/api/rewardPoolAccount/addPool',
				data: {'txId': txId, 'trailheadId': 6}
			});
			console.log(`response`);
			console.log(response);

			// send txid to the backend to save the pool


			/*
			const latestBlockhash = await connection.getLatestBlockhash();
			if (walletContext && walletContext !== undefined && walletContext.publicKey !== undefined && transaction !== undefined) {
				// transaction.feePayer = walletContext.publicKey || undefined;
				// transaction.recentBlockhash = latestBlockhash.blockhash;
	
				const {
					context: { slot: minContextSlot },
					value: { blockhash, lastValidBlockHeight }
				} = await connection.getLatestBlockhashAndContext();
				if (walletContext.signTransaction) {

					// let signedTx = await walletContext.signTransaction(transaction);
					const buf: Buffer = Buffer.from(rewardPoolAccount.secretKey);
					// // const arrayBuffer = rewardPoolAccount.secretKey.buffer.slice(rewardPoolAccount.secretKey.byteOffset, rewardPoolAccount.secretKey.byteLength + rewardPoolAccount.secretKey.byteOffset); 
					// transaction.addSignature(rewardPoolAccount.publicKey, buf);
					// @ts-ignore
					// transaction.addSignature(rewardPoolAccount.publicKey, rewardPoolAccount.secretKey);
					console.log('transaction');
					console.log(transaction);
					// // signedTx = await newWallet.signTransaction(transaction);

					// // signedTx.addSignature( rewardPoolAccount.publicKey,  )
					// console.log('signedTx');
					// console.log(signedTx);
					// console.log(signedTx.signatures.map(x => x.publicKey.toString()));

					// const signature = signedTx.signature?.toString() ? signedTx.signature?.toString() : '';
					// console.log('signature');
					// console.log(signature);

					// const signature = await walletContext.sendTransaction(transaction, connection, { minContextSlot });
					// console.log('signature');
					// console.log(signature);
			
					// const result = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, 'signature': signature });
					// console.log(`result`);
					// console.log(result);
					// if (result) {
					// 	return(`There was an error sending the tx`);
					// }
					// return(result);
				}
	
				// const signTransaction = walletContext.signTransaction!;
				// const signedTransaction = await signTransaction(transaction);
				// const result = await connection.confirmTransaction(signedTransaction, 'processed');
	
	
				// send to their wallet to be signed
				// const signedTransaction = await sendTransaction(transaction, connection);
	
				// wait for it to complete
	
				// const programAccounts = await program.account.tokenSale.all();
				// const tokenSaleAccount = programAccounts[0]?.account;
				// const escrow = programAccounts[0]?.publicKey;
	
				// mint = tokenSaleAccount.mint as PublicKey;
				// authority = tokenSaleAccount.authority as PublicKey;
				// escrowTokenAccount = tokenSaleAccount.escrowTokenAccount as PublicKey;
				// initializerTokenAccount =
				// tokenSaleAccount.initializerTokenAccount as PublicKey;
	
				// const takerTokenAccount = await getAssociatedTokenAddress(
				// mint,
				// wallet.publicKey
				// );
				// const txTakerTokenAccount = new Transaction().add(
				// 	createAssociatedTokenAccountInstruction(
				// 		wallet.publicKey,
				// 		takerTokenAccount,
				// 		wallet.publicKey,
				// 		mint
				// 	)
				// );

			}
			*/
		}
	}
	catch (err) {			
		console.log(`addRewardPool error`);
		console.log(err);
		return(1);
	}
}

const AdminPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
	const vaultAccount = data.rewardPoolAccount?.vaultAccount || '';

	const [token, setToken] = useState('SOL');
	const [mint, setMint] = useState('So11111111111111111111111111111111111111112');
    const [buttonClass, setButtonClass] = useState('success');
    const [toggle, setToggle] = useState('deposit');
    const [value, setValue] = useState('');
	const [ userBalances, setUserBalances ] = React.useState({} as any);
	const [ poolBalances, setPoolBalances ] = React.useState({} as any);

	const headerImg = require(`../assets/projects/famousfoxfederation.png`);
	// const headerImg = require(`../assets/projects/marinadefinance.png`);

	const walletContext = useWallet();
	// const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
    // if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
    //   return;
    // }
    // const signerWallet = {
    //   publicKey: publicKey,
    //   signTransaction: signTransaction,
    //   signAllTransactions: signAllTransactions,
    // };
	// const connection = new Connection(NETWORK, CONFIG);

	// const provider = new anchor.AnchorProvider(connection, signerWallet, {
    //   preflightCommitment: 'recent',
    // });
	// const walletContext: any = useWallet();


	const getSpecificUserTokenBalances = async (curBalances: any, tokens: string[], address: string) => {
		console.log(`getSpecificUserTokenBalances ${address}`);
		const connection = new Connection(NETWORK, CONFIG);

		// console.log(`setSpecificUserTokenBalances`);
		const d: any = {...curBalances};
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			let userBalance = 0;
			try {
				if (token == SOL_ADDRESS) {
					// userBalance = await new Mint(connection, new PublicKey(token)).getBalance( new PublicKey(address) );
					userBalance = await connection.getBalance(new PublicKey(address)) / LAMPORTS_PER_SOL;
				} else {
					userBalance = await new Mint(connection, new PublicKey(token)).getBalance( new PublicKey(address) );
				}
			} catch (error) {
			}
			d[token.toString()] = userBalance;
		}
		// console.log(`setSpecificUserTokenBalances for address ${address}`);
		// console.log(d);
		// setUserTokenBalances(d);
		if (address == data.address) {
			setUserBalances(d)
		} else {
			setPoolBalances(d)
		}
	}

	const tokens = [
		{
			'name': 'SOL'
			, 'mint': 'So11111111111111111111111111111111111111112'
		}
		, {
			'name': 'mSOL'
			, 'mint': 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'
		}
		, {
			'name': 'FOXY'
			, 'mint': 'FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq'
		}
		, {
			'name': 'BONK'
			, 'mint': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
		}
		, {
			'name': 'USDC'
			, 'mint': TEST_TOKEN.toString()
		}
	]



    useEffect(() => {
		// console.log(`useEffect 2`);
		if (data.address) {
			getSpecificUserTokenBalances({}, tokens.map(x => x.mint), data.address);
			// console.log(`useEffect data.rewardPoolAccount = ${data.rewardPoolAccount}`)
			getSpecificUserTokenBalances({}, tokens.map(x => x.mint), vaultAccount);
		}
	}, [data.address, vaultAccount])
	

	// const mint = tokens.filter(x => x.name == token)
	
	const curImg = require(`../assets/tokens/${token}.png`);
	const options = tokens.map((x, i) => {
		const img = require(`../assets/tokens/${x.name}.png`);
		return(
			<Dropdown.Item key={i} eventKey={i} onClick={() => {
				setToken(x.name);
				setMint(x.mint);
			}}>
				<img src={String(img)} />
				<span>{x.name}</span>
			</Dropdown.Item>
		)
	})
	const handleAlignment = (event: any, newAlignment: any) => {
		// setAlignment(newAlignment);
		console.log('newAlignment');
		console.log(newAlignment);
	};

	const createPoolButton =
		<div className='create-pool-button'>
			<Button 
				disabled={false}
				className='burst-button fade-button'
				variant={'primary'}
				type='button'
				style={{'width':'200px'}}
				onClick={async () => {
					addRewardPool(6, `9VhsSZ6ni7dZtmKRHE81yAd3UQW1oKu9LNEWRGFMA5wj`, data.address, walletContext);
				}}
			>{`Create Pool`}</Button>
		</div>
	
	return (
		<div className='admin-page'>
			<div className='admin-header-outer'>
				<div className='admin-header'>
					<img className='admin-header-image' src={String(headerImg)} />
					Trailblazer Rewards
				</div>
			</div>
			<div>
				Reward Pool Account: <a target='_blank' href={`https://solana.fm/address/${vaultAccount}?cluster=http%253A%252F%252F127.0.0.1%253A8899%252F`}>{vaultAccount}</a>
			</div>
			{
				createPoolButton
			}
			<ToggleButtonGroup
				className='token-toggle'
				color='primary'
				value={toggle}
				type='radio'
				name='toggle'
				aria-label='Platform'
				>
				<ToggleButton onClick={() => setToggle('deposit')} value='deposit'>Deposit</ToggleButton>
				<ToggleButton onClick={() => setToggle('withdraw')} value='withdraw'>Withdraw</ToggleButton>
			</ToggleButtonGroup>

			<div className='row'>
				<div className='col'>
					<Dropdown className='token-dropdown' as={ButtonGroup}>
						<Dropdown.Toggle id='dropdown-tokens'>
							<img src={String(curImg)} />
							<span>{token}</span>
						</Dropdown.Toggle>
						<Dropdown.Menu className='dropdown-tokens'>
							{options}
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<div className='col'>
					<Form.Group className='mb-3 token-amount-input' controlId='formAmount'>
						{/* <Form.Label>Transaction ID</Form.Label> */}
						<Form.Control style={{'height':'50px', 'textAlign':'right','fontSize':'20px'}} type='txId' placeholder='0.0' value={value} onChange={(e) => {
							console.log(`e.target.value = ${e.target.value}`);
							// @ts-ignore
							setValue(e.target.value)
						}} />
						<Form.Text className='text-muted'>
							{ toggle == 'deposit' ? `Wallet` : 'Pool'} Balance: {
								(toggle == 'deposit' && mint in userBalances) ? userBalances[mint]
								: (toggle == 'withdraw' && mint in poolBalances) ? poolBalances[mint]
								: 0
							}
						</Form.Text>
					</Form.Group>
				</div>
				<div className='col'>
					<Button 
						disabled={false}
						id='burst-button'
						className='burst-button fade-button'
						variant={ toggle == 'deposit' ? 'success' : 'warning' }
						type='button'
						style={{'width':'200px'}}
						onClick={async () => {
							if (data.rewardPoolAccount) {
								console.log(`mint = ${mint}`);
								depositFunds(6, data.rewardPoolAccount, data.address, walletContext, mint, parseFloat(value), toggle == 'deposit').then( () => {
									const cur = {...userBalances}
									getSpecificUserTokenBalances(cur, [mint], data.address);
									getSpecificUserTokenBalances(cur, [mint], vaultAccount);
	
								})
							}
						}}
					>{`${toggle.charAt(0).toUpperCase()}${toggle.substring(1)}`}</Button>
				</div>
			</div>
		</div>
	);
}

export default AdminPage;
