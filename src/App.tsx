/***************/
/*     App     */
/***************/
// the app page we use to house everything and load global state data when needed

import AWS from 'aws-sdk';
import axios from 'axios';
import { Xp } from './models/Xp';
import { Trail } from './models/Trail';
import React, { useEffect } from 'react';
import XpCard from './components/XpCard';
import MainPage from './components/MainPage';
import { Trailhead } from './models/Trailhead';
import { BrowserRouter } from 'react-router-dom';
import { IState } from './store/interfaces/state';
import * as actions from './store/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '@solana/wallet-adapter-react';
import { AWS_KEY, AWS_SECRET, BACKEND_URL } from './constants/constants';


import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-tooltip/dist/react-tooltip.css';
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

function App() {
	// react hooks
	const dispatch = useDispatch();
	const { publicKey } = useWallet();
	const data: IState = useSelector((state: any) => state.data);

	const loadTrails = async () => {
		// load all the trails
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/trails/trails',
		});
		let trails: Trail[] = response.data;
		trails = trails.filter(x => x.hidden == false);
		dispatch(actions.setTrails(trails));
	}
	const loadTrailheads = async () => {
		// load all the trailheads
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/trailheads/trailheads',
		});
		let trailheads: Trailhead[] = response.data;
		trailheads = trailheads.sort((a, b) => b.id - a.id);
		trailheads = trailheads.filter(x => x.id != 16);
		trailheads = trailheads.filter(x => x.id != 20);
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
	const loadMadTrailScorecard = async (address: string) => {
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/madWars/updateMadTrail',
			data: {'address': address}
		});
		console.log(`loadMadTrailScorecard`);
		console.log(response.data);
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
		if (xps.filter(x => x.trailId == 'MadTrail')) {
			loadMadTrailScorecard(address);
		}
		dispatch(actions.setUserXp(xps.reduce((a, b) => a + b.xp, 0 )));
		dispatch(actions.setUserXps(response.data));
	}
	const loadLeaderboard = async () => {
		console.log(`starting loadLeaderboard`)
		let response = await axios({
			method: 'get',
			url: BACKEND_URL+'/api/hikes/leaderboard',
		});
		let leaderboard = response.data;
		console.log(`done loadLeaderboard`)
		console.log(leaderboard)
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
		const isAdmin = isAdminResponse && isAdminResponse.data.poolAuthority;
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
		dispatch(actions.setExpeditionInvites(response.data));
	}

	useEffect(() => {
		// load data on page load
		loadTrails();
		loadTrailheads();
		loadLeaderboard();
	}, [])

	const useAddress = publicKey ? publicKey.toString() : '';
	if (useAddress !== data.address) {
		// if we have changed wallets, update the data
		dispatch(actions.setAddress(useAddress));
		loadHikes(useAddress);
		loadSlideMovements(useAddress);
		loadUserXp(useAddress);
		loadUserDate(useAddress);
		loadUsername(useAddress);
		loadExpeditions(useAddress);
		saveConnect(useAddress);

		if (useAddress) {
			var params = {Bucket: 'trails-avatars', Key: `${ useAddress }.png`};
			s3.getObject(params).on('success', function(response: any) {
				dispatch(actions.setImage(`https://trails-avatars.s3.us-east-1.amazonaws.com/${response.request.params.Key}`));
			}).on('error',function(error){
				dispatch(actions.setImage(``));
				console.log(`topbar avatar error`);
				console.log(error);
				
			}).send();
		} else {
			dispatch(actions.setImage(``));
			dispatch(actions.setSlideMovements([]));
		}
	}
	
	return (
		<BrowserRouter>
			<div className='App'>
				<XpCard />
				<MainPage />
			</div>
		</BrowserRouter>
	);
}

export default App;
