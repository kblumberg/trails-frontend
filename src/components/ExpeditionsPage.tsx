/*****************************/
/*     Expeditions Page     */
/*****************************/
// This page displays all active and completed expeditions for a user

import axios from 'axios';
import Slides from './Slides';
import idl from '../idl.json';
import { Mint } from 'easy-spl';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import * as anchor from '@project-serum/anchor';
import { web3, BN } from '@project-serum/anchor';
import { IState } from 'src/store/interfaces/state';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Connection, PublicKey } from '@solana/web3.js';
import { ClaimRewardResult } from 'src/enums/ClaimRewardResult';
import { setExpeditionInvites } from 'src/store/actions/actions';
import { ExpeditionInviteDetail } from '../models/ExpeditionInviteDetail';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react';
import { BACKEND_URL, CONFIG, PROGRAM_NETWORK, PROGRAM_ID } from 'src/constants/constants';
import { createAssociatedTokenAccountSendUnsigned, formatDate, getCurrentTimestamp, getTokenFromMint, getTxUrl, parseMessage } from 'src/utils/utils';
import { GetVersionedTransactionConfig } from '@solana/web3.js';

import { Message } from '@solana/web3.js';

// TODO: hide expedition if there are not enough tokens in the vault (the claim reward tx will eventually error out)

const sendClaimRewardRequest = async (serializedTx: string, expeditionInviteId: string) => {
    const response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/expedition/claimReward',
        data: {'expeditionInviteId': expeditionInviteId, 'serializedTx': serializedTx}
    });
    console.log(`sendClaimRewardRequest response`);
    console.log(response);

    return(response);
}

const claimRewards = async (
    expeditionInvite: ExpeditionInviteDetail
    , addExpeditionInvite: any
    , walletContext: WalletContextState
) => {

    try {
        if (walletContext && walletContext.publicKey && walletContext.signTransaction) {
            // load the usual program info
            const programIdl: any = idl;
            const connection = new Connection(PROGRAM_NETWORK, CONFIG);
            const programId = new anchor.web3.PublicKey(PROGRAM_ID);
    
            // @ts-ignore
            const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
            const program = new anchor.Program(
                programIdl,
                programId,
                provider,
            );

            // convert the the decimal-adjusted amount
            const mint = new Mint(connection, new PublicKey( expeditionInvite.mint ));
            const mult = Math.pow(10, await mint.getDecimals());
            // @ts-ignore
            const amount = expeditionInvite.amount * mult;
            const feeAmount = Math.round(amount * expeditionInvite.feePct);


            // calculate the associated token accounts
            const recipientTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                connection
                , new PublicKey(expeditionInvite.mint)
                , walletContext.publicKey
                , walletContext
            )
            const vaultTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                connection
                , new PublicKey(expeditionInvite.mint)
                , new PublicKey(expeditionInvite.vaultAccount)
                , walletContext
            )
            const feeTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                connection
                , new PublicKey(expeditionInvite.mint)
                , new PublicKey(expeditionInvite.feeAccount)
                , walletContext
            )


            // initialize the claim tx
            const txId = await program.methods
            .distributeReward(new BN(amount), new BN(feeAmount))
            .accounts({
                distributionAuthority: new PublicKey(expeditionInvite.distributionAuthority),
                escrowAccount: new PublicKey(expeditionInvite.escrowAccount),
                vaultAccount: new PublicKey(expeditionInvite.vaultAccount),
                vaultTokenAccount: vaultTokenAccount,
                feeAccount: new PublicKey(expeditionInvite.feeAccount),
                feeTokenAccount: feeTokenAccount,
                recipient: new PublicKey(expeditionInvite.recipient),
                recipientTokenAccount: recipientTokenAccount,
                token: new PublicKey(expeditionInvite.mint),
                systemProgram: web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .transaction();
    
            txId.recentBlockhash = (
                await program.provider.connection.getLatestBlockhash()
            ).blockhash;
            txId.feePayer = new PublicKey(expeditionInvite.recipient);

            // serialize the tx to pass to the backend
            const signedTx = await walletContext.signTransaction(txId);
            const serialized = signedTx.serialize({ requireAllSignatures: false });
            const serializedTx = Buffer.from(serialized).toString('base64');
            
            // send the tx to the backend and display the results
            const response = await sendClaimRewardRequest(serializedTx, expeditionInvite.id);
            if (response.data.status == ClaimRewardResult.SUCCESS) {
                const txId = response.data.tx;
                const msg = () => toast(
                    <div>
                        Transaction Succeeded<br/><a target='_blank' href={getTxUrl(txId)}>View in Solana FM</a>
                    </div>
                    , {
                        'theme': 'light'
                        , 'type': 'success'
                    }
                );
                msg()
                addExpeditionInvite(expeditionInvite.id, txId);
            } else {
                const msg = () => toast(
                    <div>
                        Transaction Failed<br/><b>{`${parseMessage(response.data.status)}`}</b>
                    </div>
                    , {
                        'theme': 'light'
                        , 'type': 'error'
                    }
                );
                msg()
            }
        }
    } catch (err) {
        console.log(`claimRewards err`);
        console.log(err);
    }
}

const ExpeditionsPage = () => {
    const [show, setShow] = useState(false);
    const [trailId, setTrailId] = useState('');
    const [activeTab, setActiveTab] = useState('Active');
    const [expeditionInviteId, setExpeditionInviteId] = useState('');

    const wallet = useWallet();
    const dispatch = useDispatch();
    const data: IState = useSelector((state: any) => state.data);

    const addExpeditionInvite = (expeditionInviteId: string, txId: string) => {
        const curExpeditionInvite = data.expeditionInvites.filter(x => x.id == expeditionInviteId)[0];
        curExpeditionInvite.payoutTxId = txId;
        curExpeditionInvite.payoutTimestamp = getCurrentTimestamp();
        const newExpeditionInvites = data.expeditionInvites.filter(x => x.id != expeditionInviteId);
        newExpeditionInvites.push(curExpeditionInvite);
        dispatch(setExpeditionInvites(newExpeditionInvites));        
    }

    const handleClose = () => {
        setShow(false);
    };

    const handleTabClick = (e: any) => {
        setActiveTab(e.target.innerText);
    }

    // there is an Active campaign tab and a Completed tab
    const isActive = activeTab == 'Active';

    // create the rows of campaigns
    const rows = data.expeditionInvites.filter( x => isActive ? ( !x.payoutTxId ) && (x.maxNumClaims >= (x.currentClaims + 2)) : x.payoutTxId ).map( x => {
        const projects = data.trailheads.filter(trailhead => trailhead.id == x.trailheadId)
        if (projects.length) {
            const img = require(`../assets/projects/${projects[0].name.toLowerCase()}.png`);

            // check if the user has completed the expedition
            const completed = data.hikes.filter(hike =>
                (hike.result == VerifyTransactionResult.VERIFIED)
                && (hike.expeditionInviteId == x.id)
            ).length > 0;
            return(
                <tr key={x.expeditionId} className='trails-table-row'>
                    <td><img className='expedition-icon' alt='logo' src={String(img)}></img>{x.title}</td>
                    <td>{`${x.amount} $${getTokenFromMint(x.mint)}`}</td>
                    {
                        isActive ? 
                            <>
                                <td>{x.maxNumClaims - x.currentClaims} / {x.maxNumClaims}</td>
                                <td>{formatDate(x.endTimestamp)}</td>
                                <td>
                                    <Button className={`claim-button ${completed ? 'btn-success' : 'btn-primary'}`} onClick={() => {
                                        if (completed) {
                                            // if we have completed the expedition, claim our reward
                                            const val = claimRewards(x, addExpeditionInvite, wallet);
                                        } else {
                                            // otherwise, hike the trail!
                                            setTrailId(x.trailId);
                                            setShow(true);
                                            setExpeditionInviteId(x.id);
                                        }
                                    }}>{
                                        completed ? 'Claim Reward' : 'Begin'
                                    }</Button>
                                </td>
                            </>
                        : <>
                            <td>
                                {formatDate(x.payoutTimestamp, true, false)}
                            </td>
                            <td>
                                <a target='_blank' href={getTxUrl(x.payoutTxId)}>{x.payoutTxId.slice(0,8)}...</a>
                            </td>
                        </>
                    }
                </tr>
            )
        } else {
            return(null);
        }
    })
	return (
        <div className='expeditions-page'>
            <div className='trails-tabs row'>
                <div className={`col ${activeTab == 'Active' ? 'active' : ''}`} onClick={handleTabClick}>
                    Active
                </div>
                <div className={`col ${activeTab == 'Completed' ? 'active' : ''}`} onClick={handleTabClick}>
                    Completed
                </div>
            </div>
            <div className='trails-panel-outer-1'>
                <div className='trails-panel-outer-2'>
                    <div className='trails-panel-outer-3'>
                        <Table hover>
                            <thead>
                                <tr className='trails-table-row'>
                                    <th>Project</th>
                                    <th>Reward</th>
                                    {
                                        isActive ? 
                                        <>
                                            <th>Remaining</th>
                                            <th>Deadline</th>
                                            <th></th>
                                        </>
                                        : <><th>Date</th><th>Tx</th></>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
            {
                // if the user start the expedition, we will show them the slides
                <Slides trailheadId={-1} expeditionInviteId={expeditionInviteId} show={show} trailId={trailId} handleClose={handleClose} />
            }
            <ToastContainer
                position="bottom-left"/>
        </div>
	);
}

export default ExpeditionsPage;