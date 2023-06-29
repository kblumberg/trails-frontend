import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { NavLink, useParams } from "react-router-dom"
import { CONFIG, NETWORK } from 'src/constants/constants';
import { MDBAccordion, MDBAccordionItem } from 'mdb-react-ui-kit';


const frontier = require('../assets/assets/frontier.png');

const FrontierPage = (props: any) => {
    const rows = [
        []
    ]
	return (
        <div className='frontier-page'>
            <img src={String(frontier)} />
            <div className='frontier-bullets'>
            {/* <ul> */}
            <div>
            <span>⛏️</span>The Frontier Program is designed to reward early Trails adopters
            </div>
            <div>
                <span>🗻</span>The first 100 users to complete the Mad Trail earn 0.5 $SOL
            </div>
            <div>
                <span>💪</span>Users in the top 20 on the Mad Trail Leaderboard on July 5th at 9pm UTC earn 1 $SOL
            </div>
            <div>
                <span>🐦</span>You must be following <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> and <a target={'_blank'} href='https://twitter.com/ZetaMarkets'>@ZetaMarkets</a> to earn the prize
            </div>
            <div>
                <span>💰</span>DM us at<a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> with your address to receive your prize
            </div>
            </div>
        </div>
	);
}

export default FrontierPage;