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
		const style = i ? {} : {'backgroundColor': 'rgb(134,205,194 );'}
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
		const letters = 'RECOMMENDED'.split('').map((l, ind) => {
			const r = 60 - (ind * 12);
			const b = (-(8 * (ind > 4 ? 10 - ind : ind))) - 80;
			return(<span style={{'position': 'absolute', 'bottom': `${(b)-20}px`, 'left': `${12*ind}px`, 'transform': `rotate(${r}deg)`}}>{l}</span>)
		})
		const imgClass = programs[i].toLowerCase() == 'psyfi' ? 'white-bg': '';
		const cur = 
			<div key={i} className='col-6 col-md-6 col-lg-4 col-xl-3'>
				{/* <div className={`outer-ring pie no-round pct_${i}`} > */}
				<div className={`outer-ring`} style={style} >
					<span style={{'position':'absolute','left':'10px'}}>{ i == 0 ? 
					<>
					{letters}
						{/* <span className='char-1' style={{'position': 'absolute', 'bottom': '-1px;'}}>R</span>
						<span className='char-2' style={{'position': 'absolute', 'bottom': '-5px;', 'left': '10px'}}>e</span>
						<span className='char-3' style={{'position': 'absolute', 'bottom': '10px;', 'left': '20px'}}>c</span>
						<span className='char-4' style={{'position': 'absolute', 'bottom': '15px;', 'left': '30px'}}>o</span>
						<span className='char-5' style={{'position': 'absolute', 'bottom': '20px;', 'left': '40px'}} >m</span>
						<span className='char-6' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '50px'}} >m</span>
						<span className='char-7' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '60px'}} >e</span>
						<span className='char-8' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '70px'}} >n</span>
						<span className='char-9' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '80px'}} >d</span>
						<span className='char-10' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '90px'}} >e</span>
						<span className='char-11' style={{'position': 'absolute', 'bottom': '-1px;', 'left': '100px'}}>d</span> */}
					</> : <></>}</span>
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