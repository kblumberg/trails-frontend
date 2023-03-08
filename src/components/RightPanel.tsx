import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo, useState } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Flipside, Query, Row, QueryResultSet } from "@flipsidecrypto/sdk";
import { Link, Outlet } from "react-router-dom"


const home = require('../assets/home.png');
const shield = require('../assets/shield.png');
const settings = require('../assets/settings.png');
const market = require('../assets/market.png');
const xp = require('../assets/xp.png');
const loading = require('../assets/loading.gif');

const API_KEY: string = `${"756df6bd-d941-43a4-ad61-9120c6a106cc"}`;

const getQuery = (address: string) => {
	// const query = 
	const query: Query = {
	  sql: 
      `
		WITH t0 AS (
			SELECT INITCAP(SPLIT(marketplace, ' ')[0]::string) AS program
			, COUNT(1) AS n
			FROM solana.core.fact_nft_sales
			WHERE block_timestamp >= CURRENT_DATE - 180
				AND (
					purchaser = '${address}'
					OR seller = '${address}'
				)
			GROUP BY 1
			ORDER BY 2 DESC
		), t1 AS (
			SELECT INITCAP(SPLIT(swap_program, ' ')[0]::string) AS program
			, COUNT(1) AS n
			FROM solana.core.fact_swaps
			WHERE block_timestamp >= CURRENT_DATE - 180
				AND swapper = '${address}'
			GROUP BY 1
			ORDER BY 2 DESC
		), t2 AS (
			SELECT *
			FROM t0
			UNION 
			SELECT *
			FROM t1
		)
		SELECT *
		, LOG(2, n + 1) + 1 AS log_n
		FROM t2
		ORDER BY n DESC
	  `
      ,
	  ttlMinutes: 10,
	};
	return(query);
}



const RightPanel = (props: any) => {
	const solNetwork = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

	const { publicKey, wallet, disconnect } = useWallet();

	const [hasLoaded , setHasLoaded] = useState(false);
	const [userAddress , setUserAddress] = useState('');
	// const rows: Row[] = [];
	const [data , setData] = useState([] as Row[]);
	const [levels , setLevels] = useState({} as any);

	const runSDKApi = async (address: string) => {
		const flipside = new Flipside(
			API_KEY,
			"https://node-api.flipsidecrypto.com"
		);
		console.log(`Running query for address ${address}`);
		
		const query = getQuery(address);
		const start = new Date().getTime();

        // fetch('https://node-api.flipsidecrypto.com/queries' , {
        //     mode: 'no-cors',
        //     method: 'POST',
        //     credentials: 'include',
        //     // @ts-ignore
        //     sql: query,
        //     ttlMinutes: 10,
        //     headers:{
        //         "Accept": "application/json", "Content-Type": "application/json charset=UTF-8", "x-api-key": API_KEY, "Access-Control-Allow-Origin": "*"
        //     }

        // }).then((response) => {
        //     console.log(response.status);
        //     console.log(response);
        //     const end = new Date().getTime();
        //     console.log(`Took ${Math.round((end - start) / 1000)} seconds to run the query`);
        //     setHasLoaded(true);
        //     return response.json()
        // }).catch((error) => {
        //     console.log(error);
        //     setHasLoaded(true);
        // })

        const result = await flipside.query.run(query);
		const end = new Date().getTime();
		console.log(`Took ${Math.round((end - start) / 1000)} seconds to run the query`);
		
		console.log(`result for address ${address}`);
		console.log(result.rows);
		const curLevels: any = {};
		if (result.rows) {
			setData(result.rows);
			for(let i = 0; i < result.rows.length; i++) {
				const cur: any = result.rows[i];
				console.log('cur.values');
				console.log(cur);
				curLevels[cur[0]] = parseInt(cur[2]);
			}
		}
		setHasLoaded(true);
		setLevels(curLevels);
	}

    if (publicKey && publicKey.toString() != '' && publicKey.toString() != userAddress) {
		setUserAddress(publicKey.toString());
        runSDKApi(publicKey.toString());
    }

	const program_d: any = {
		'Magic': 'Magic Eden'
		, 'Exchange': 'Exchange Art'
	};

	// const programs = [ 'jupiter','magic','zetamarkets','jupiter','genopets','staratlas','raydium','famousfoxfederation','tensorswap','hadeswap','wormhole','hyperspace','openbook','opensea','jito' ];

	const programs = [ 'Jupiter','Magic','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]
	// const programs = [ 'Jupiter','Raydium','Orca','Hadeswap','Saber','Exchange','Hyperspace','Solanart','Opensea' ]

	const divs: any[] = [];
	for (let i = 0; i < programs.length; i++) {
		const name: string = Object.hasOwn(program_d, programs[i]) ? program_d[programs[i]] : programs[i];
		const ext = ['Opensea','Jupiter','Openbook','Exchange','Orca'].includes(programs[i]) ? 'png' : 'jpeg'
		const img = require(`../assets/${programs[i].toLowerCase()}.${ext}`);
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
                <WalletMultiButton/>
            </div>
            <div className='right-panel-panel'>
                <img className='right-panel-img' alt='logo' src={String(xp)} />
            </div>
        </>
	);
}

export default RightPanel;