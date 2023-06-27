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
                <span>🗻</span>The first 50 users to complete the new Jito Trail earn a reward depending on your XP
            </div>
            <div>
                <span>💪</span>If you have 1,000+ XP, you will get 0.5 $SOL, if you have under 500 XP, you will get 0.25 $SOL
            </div>
            <div>
                <span>🐦</span>You must be following <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> and <a target={'_blank'} href='https://twitter.com/jito_labs'>@jito_labs</a> to earn the prize
            </div>
            <div>
                <span>💰</span>DM us at<a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> with your address and if you are have 1,000+ XP to receive your prize
            </div>
            </div>
        </div>
	);
}

export default FrontierPage;