import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo, useState } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Link, Outlet } from "react-router-dom"
import { IState } from 'src/store/interfaces/state';
import { useSelector } from 'react-redux';


const MainPage = (props: any) => {
	const solNetwork = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

	const { publicKey, wallet, disconnect } = useWallet();

	const [userAddress , setUserAddress] = useState('');
	// const rows: Row[] = [];
	// const [data , setData] = useState([] as Row[]);
	const [levels , setLevels] = useState({} as any);

	const data: IState = useSelector((state: any) => state.data);


    if (publicKey && publicKey.toString() != '' && publicKey.toString() != userAddress) {
		setUserAddress(publicKey.toString());
    }

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

	// const programs = [ 'jupiter','magic','zetamarkets','jupiter','genopets','staratlas','raydium','famousfoxfederation','tensorswap','hadeswap','wormhole','hyperspace','openbook','opensea','jito' ];

	// const programs = [ 'Jupiter','Magic','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]
	// const programs = [ 'Jupiter','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]
	const programs = data.trailheads.map(x => x.name);
	// console.log('programs');
	// console.log(programs);

	const divs: any[] = [];
	for (let i = 0; i < programs.length; i++) {
		const trailheadId = data.trailheads[i].id;
		const trails = data.trails.filter(x => x.trailheadId == trailheadId);
		if (trails.length == 0) {
			continue;
		}
		const name: string = Object.hasOwn(program_d, programs[i]) ? program_d[programs[i]] : programs[i];
		// const project = name == 
		// const ext = ['Opensea','JupiterExchange','FamousFoxFederation','AverExchange','Openbook','Exchange','Orca','Bonk','MarinadeFinance','DriftProtocol'].includes(programs[i]) ? 'png' : 'jpeg'
		const ext = 'png'
		const img = require(`../assets/projects/${programs[i].toLowerCase().replaceAll(' ', '')}.${ext}`);
		const level = Object.hasOwn(levels, programs[i]) ? levels[programs[i]] : 1;
		// const img = (`./assets/${programs[i].toLowerCase()}.${ext}`);
		// console.log(`img = ${img}`)
		const imgClass = programs[i].toLowerCase() == 'psyfi' ? 'white-bg': '';
		const cur = 
			<div key={i} className='col-6 col-md-6 col-lg-4 col-xl-3'>
				{/* <div className={`outer-ring pie no-round pct_${i}`} > */}
				<div className={`outer-ring`} >
					<div className='inner-ring'>
						<Link to={`/${programs[i].replace(/ /g,'')}`}>
							<div className='card'>
								<div className={`img ${imgClass}`}>
									<img className='icon' alt='logo' src={String(img)}></img>
									<div className='project-name'>{name}</div>
								</div>
								{/* <div>
									{name}
								</div>
								<div>
									Level {level}
								</div> */}
							</div>
						</Link>
					</div>
				</div>
			</div>
		divs.push(cur);
	}

	
	const curState = publicKey ? 1 : 2;
	// console.log(`curState = ${curState}`);
	return (
        <>
			{
				curState == 1 ? 
					<div className='row cards'>
						{divs}
					</div> 
				: <div>Connect your wallet to resume your journey!</div>
			}
		</>
	);
}

export default MainPage;