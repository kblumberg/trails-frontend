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
import { BACKEND_URL } from './constants/constants';
import * as actions from './store/actions/actions';
import { IState } from './store/interfaces/state';

import AWS from 'aws-sdk'

require('@solana/wallet-adapter-react-ui/styles.css');
const S3_BUCKET = 'props-avatars';
const REGION = 'us-east-1';

AWS.config.update({
    accessKeyId: 'AKIAULSMK74QTRRSAAPZ',
    secretAccessKey: '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'
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
		console.log(`loadHikes ${address}`);
		if (!address) {
			return([]);
		}
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/hikes/hikes',
			data: {'address': address}
		});
		let hikes = response.data;
		console.log(`loadHikes`);
		console.log(hikes);
		console.log(`doneHikes`);
		dispatch(actions.setHikes(hikes));
	}
	const loadLeaderboard = async () => {
		console.log(`loadLeaderboard `);
		// if (!address) {
		// 	return([]);
		// }
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/hikes/leaderboard',
			// data: {'address': address}
		});
		let leaderboard = response.data;
		console.log(`loadLeaderboard`);
		console.log(leaderboard);
		console.log(`doneLeaderboard`);
		dispatch(actions.setLeaderboard(leaderboard));
	}
	const saveConnect = async (address: string) => {
		console.log(`loadHikes ${address}`);
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
		saveConnect(useAddress);

		if (useAddress) {
			var params = {Bucket: 'trails-avatars', Key: `${ useAddress }.png`};
				s3.getObject(params).on('success', function(response: any) {
				console.log("Key was", response.request.params.Key);
				dispatch(actions.setImage(`https://trails-avatars.s3.us-east-1.amazonaws.com/${response.request.params.Key}`));
			}).on('error',function(error){
				//error return a object with status code 404
				dispatch(actions.setImage(``));
				console.log(`topbar avatar error`);
				console.log(error);
				
			}).send();
		} else {
			dispatch(actions.setImage(``));
		}
	}

	
	return (
		<BrowserRouter>
			<div className='App'>
				<LeftBar />
				<div className='main'>
					<div className='row'>
						<div className='col-8 middle-col'>
							{
								useAddress == '' ? <MainPage />
								:
								<Routes>
									<Route path='/' element={<MainPage />} />
									<Route path='/expeditions' element={<ExpeditionsPage />} />
									<Route path='/settings' element={<SettingsPage />} />
									<Route path='/leaderboard' element={<LeaderboardPage />} />
									<Route path='/:program' element={<ProgramPage />} />
									<Route path="*" element={<MainPage />} />
								</Routes>
							}
						</div>
						<div className='col-4 right-col'>
							<RightPanel />
						</div>
					</div>
				</div>
			</div>
		</BrowserRouter>
	);
}

export default App;
