import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolflareWalletAdapterConfig,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import React, { useEffect, useMemo, useState } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import MainPage from './components/MainPage';
import ExpeditionsPage from './components/ExpeditionsPage';
import SettingsPage from './components/SettingsPage';
import LeaderboardPage from './components/LeaderboardPage';
import LeftBar from './components/LeftBar';

import { BrowserRouter, Route, Routes } from "react-router-dom"
import ProgramPage from './components/ProgramPage';
import RightPanel from './components/RightPanel';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AWS_KEY, AWS_SECRET, BACKEND_URL, CONFIG, NETWORK } from './constants/constants';
import * as actions from './store/actions/actions';
import { IState } from './store/interfaces/state';

import AWS from 'aws-sdk'
import XpCard from './components/XpCard';
import AboutPage from './components/AboutPage';
import AdminPage from './components/AdminPage';
import { Xp } from './models/Xp';
import { isMobile } from './utils/utils';
import FrontierPage from './components/FrontierPage';
import { Trail } from './models/Trail';
import { Trailhead } from './models/Trailhead';

import 'react-toastify/dist/ReactToastify.css';

require('@solana/wallet-adapter-react-ui/styles.css');
const S3_BUCKET = 'trails-avatars';
const REGION = 'us-east-1';

AWS.config.update({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET
})
const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

const getTx = async (txId: string, connection: Connection) => {
	const tx = await connection.getTransaction(txId);
	// console.log(`getTx ${txId}`)
	// console.log(tx);
	// console.log(tx?.transaction.message.accountKeys.map(x => x.toString()));
}

const getTransactionsOfUser = async (address: string, options: any, connection: Connection) => {
    console.log({ address, options });
	console.log(`getTransactionsOfUser`);
    try {
      const publicKey = new PublicKey(address);
      const transSignatures =
        await connection.getConfirmedSignaturesForAddress2(publicKey, options);
      console.log({ transSignatures });
      const transactions = [];
      for (let i = 0; i < transSignatures.length; i++) {
		console.log(`transSignatures ${i}`);
        const signature = transSignatures[i].signature;

		const config = {
			// 'commitment': 'confirmed',
			'maxSupportedTransactionVersion': 100
		};
        // const confirmedTransaction = await connection.getConfirmedTransaction(
        const confirmedTransaction = await connection.getTransaction(
			signature,
			config
		);
		// if (signature == 'zbcrRgSGdTjdnrvZVC1qKe3qxW492xbdx911My1Qsm4QgAZK1ugFhac1rT4Cdvf67piSg5f8m7VBSwrAYdsBtic') {
		if (signature == '33zKK8tXNv43DS6iX8AgCaVy3hpeaNNTVaBwWgHyHWQ5AW5DuRexyHTx5FBPEX5y8TNn8wzbC9JpXwJXAwm6onHS') {
			console.log(`confirmedTransaction`);
			console.log(confirmedTransaction);
		}
        if (confirmedTransaction) {
          const { meta } = confirmedTransaction;
          if (meta) {
            const oldBalance = meta.preBalances;
            const newBalance = meta.postBalances;
            const amount = oldBalance[0] - newBalance[0];
            const transWithSignature = {
              signature,
              ...confirmedTransaction,
              fees: meta?.fee,
              amount,
            };
            transactions.push(transWithSignature);
          }
        }
      }
      return transactions;
    } catch (err) {
      throw err;
    }
  }

function App() {
	const solNetwork = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

	const config: SolflareWalletAdapterConfig = {
		'network': solNetwork
	};

	// const connection = new Connection(NETWORK, CONFIG);

	// getTx('55zbj9kqnQKZoP9tSvtKgs4yqgih2aDqjcyc1saVbsQyWfttr2HpczgvQrmTkbZqpDqmevWQj76qfDPgLH36Jwy9', connection);

	const wallets = [
		new PhantomWalletAdapter(),
		new GlowWalletAdapter(),
		new SlopeWalletAdapter(),
		new SolflareWalletAdapter(config),
		new TorusWalletAdapter(),
		new LedgerWalletAdapter(),
		new SolletExtensionWalletAdapter(),
		new SolletWalletAdapter(),
	];

	const dispatch = useDispatch();
	const { publicKey, wallet, disconnect } = useWallet();
	const data: IState = useSelector((state: any) => state.data);

	const loadTrails = async () => {
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/trails/trails',
		});
		let trails: Trail[] = response.data;
		// trails = trails.filter(x => x.hidden == false);
		trails = trails.filter(x => x.hidden == false);
		dispatch(actions.setTrails(trails));
	}
	const loadTrailheads = async () => {
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/trailheads/trailheads',
		});
		let trailheads: Trailhead[] = response.data;
		trailheads = trailheads.sort((a, b) => b.id - a.id);
		trailheads = trailheads.filter(x => x.id != 16);
		trailheads = trailheads.filter(x => x.id != 20);
		// trailheads = trailheads.filter(x => x.hidden == false);
		// trailheads = trailheads.sort((a, b) => (a.id >= 10 && b.id >= 10) ? a.id - b.id : b.id - a.id);
		trailheads = trailheads.filter(x => x.id != 6);
		dispatch(actions.setTrailheads(trailheads));
	}
	const loadHikes = async (address: string) => {
		if (!address) {
			return([]);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/hikes/hikes',
			data: {'address': address}
		});
		let hikes = response.data;
		dispatch(actions.setHikes(hikes));
	}
	const loadSlideMovements = async (address: string) => {
		if (!address) {
			return([]);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/slideMovement/loadSlideMovements',
			data: {'address': address}
		});
		dispatch(actions.setSlideMovements(response.data));
	}
	const loadUserXp = async (address: string) => {
		if (!address) {
			return([]);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/loadUserXp',
			data: {'address': address}
		});
		const xps: Xp[] = response.data
		dispatch(actions.setUserXp(xps.reduce((a, b) => a + b.xp, 0 )));
		dispatch(actions.setUserXps(response.data));
	}
	const loadLeaderboard = async () => {
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/hikes/leaderboard',
			// data: {'address': address}
		});
		let leaderboard = response.data;
		dispatch(actions.setLeaderboard(leaderboard));
	}
	const loadUserDate = async (address: string) => {
		if (!address) {
			dispatch(actions.setUserDate(Date.now()));
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/loadUserDate',
			data: {'address': address}
		});
		let loadUserDate = response.data;
		dispatch(actions.setUserDate(loadUserDate));
	}
	const loadUsername = async (address: string) => {
		if (!address) {
			dispatch(actions.setUsername(''));
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/loadUsername',
			data: {'address': address}
		});
		dispatch(actions.setUsername(response.data));
	}
	const saveConnect = async (address: string) => {
		if (!address) {
			return(0);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/saveConnect',
			data: {'address': address}
		});
		dispatch(actions.setToken(response.data));
		let isAdminResponse: any = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/checkIsAdmin',
			data: {'address': address, 'token': response.data}
		});
		console.log(`isAdminResponse`);
		console.log(isAdminResponse);
		const isAdmin = isAdminResponse && isAdminResponse.data.poolAuthority;
		console.log(`isAdmin = ${isAdmin}`);
		if (isAdmin) {
			const rewardPoolAccount = isAdminResponse.data;
			console.log(`rewardPoolAccount = ${rewardPoolAccount}`);
			dispatch(actions.setRewardPoolAccount(rewardPoolAccount));
		}
		dispatch(actions.setIsAdmin(isAdmin));
	}

	const loadExpeditions = async (address: string) => {
		if (!address) {
			return(1);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/expedition/expeditionInvites',
			data: {'address': address}
		});
		console.log(`expeditionInvites response`)
		console.log(response);
		dispatch(actions.setExpeditionInvites(response.data));
		// let isAdminResponse: any = await axios({
		// 	method: 'post',
		// 	url: BACKEND_URL+'/api/user/checkIsAdmin',
		// 	data: {'address': address, 'token': response.data}
		// });
		// console.log(`isAdminResponse`);
		// console.log(isAdminResponse);
		// const isAdmin = isAdminResponse && isAdminResponse.data.poolAuthority;
		// console.log(`isAdmin = ${isAdmin}`);
		// if (isAdmin) {
		// 	const rewardPoolAccount = isAdminResponse.data;
		// 	console.log(`rewardPoolAccount = ${rewardPoolAccount}`);
		// 	dispatch(actions.setRewardPoolAccount(rewardPoolAccount));
		// }
		// dispatch(actions.setIsAdmin(isAdmin));
	}

	useEffect(() => {
		loadTrails();
		loadTrailheads();
		loadLeaderboard();
	}, [])

	// const userAccount: Wallet = new Wallet(connection, provider.wallet);
	// const address = userAccount.publicKey;
	const useAddress = publicKey ? publicKey.toString() : '';
	if (useAddress !== data.address) {
		dispatch(actions.setAddress(useAddress));
		loadHikes(useAddress);
		loadSlideMovements(useAddress);
		loadUserXp(useAddress);
		loadUserDate(useAddress);
		loadUsername(useAddress);
		loadExpeditions(useAddress);
		saveConnect(useAddress);

		if (useAddress) {
			// getTransactionsOfUser(useAddress, {'limit':1000, 'maxSupportedTransactionVersion': 0}, connection);
		}

		if (useAddress) {
			var params = {Bucket: 'trails-avatars', Key: `${ useAddress }.png`};
			s3.getObject(params).on('success', function(response: any) {
				// console.log("Key was", response.request.params.Key);
				dispatch(actions.setImage(`https://trails-avatars.s3.us-east-1.amazonaws.com/${response.request.params.Key}`));
			}).on('error',function(error){
				//error return a object with status code 404
				dispatch(actions.setImage(``));
				console.log(`topbar avatar error`);
				console.log(error);
				
			}).send();
		} else {
			dispatch(actions.setImage(``));
			dispatch(actions.setSlideMovements([]));
		}
	}
	const rightPanel = <div className='col-12 col-md-4 right-col' style={{'paddingRight': '0'}}><RightPanel /></div>


	
	return (
		<BrowserRouter>
			<div className='App'>
				<XpCard />
				<div className='row'>
        			<div className='col-3 col-sm-2 col-md-4 col-lg-3 col-xl-2' style={{'paddingLeft': '0'}}>
						<LeftBar />
					</div>
        			<div className='col-9 col-sm-10 col-md-8 col-lg-9 col-xl-10' style={{'paddingLeft': '0'}}>
						<div className='row' style={{'paddingTop': '55px', 'maxWidth': '1100px', 'margin': '0 auto'}}>
						{/* <div className='main'> */}
							{/* <div className='row'> */}
								{
									isMobile ? rightPanel : null
								}
								<div className={`col middle-col`}>
									{
										useAddress == '' ? <MainPage />
										:
										<Routes>
											<Route path='/' element={<MainPage />} />
											<Route path='/expeditions' element={<ExpeditionsPage />} />
											<Route path='/settings' element={<SettingsPage />} />
											<Route path='/leaderboard' element={<LeaderboardPage />} />
											<Route path='/frontier' element={<FrontierPage />} />
											<Route path='/about' element={<AboutPage />} />
											<Route path='/admin' element={<AdminPage />} />
											<Route path='/:program' element={<ProgramPage />} />
											<Route path="*" element={<MainPage />} />
										</Routes>
									}
								</div>
								{
									isMobile ? null
									: rightPanel
								}
							</div>
						</div>
					</div>
					{/* </div> */}
				{/* </div> */}
			</div>
		</BrowserRouter>
	);
}

export default App;
