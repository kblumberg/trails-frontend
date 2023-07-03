/***********************/
/*     Admin Page     */
/***********************/
// Page for the Trails admin to add pools for our partner projects
// And for our partner projects to add funds to the vault

import axios from 'axios';
import idl from '../idl.json';
import { Mint } from 'easy-spl';
import { useSelector } from 'react-redux';
import HttpStatusCodes from 'http-status-codes';
import * as anchor from '@project-serum/anchor';
import { web3, BN } from '@project-serum/anchor';
import React, { useEffect, useState } from 'react';
import { IState } from 'src/store/interfaces/state';
import { ToastContainer, toast } from 'react-toastify';
import { IRewardPoolAccount } from '../models/RewardPoolAccount';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button, Form, ButtonGroup, Dropdown, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { createAssociatedTokenAccountSendUnsigned, cleanProjectName, getTxUrl, parseMessage, getTokenFromMint, findAssociatedTokenAddress } from '../utils/utils';
import { CONFIG, NETWORK, SOL_ADDRESS, PROGRAM_ID, BACKEND_URL, TEST_TOKEN, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, ADMIN_ADDRESS } from '../constants/constants';


/*******************************************/
/*     Move Funds In And Out of Escrow     */
/*******************************************/
// 
const moveFunds = async (
	rewardPoolAccount: IRewardPoolAccount
	, userAddress: string
	, walletContext: WalletContextState
	, mintAddress: string
	, amount: number
	, isDeposit: boolean
) => {
	try {
		
		if (walletContext && walletContext.publicKey) {
			// load some basic info
			const connection = new Connection(NETWORK, CONFIG);
			const mintPubkey = new PublicKey(mintAddress);
			const mint = new Mint(connection, mintPubkey);
			const decimals = await mint.getDecimals();

			const programIdl: any = idl;
			const programId = new anchor.web3.PublicKey(PROGRAM_ID);
			const vaultAccount = new PublicKey(rewardPoolAccount.vaultAccount);

			// @ts-ignore
			const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
			const program = new anchor.Program(
				programIdl,
				programId,
				provider,
			);

			// load the token accounts
			const poolAuthorityTokenAccount = await createAssociatedTokenAccountSendUnsigned(
				connection
				, mintPubkey
				, walletContext.publicKey
				, walletContext
			)
			const vaultTokenAccount = await createAssociatedTokenAccountSendUnsigned(
				connection
				, mintPubkey
				, vaultAccount
				, walletContext
			)
			let txId = ''
			if (isDeposit) {
				// deposit funds into the escrow account
				txId = await program.methods
				.depositFunds(new BN(amount * Math.pow(10, decimals)))
				.accounts({
					poolAuthority: new PublicKey(userAddress),
					escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
					vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
					poolAuthorityTokenAccount: poolAuthorityTokenAccount,
					vaultTokenAccount: vaultTokenAccount,
					token: mintPubkey,
					systemProgram: web3.SystemProgram.programId,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.rpc()
			} else {
				// withdraw funds from the escrow account
				txId = await program.methods
				.withdrawFunds(new BN(amount * Math.pow(10, decimals)))
				.accounts({
					poolAuthority: new PublicKey(userAddress),
					escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
					vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
					poolAuthorityTokenAccount: poolAuthorityTokenAccount,
					vaultTokenAccount: vaultTokenAccount,
					token: mintPubkey,
					systemProgram: web3.SystemProgram.programId,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.rpc()
			}
			return({'txId': txId, 'succeeded': true, 'message': `${isDeposit ? 'Deposited' : 'Withdrew'} ${amount} $${getTokenFromMint(mintAddress)}`})
		}
		return({'succeeded': false, 'message': `Wallet is not connected`});
	}
	catch (err) {			
		console.log(`moveFunds error`);
		console.log(err);
		return({'succeeded': false, 'message': err});
	}
}

/*************************************/
/*     Create a New Reward Pool      */
/*************************************/
const addRewardPool = async (
	trailheadId: number
	, poolAuthorityKey: string
	, userAddress: string
	, walletContext: WalletContextState
) => {
	try {
        const programId = new anchor.web3.PublicKey(PROGRAM_ID);

		// right now only 1 pool can exist for each trailhead
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/rewardPoolAccount/getRewardPoolAccounts',
			data: {
				'trailheadId': trailheadId
			}
		});
        if (response.status != HttpStatusCodes.OK) {
            return('Pool Already Exists')
        }

		const connection = new Connection(NETWORK, CONFIG);

		const programIdl: any = idl;

		const escrowAccount = Keypair.generate();

		// the vaultAccount is a PDA using the escrowAccount address
		const [ vaultAccount, nonce ] = await anchor.web3.PublicKey.findProgramAddress(
			[ (escrowAccount.publicKey).toBuffer() ],
			programId
		);

		if (walletContext) {
			// @ts-ignore
			const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
			const program = new anchor.Program(
				programIdl,
				programId,
				provider,
			);

			// initialize the reward pool
			const txId = await program.methods
			.initializeEscrow(new BN(nonce))
			.accounts({
				escrowAccount: escrowAccount.publicKey,
				vaultAccount: vaultAccount,
				authority: new PublicKey(userAddress),

				feeAccount: new PublicKey(ADMIN_ADDRESS),
				poolAuthority: new PublicKey(poolAuthorityKey),

				systemProgram: web3.SystemProgram.programId,
			})
			.signers([escrowAccount])
			.rpc()

			// save it to our db
			let response = await axios({
				method: 'post',
				url: BACKEND_URL+'/api/rewardPoolAccount/addPool',
				data: {'txId': txId, 'trailheadId': trailheadId}
			});
			if (response.status == 200) {
				// show it succeeded
				const msg = () => toast(
					<div>
						Transaction Succeeded<br/><a target='_blank' href={getTxUrl(txId)}>View in Solana FM</a>
					</div>
					, {
						'theme': 'light'
						, 'type': 'success'
					}
				);
				msg()
			} else {
				// show it failed
				const msg = () => toast(
					<div>
						Transaction Failed<br/><b>{`${parseMessage(response.data.status)}`}</b>
					</div>
					, {
						'theme': 'light'
						, 'type': 'error'
					}
				);
				msg()
			}
		}
		return(0);
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

    const [value, setValue] = useState('');
	const [token, setToken] = useState('SOL');
    const [toggle, setToggle] = useState('deposit');
	const [trailheadId, setTrailheadId] = useState(0);
	const [userBalances, setUserBalances] = React.useState({} as any);
	const [poolBalances, setPoolBalances] = React.useState({} as any);
	const [mint, setMint] = useState('So11111111111111111111111111111111111111112');

	const compass = require('../assets/icons/compass.png');

	const walletContext = useWallet();

	// get token balances for a user
	const getSpecificUserTokenBalances = async (
		curBalances: any // the dict of balances we've already calculated
		, tokens: string[] // the list of tokens we want get balances for
		, address: string // the address we want get balances for
	) => {
		const connection = new Connection(NETWORK, CONFIG);

		// iterate over the list of tokens given
		const d: any = {...curBalances};
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			let userBalance = 0;
			try {
				if (token == SOL_ADDRESS) {
					userBalance = await connection.getBalance(new PublicKey(address)) / LAMPORTS_PER_SOL;
				} else {
					const k = findAssociatedTokenAddress(new PublicKey(address), new PublicKey(token));
					const n = (await connection.getTokenAccountBalance(
						k
					)).value.uiAmount;
					userBalance = n ? n : 0;
				}
			} catch (error) {
				console.log(`error`);
				console.log(error);
			}
			d[token.toString()] = userBalance;
		}
		// either set the pool or user balances
		if (address == data.address) {
			setUserBalances(d)
		} else {
			setPoolBalances(d)
		}
	}

	// a list of tokens that are supported
	const tokens = [
		{
			'name': 'SOL'
			, 'mint': 'So11111111111111111111111111111111111111112'
		}
		, {
			'name': 'USDC'
			, 'mint': TEST_TOKEN.toString()
		}
	]
	// create the token dropdown
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




	// load balances for the user and pool when either address changes
    useEffect(() => {
		if (data.address) {
			getSpecificUserTokenBalances({}, tokens.map(x => x.mint), data.address);
			getSpecificUserTokenBalances({}, tokens.map(x => x.mint), vaultAccount);
		}
	}, [data.address, vaultAccount])


	const isTrails = data.address == ADMIN_ADDRESS;
	const header = <div className='admin-header-outer'>
		<div className='admin-header'>
			{ isTrails ? null : <img className='admin-header-image' src={String(compass)} />}
			Expedition Rewards
		</div>
	</div>

	// we show something slightly different if the Trail wallet is connected
	if (isTrails) {
		// the button to create a new pool
		const createPoolButton =
			<div className='create-pool-button'>
				<Button 
					disabled={false}
					className='burst-button fade-button'
					variant={'primary'}
					type='button'
					style={{'width':'200px'}}
					onClick={async () => {
						addRewardPool(trailheadId, value, data.address, walletContext);
					}}
				>{`Create Pool`}</Button>
			</div>

		// the button to create a new pool (only shown is the Trails wallet is connected)
		const projectDropdown = data.trailheads.map(
			(x, i) => {
				const img = require(`../assets/projects/${x.name.toLowerCase().replaceAll(' ', '')}.png`);
				return(
					<Dropdown.Item key={i} eventKey={i} onClick={() => {
						setTrailheadId(x.id);
					}}>
						<img src={String(img)} />
						<span style={{'padding': '0 10px'}}>{cleanProjectName(x.name)}</span>
					</Dropdown.Item>
				)
			}
		)
		const curProject = data.trailheads.filter(x => x.id == trailheadId)[0];
		const curProjectImg = require(`../assets/projects/${curProject.name.toLowerCase().replaceAll(' ', '')}.png`);
		return(
			<div className='admin-page'>
				{header}
				<div className='row'>
					<div className='col'>
					<Dropdown style={{'height': '50px'}} className='projects-dropdown' as={ButtonGroup}>
						<Dropdown.Toggle id='dropdown-projects'>
							<img src={String(curProjectImg)} />
							<span style={{'padding': '0 10px'}}>{ cleanProjectName(curProject.name)}</span>
						</Dropdown.Toggle>
						<Dropdown.Menu className='dropdown-projects'>
							{projectDropdown}
						</Dropdown.Menu>
					</Dropdown>
					</div>
					<div className='col'>
						<Form.Group className='mb-3' controlId='formBasicAddress'>
							<Form.Control style={{'height': '50px'}} type='address' placeholder='Authority Address' onChange={(e) => {
								setValue(e.target.value)
							}} />
						</Form.Group>
					</div>
					<div className='col'>
						{createPoolButton}
					</div>
				</div>
				<ToastContainer
					position="bottom-left"/>
			</div>
		)
	}

	const balance: number = (toggle == 'deposit' && mint in userBalances) ? userBalances[mint]
	: (toggle == 'withdraw' && mint in poolBalances) ? poolBalances[mint]
	: 0;
	
	return (
		<div className='admin-page'>
			<div className='admin-header-outer'>
				<div className='admin-header'>
					<img className='admin-header-image' src={String(compass)} />
					Expedition Rewards
				</div>
			</div>
			<div style={{'paddingBottom': '10px'}}>
				{/* display the address of the reward pool */}
				Reward Pool Account: <a target='_blank' href={`https://solana.fm/address/${vaultAccount}?cluster=http%253A%252F%252F127.0.0.1%253A8899%252F`}>{vaultAccount}</a>
			</div>
			{/* deposit or withdrawal toggle */}
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
			{/* token dropdown */}
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
						<Form.Control style={{'height':'50px', 'textAlign':'right','fontSize':'20px'}} type='txId' placeholder='0.0' value={value} onChange={(e) => {
							console.log(`e.target.value = ${e.target.value}`);
							setValue(e.target.value)
						}} />
						<Form.Text className='text-muted clickable' onClick={() => {
							setValue(balance.toString())
						}}><span>Max: </span>
							{/* { toggle == 'deposit' ? `Wallet` : 'Pool'} Balance: */}
							{
								balance.toLocaleString('en-us')
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
								// function to deposit or withdraw funds from the pool account
								moveFunds(data.rewardPoolAccount, data.address, walletContext, mint, parseFloat(value), toggle == 'deposit').then( (res: any) => {

									if (res.succeeded) {
										const msg = () => toast(
											<div>
												{res.message}<br/><a target='_blank' href={getTxUrl(res.txId)}>View in Solana FM</a>
											</div>
											, {
												'theme': 'light'
												, 'type': 'success'
											}
										);
										msg()
									} else {
										const msg = () => toast(
											<div>
												Transaction Failed<br/><br/>{res.message}
											</div>
											, {
												'theme': 'light'
												, 'type': 'error'
											}
										);
										msg()
									}
									const cur = {...userBalances}
									getSpecificUserTokenBalances(cur, [mint], data.address);
									getSpecificUserTokenBalances(cur, [mint], vaultAccount);
	
								})
							}
						}}
					>{`${toggle.charAt(0).toUpperCase()}${toggle.substring(1)}`}</Button>
				</div>
			</div>
			{/* toast container to display messages */}
			<ToastContainer
				position="bottom-left"/>
		</div>
	);
}

export default AdminPage;
