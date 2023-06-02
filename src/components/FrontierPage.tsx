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
                <span>🗻</span>The first 50 users to complete the new Famous Fox Federation Trail earn 0.25 $SOL each
            </div>
            <div>
                <span>🟠</span>In addition, the first 50 FFF holders to complete the new Famous Fox Federation Trail earn 0.50 $SOL each
            </div>
            <div>
                <span>🐦</span>You must be following <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> and <a target={'_blank'} href='https://twitter.com/FamousFoxFed'>@FamousFoxFed</a> to earn the prize
            </div>
            <div>
                <span>💰</span>DM us at<a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> with your address and if you are a FFF holder to receive your prize
            </div>
            {/* </ul> */}
            </div>
        </div>
	);
}

export default FrontierPage;