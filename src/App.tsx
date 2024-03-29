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
import { Xp } from './models/Xp';
import { isMobile } from './utils/utils';
import FrontierPage from './components/FrontierPage';
import { Trail } from './models/Trail';
import { Trailhead } from './models/Trailhead';

import 'react-tooltip/dist/react-tooltip.css';
import MainPanel from './components/MainPanel';

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

const getTransactionsOfUser = async (address: string, options: any, connection: Connection) => {
    try {
      const publicKey = new PublicKey(address);
      const transSignatures =
        await connection.getConfirmedSignaturesForAddress2(publicKey, options);
      const transactions = [];
      for (let i = 0; i < transSignatures.length; i++) {
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
			// console.log(`confirmedTransaction`);
			// console.log(confirmedTransaction);
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

	const connection = new Connection(NETWORK, CONFIG);

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
		trailheads = trailheads.filter(x => x.hidden == false);
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
	const loadMadTrailScorecard = async (address: string) => {
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/madWars/updateMadTrail',
			data: {'address': address}
		});
		// console.log(`loadMadTrailScorecard`);
		// console.log(response.data);
		dispatch(actions.setMadTrailScorecard(response.data));
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
		const xps: Xp[] = response.data;
		if (xps.filter(x => x.trailId == 'MadTrail').length > 0) {
			// console.log(`loadUserXp loadMadTrailScorecard`)
			loadMadTrailScorecard(address);
		}
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
				<MainPanel />
			</div>
		</BrowserRouter>
	);
}

export default App;
