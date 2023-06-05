import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom"
import { CONFIG, NETWORK } from 'src/constants/constants';
import { IState } from 'src/store/interfaces/state';
import { getTokenFromMint } from 'src/utils/utils';


const rv = require('../assets/icons/rv.png');

const ExpeditionsPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
    const rows = data.expeditionInvites.map( x => {
        // const status = x.claimTimestamp
        return(
            <tr>
                <td>{x.title}</td>
                <td>{`${x.amount} $${getTokenFromMint(x.mint)}`}</td>
                <td>{x.maxNumClaims}</td>
            </tr>
        )
    } )
	return (
        <div className='expeditions-page'>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Expedition</th>
                            <th>Reward</th>
                            <th>Claims</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rows
                        }
                    </tbody>
                </table>
            </div>
        </div>
	);
}

export default ExpeditionsPage;