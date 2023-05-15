import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo, useState } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Link, Outlet } from "react-router-dom"


const RightPanel = (props: any) => {
	const solNetwork = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

	const { publicKey, wallet, disconnect } = useWallet();

	const [hasLoaded , setHasLoaded] = useState(false);
	const [userAddress , setUserAddress] = useState('');
	// const rows: Row[] = [];
	const [levels , setLevels] = useState({} as any);
	const [num, setNum] = React.useState(15);


    if (publicKey && publicKey.toString() != '' && publicKey.toString() != userAddress) {
		setUserAddress(publicKey.toString());
    }

	const program_d: any = {
		'Magic': 'Magic Eden'
		, 'Exchange': 'Exchange Art'
	};

	// const programs = [ 'jupiter','magic','zetamarkets','jupiter','genopets','staratlas','raydium','famousfoxfederation','tensorswap','hadeswap','wormhole','hyperspace','openbook','opensea','jito' ];

	// const programs = [ 'Jupiter','Magic','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]
	const programs: string[] = []
	// const programs = [ 'Jupiter','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]

	const divs: any[] = [];
	for (let i = 0; i < programs.length; i++) {
		const name: string = Object.hasOwn(program_d, programs[i]) ? program_d[programs[i]] : programs[i];
		// const ext = ['Opensea','Jupiter','Openbook','Exchange','Orca'].includes(programs[i]) ? 'png' : 'jpeg'
		const ext = 'png';
		const img = require(`../assets/projects/${programs[i].toLowerCase()}.${ext}`);
		const level = Object.hasOwn(levels, programs[i]) ? levels[programs[i]] : 1;
		// const img = (`./assets/${programs[i].toLowerCase()}.${ext}`);
		// console.log(`img = ${img}`)
		const cur = 
			<div key={i} className='col-3'>
                <Link to={`/${name.replace(/ /g,'_')}`}>
                    <div className='card'>
                        <div className='img'>
                            <img className='icon' alt='logo' src={String(img)} />
                        </div>
                        <div>
                            {name}
                        </div>
                        <div>
                            Level {level}
                        </div>
                    </div>
                </Link>
			</div>
		divs.push(cur);
	}

	
	const curState = hasLoaded ? 1 : publicKey ? 2 : 3;
	// console.log(`curState = ${curState}`);
	return (
        <>
            <div className='right-panel-header'>
				{/* <div className='xp'>
					<div>
						<AnimatedNumber
						// number={num}
						animateToNumber={num}
						includeComma={true}
						// fontStyle={{ fontSize: 32 }}
						// configs={(number, index) => {
						// 	return { mass: 5, tension: 130 * (index + 1), friction: 10 };
						// }}

						locale="en-US"
						configs={[
						  { mass: 1, tension: 70, friction: 15 },
						//   { mass: 1, tension: 10, friction: 130 },
						//   { mass: 1, tension: 10, friction: 90 },
						//   { mass: 1, tension: 10, friction: 135 },
						//   { mass: 1, tension: 10, friction: 100 },
						//   { mass: 1, tension: 10, friction: 180 },
						]}
						></AnimatedNumber>
					</div>
					<div>XP</div>
				</div> */}
                <WalletMultiButton/>
            </div>
            {/* <div className='right-panel-panel' onClick={() => {
				const n = num;
				setNum(n + 15);
			}}>
                <img className='right-panel-img' alt='logo' src={String(xp)} />
            </div> */}
        </>
	);
}

export default RightPanel;