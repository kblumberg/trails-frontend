import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { useParams } from "react-router-dom"
import { CONFIG, NETWORK } from 'src/constants/constants';
import { MDBAccordion, MDBAccordionItem } from 'mdb-react-ui-kit';


const frontier = require('../assets/frontier.png');

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
            <span>🗻</span>The first 100 users to reach 100 XP will receive 1 $SOL
            </div>
            <div>
                <span>🙅</span>People who try to sybil the protocol will be disqualified
            </div>
            {/* </ul> */}
            </div>
        </div>
	);
}

export default FrontierPage;