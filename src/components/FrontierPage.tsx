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
                <span>🗻</span>The top 20 on the "Overall" <NavLink  to ='/leaderboard'>leaderboard</NavLink> on May 16 @ 9pm UTC will receive 1 $SOL each
            </div>
            <div>
                <span>😎</span>The top 20 on the "Campaign" <NavLink  to ='/leaderboard'>leaderboard</NavLink> on May 16 @ 9pm UTC will receive 2 $SOL each
            </div>
            <div>
                <span>☀️</span>Only XP from Drift, Solend, Solarplex + MarginFi will count towards the "Campaign" leaderboard
            </div>
            <div>
                <span>🐦</span>You must be following <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a>, <a target={'_blank'} href='https://twitter.com/DriftProtocol'>@DriftProtocol</a>, <a target={'_blank'} href='https://twitter.com/solendprotocol'>@solendprotocol</a>, <a target={'_blank'} href='https://twitter.com/solarplex_xyz'>@solarplex_xyz</a>, and <a target={'_blank'} href='https://twitter.com/marginfi'>@marginfi</a> on Twitter to earn the "Campaign" leaderboard prize
            </div>
            <div>
                <span>💰</span>DM us at<a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> with your address to receive your prize
            </div>
            {/* </ul> */}
            </div>
        </div>
	);
}

export default FrontierPage;