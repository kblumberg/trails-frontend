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
import { BACKEND_URL, CONFIG, NETWORK, PROGRAM_ID } from 'src/constants/constants';
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

const tmp = async (txId: string) => {
    // console.log('tmp');
    // const txId = 'rfpVrbSB3DusHBLNzLBF2dgwEjf4BumVAQrGuZunP3TYrMUs8JD7n1Z7kJhh9hjtPgqcUDvAnJeLnjopoECPCKk';
    const connection = new Connection(NETWORK, CONFIG);
    const config: GetVersionedTransactionConfig = {
        'commitment': 'confirmed'
        , 'maxSupportedTransactionVersion': 100
    }
    // const tx = await connection.getTransaction(txId, config);
    let accountKeys: string[] = [];
    const result = await connection.getTransaction(txId, config);
    // console.log('result');
    // console.log(result);
    if (result) {
        const hasStaticAccountKeys = Object.hasOwn(result.transaction.message, 'staticAccountKeys');
        const hasInstructions = Object.hasOwn(result.transaction.message, 'staticAccountKeys');
        let accountKeys: string[] = [];
        if (hasStaticAccountKeys) {
            // @ts-ignore
            const resultV0: MessageV0 = result.transaction.message;
            const accountKeys2: string[] = result.meta && result.meta.postTokenBalances ? result.meta.postTokenBalances.map(x => x.owner ? x.owner : '') : [];
            const accountKeys0: string[] = resultV0.staticAccountKeys.map((x: any) => x.toString()) ;
            accountKeys = accountKeys0.concat(accountKeys2);
            console.log(`hasStaticAccountKeys`)
            console.log(accountKeys);
        } else if (hasInstructions) {
            const message: Message = result.transaction.message;
            const accountKeys2: string[] = result.meta && result.meta.postTokenBalances ? result.meta.postTokenBalances.map(x => x.owner ? x.owner : '') : [];
            const accountKeys0 = message.accountKeys.map((x: any) => x.toString());
            accountKeys = accountKeys0.concat(accountKeys2);
            console.log(`hasInstructions`);
            console.log(accountKeys);
        } else {
            // return(VerifyTransactionResult.WRONG_TX);
        }
    }
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
            const connection = new Connection(NETWORK, CONFIG);
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


	useEffect(() => {
		// load data on page load
        const ids = [ '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' ]
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            tmp(id);
        }
	}, [])

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