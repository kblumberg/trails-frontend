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
import { clusterApiUrl } from '@solana/web3.js';
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
import { AWS_KEY, AWS_SECRET, BACKEND_URL } from './constants/constants';
import * as actions from './store/actions/actions';
import { IState } from './store/interfaces/state';

import AWS from 'aws-sdk'
import TestPage from './components/TestPage';
import XpCard from './components/XpCard';
import AboutPage from './components/AboutPage';
import { Xp } from './models/Xp';
import { isMobile } from './utils/utils';

require('@solana/wallet-adapter-react-ui/styles.css');
const S3_BUCKET = 'trails-avatars';
const REGION = 'us-east-1';

console.log(`AWS_KEY = ${AWS_KEY}`)
AWS.config.update({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET
})
const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

function App() {
	const solNetwork = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

	const config: SolflareWalletAdapterConfig = {
		'network': solNetwork
	};

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
		let trails = response.data;
		console.log(`loadTrails`);
		console.log(trails);
		dispatch(actions.setTrails(trails));
	}
	const loadTrailheads = async () => {
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/trailheads/trailheads',
		});
		let trailheads = response.data;
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
		console.log(`loadSlideMovements`);
		console.log(response.data);
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
		console.log(`xps`);
		console.log(xps);
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
		console.log(`loadUserDate ${address}`);
		if (!address) {
			dispatch(actions.setUserDate(Date.now()));
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/loadUserDate',
			data: {'address': address}
		});
		console.log(`loadUserDate response`);
		console.log(response);
		let loadUserDate = response.data;
		dispatch(actions.setUserDate(loadUserDate));
	}
	const loadUsername = async (address: string) => {
		console.log(`loadUsername ${address}`);
		if (!address) {
			dispatch(actions.setUsername(''));
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/user/loadUsername',
			data: {'address': address}
		});
		console.log(`setUsername response`);
		console.log(response);
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
		saveConnect(useAddress);

		if (useAddress) {
			console.log(`useAddress = ${useAddress}`);
			var params = {Bucket: 'trails-avatars', Key: `${ useAddress }.png`};
			s3.getObject(params).on('success', function(response: any) {
				// console.log("Key was", response.request.params.Key);
				console.log(`topbar avatar success`);
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
        			<div className='col' style={{'paddingLeft': '0'}}>
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
											<Route path='/test' element={<TestPage />} />
											<Route path='/about' element={<AboutPage />} />
											<Route path='/:program' element={<TestPage />} />
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
