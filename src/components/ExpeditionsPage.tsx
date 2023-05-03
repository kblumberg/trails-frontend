import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { useParams } from "react-router-dom"
import { CONFIG, NETWORK } from 'src/constants/constants';


const rv = require('../assets/icons/rv.png');

const ExpeditionsPage = (props: any) => {
	return (
        <div className='expeditions-page'>
            <div>
                <img className='rocket' src={String(rv)} />
            </div>
            <div className='launching-soon'>
                ARE WE THERE YET?
            </div>
            <div>
                This page is en route
            </div>
        </div>
	);
}

export default ExpeditionsPage;