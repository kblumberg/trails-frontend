import { Connection, GetVersionedTransactionConfig, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom"
import { BACKEND_URL, CONFIG, NETWORK, PROGRAM_ID } from 'src/constants/constants';
import { IState } from 'src/store/interfaces/state';
import { createAssociatedTokenAccountSendUnsigned, formatDate, getCurrentTimestamp, getTokenFromMint, getTxUrl, parseMessage } from 'src/utils/utils';
import Slides from './Slides';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import idl from '../idl.json';
import * as anchor from '@project-serum/anchor';
import axios from 'axios';
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Button } from 'react-bootstrap';
import { ClaimRewardResult } from 'src/enums/ClaimRewardResult';
import { web3, BN } from '@project-serum/anchor';
import { BorshCoder } from '@project-serum/anchor';
import { ExpeditionInviteDetail } from '../models/ExpeditionInviteDetail';
import { ToastContainer, toast } from 'react-toastify';
import Table from 'react-bootstrap/Table';
import { setExpeditionInvites } from 'src/store/actions/actions';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// TODO: hide if there are not enough tokens in the vault (the claim reward tx will eventually error out)

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
    , setErrorText: any
) => {

    try {


        if (walletContext) {
    
            
            const connection = new Connection(NETWORK, CONFIG);
    
            const programIdl: any = idl;
            const programId = new anchor.web3.PublicKey(PROGRAM_ID);
    
            // @ts-ignore
            const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
            const program = new anchor.Program(
                programIdl,
                programId,
                provider,
            );

            const amount = new BN(expeditionInvite.amount * LAMPORTS_PER_SOL);


            if (walletContext && walletContext.publicKey && walletContext.signTransaction) {

                const recipientTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                    connection
                    , new PublicKey(expeditionInvite.mint)
                    , walletContext.publicKey
                    , walletContext
                )
                console.log(`recipientTokenAccount = ${recipientTokenAccount.toString()}`);
    
                const vaultTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                    connection
                    , new PublicKey(expeditionInvite.mint)
                    , new PublicKey(expeditionInvite.vaultAccount)
                    , walletContext
                )
    
                const feeTokenAccount = await createAssociatedTokenAccountSendUnsigned(
                    connection
                    , new PublicKey(expeditionInvite.mint)
                    , new PublicKey(expeditionInvite.vaultAccount)
                    , walletContext
                )
                // initialize the claim tx
                const txId = await program.methods
                .distributeReward(amount)
                .accounts({
                    distributionAuthority: new PublicKey(expeditionInvite.distributionAuthority),
                    escrowAccount: new PublicKey(expeditionInvite.escrowAccount),
                    vaultAccount: new PublicKey(expeditionInvite.vaultAccount),
                    vaultTokenAccount: vaultTokenAccount,
                    recipient: new PublicKey(expeditionInvite.recipient),
                    recipientTokenAccount: recipientTokenAccount,
                    token: new PublicKey(expeditionInvite.mint),
                    systemProgram: web3.SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                // .rpc()
                .transaction();
                console.log(`104`);
                console.log(txId);
        
                txId.recentBlockhash = (
                    await program.provider.connection.getLatestBlockhash()
                ).blockhash;
                console.log(`109`);
                txId.feePayer = new PublicKey(expeditionInvite.recipient);
        
                console.log(`txId`);
                console.log(txId);
                console.log(txId.signature);
                
                
                    // txId.sign(walletContext);
                    // const serializedTx = txId.serialize({ requireAllSignatures: false });
                    // send serialized tx to backend
                    // const serialized = txId.serialize({ requireAllSignatures: false }) 
                    // const serializedTx = Buffer.from(serialized).toString('base64');
                    
                    // const transactionBuf = Buffer.from(
                    //     serializedTx
                    //     , 'base64'
                    // )
                    // const versionedTransaction = VersionedTransaction.deserialize(transactionBuf);
                    // console.log(`versionedTransaction`);
                    // console.log(versionedTransaction);
                    const signedTx = await walletContext.signTransaction(txId);
                    const serialized = signedTx.serialize({ requireAllSignatures: false });
                    const serializedTx = Buffer.from(serialized).toString('base64');
                    // console.log(`txId`);
                    // console.log(txId);
                    
                    // const serialized = txId.serialize();
                    // const serializedTx = Buffer.from(serialized).toString('base64');
                    const response = await sendClaimRewardRequest(serializedTx, expeditionInvite.id);
                    console.log(response.data);
                    console.log(response.data.status == ClaimRewardResult.SUCCESS);
                    if (response.data.status == ClaimRewardResult.SUCCESS) {
                        const txId = response.data.tx;
                        const msg = () => toast(
                            <div>
                                Transaction Succeeded<br/><a target='_blank' href={getTxUrl(txId)}>View in Solana FM</a>
                                {/* {`Transaction Succeeded ${response.data.tx}`} */}
                            </div>
                            , {
                                'theme': 'light'
                                , 'type': 'success'
                            }
                        );
                        msg()
                        addExpeditionInvite(expeditionInvite.id, txId);
                    } else {
                        // setErrorText( parseMessage(response.data.status) );
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
            }
            // console.log(`txId`);
            // console.log(txId);

            // // @ts-ignore
            // const coder = new BorshCoder(idl);
            // const ix = coder.instruction.decode(
            //     txId.instructions[0].data,
            //     'base58',
            // );
            // console.log(`ix`);
            // console.log(ix);
            // // @ts-ignore
            // const b: BN = ix?.data.amount;
            // console.log(b.toNumber());
    
            // let response = await sendClaimRewardRequest(serializedTx, expeditionInvite.id)
            // console.log(`claimRewards response`);
            // console.log(response);
            // if(response.data.status !== ClaimRewardResult.SUCCESS) {
            //     setErrorText(parseMessage(response.data.status));
            // }
    
            // const transactionBuf = Buffer.from(
            //     response.data.tx
            //     , 'base64'
            // )
            // const versionedTransaction = VersionedTransaction.deserialize(transactionBuf);
            // console.log(`versionedTransaction`);
            // console.log(versionedTransaction);
    
            // if (walletContext && walletContext.signTransaction) {
            //     const txId = await walletContext.signTransaction(versionedTransaction);
            //     console.log(`txId`);
            //     console.log(txId);

            //     const serialized = txId.serialize();
            //     const serializedTx = Buffer.from(serialized).toString('base64');

            //     const response = await axios({
            //         method: 'post',
            //         url: BACKEND_URL+'/api/expedition/finalizeReward',
            //         data: {'txBuffer': serializedTx}
            //     });
            //     console.log(`finalizeReward response`);
            //     console.log(response);
            //     return(response);
    
            //     const final_tx = await provider.connection.sendRawTransaction(
            //         txId.serialize()
            //         // txId.serialize({ verifySignatures: false, requireAllSignatures: false }),
            //     );
            //     console.log(`final_tx`);
            //     console.log(final_tx);
    
            //     const res = await provider.connection.confirmTransaction(final_tx, "confirmed");
            //     console.log(`res`);
            //     console.log(res);
            // }
            // return(ClaimRewardResult.SUCCESS);
    
            // versionedTransaction.sign([walletContext]);
    
    
            // Deserialize it and then sign with provider wallet
            // let recoveredTransaction: Transaction | undefined = Transaction.from(Buffer.from(response.data));
            // console.log(`recoveredTransaction`);
            // console.log(recoveredTransaction);
            
        //     // recoveredTransaction = await provider.wallet.signTransaction(recoveredTransaction);
        //     const recoveredTransaction = await provider.wallet.signTransaction(versionedTransaction);
        //     // recoveredTransaction.feePayer = provider.wallet.publicKey;
        //     console.log(`recoveredTransaction`);
        //     console.log(recoveredTransaction);
    
        //     const final_tx = await provider.connection.sendRawTransaction(
        //         recoveredTransaction.serialize({ verifySignatures: false, requireAllSignatures: false }),
        //     );
        //     console.log(`final_tx`);
        //     console.log(final_tx);
    
        //     const res = await provider.connection.confirmTransaction(final_tx, "confirmed");
        //     console.log(`res`);
        //     console.log(res);
        // }
    } catch (err) {
        console.log(`claimRewards err`);
        console.log(err);
    }

    
    // const connection = new Connection(NETWORK, CONFIG);
    // const mint = new Mint(connection, new PublicKey(mintAddress));
    // const decimals = await mint.getDecimals();

    // const programIdl: any = idl;
    // const programId = new anchor.web3.PublicKey(PROGRAM_ID);

    // if (walletContext) {
    //     // @ts-ignore
    //     const provider = new anchor.AnchorProvider(connection, walletContext, CONFIG);
    //     const program = new anchor.Program(
    //         programIdl,
    //         programId,
    //         provider,
    //     );

    //     const mint = new PublicKey(SOL_ADDRESS)


    // const txId = await program.methods
    // .depositFunds(new BN(amount * Math.pow(10, decimals)))
    // .accounts({
    //     poolAuthority: new PublicKey(userAddress),
    //     escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
    //     vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
    //     token: mint,
    //     systemProgram: web3.SystemProgram.programId,
    // })
    // .rpc()
}

const ExpeditionsPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
    const [trailId, setTrailId] = useState('');
    const [errorText, setErrorText] = useState('');
    const [expeditionInviteId, setExpeditionInviteId] = useState('');
    const [show, setShow] = useState(false);
    const [trailheadId, setTrailheadId] = useState(-1);
    const [activeTab, setActiveTab] = useState('Active');

    const dispatch = useDispatch();

    const wallet = useWallet();

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
        // console.log(`handleTabClick`)
        // console.log(e.target);
        setActiveTab(e.target.innerText);
    }

    const tableRows = data.expeditionInvites.map( x => {
        const projects = data.trailheads.filter(trailhead => trailhead.id == x.trailheadId)
        // const status = x.claimTimestamp
        if (projects.length) {
            return(
                <tr>
                    <td className='col'>{projects[0].name}</td>
                    <td>{x.title}</td>
                    <td>{`${x.amount} $${getTokenFromMint(x.mint)}`}</td>
                    <td>{x.maxNumClaims}</td>
                </tr>
            )
        } else {
            return(null);
        }
    })
    // console.log(`trailId = ${trailId}. trailheadId = ${trailheadId}. show = ${show}. `)
    // console.log(data.expeditionInvites)
    const isActive = activeTab == 'Active';
    // at least 2 claims left (provide buffer to prevent going over; could also implement a "claim when you start" system)
    const rows = data.expeditionInvites.filter( x => isActive ? ( !x.payoutTxId ) && (x.maxNumClaims >= (x.currentClaims + 2)) : x.payoutTxId ).map( x => {
        const projects = data.trailheads.filter(trailhead => trailhead.id == x.trailheadId)
        // const status = x.claimTimestamp
        if (projects.length) {
            const img = require(`../assets/projects/${projects[0].name.toLowerCase()}.png`);
            const completed = data.hikes.filter(hike =>
                (hike.result == VerifyTransactionResult.VERIFIED)
                && (hike.expeditionInviteId == x.id)
            ).length > 0;
            return(
                <tr className='expeditions-table-row'>
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
            
                                            const val = claimRewards(x, addExpeditionInvite, wallet, setErrorText);
                                            console.log(`claimRewards val = ${val}`);
            
                                            // txId = await program.methods
                                            // .depositFunds(new BN(amount * Math.pow(10, decimals)))
                                            // .accounts({
                                            //     poolAuthority: new PublicKey(userAddress),
                                            //     escrowAccount: new PublicKey(rewardPoolAccount.escrowAccount),
                                            //     vaultAccount: new PublicKey(rewardPoolAccount.vaultAccount),
                                            //     token: mint,
                                            //     systemProgram: web3.SystemProgram.programId,
                                            // })
                                            // .rpc()
            
                                        } else {
                                            setTrailId(x.trailId)
                                            setTrailheadId(x.trailheadId)
                                            setShow(true)
                                            setExpeditionInviteId(x.id)
                                        }
                                    }}>{
                                        completed ? 'Claim Reward' : 'Begin'
                                    }</Button>
                                    {errorText ? <td className='error-text'>{errorText}</td> : null}
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

        <div className='leaderboard-tabs row'>
            <div className={`col ${activeTab == 'Active' ? 'active' : ''}`} onClick={handleTabClick}>
                Active
            </div>
            <div className={`col ${activeTab == 'Completed' ? 'active' : ''}`} onClick={handleTabClick}>
                Completed
            </div>
        </div>
        <div className='leaderboard-page-outer-1'>
        <div className='leaderboard-page-outer-2'>
        <div className='leaderboard-page-outer-3'>
            {/* <h1>Leaderboard</h1> */}
            <Table hover>
                <thead>
                    <tr className='expeditions-table-row'>
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

            <div>
                {/* <table>
                    <thead>
                        <tr>
                            <th>Expedition</th>
                            <th>Reward</th>
                            <th>Claims</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            tableRows
                        }
                    </tbody>
                </table> */}

                {/* <div className='expeditions-table'>
                    <div className='row expeditions-table-header'>
                        <div className='col'>Project</div>
                        <div className='col'>Expedition</div>
                        <div className='col'>Reward</div>
                        <div className='col'>Claims Remaining</div>
                        <div className='col'>Ends</div>
                        <div className='col'></div>
                    </div>
                        {
                            rows
                        }
                </div> */}
            </div>
            {
                <Slides expeditionInviteId={expeditionInviteId} show={show} trailId={trailId} handleClose={handleClose} />
            }
            <ToastContainer
                position="bottom-left"/>
        </div>
	);
}

export default ExpeditionsPage;