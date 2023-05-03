import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { useParams } from "react-router-dom"
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
            <span>🗻</span>The first 100 users to reach 100 XP will receive 1 $SOL
            </div>
            <div>
                <span>🙅</span>People who try to sybil the protocol will be disqualified
            </div>
            <div>
                <span>💰</span>Once at 100 XP, comment on the <a target={'_blank'} href='https://twitter.com/TrailsProtocol/status/1651299378684887058'>original post</a> with your address or DM us <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> to receive your $SOL
            </div>
            {/* </ul> */}
            </div>
        </div>
	);
}

export default FrontierPage;