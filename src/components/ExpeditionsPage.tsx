import { Connection, GetVersionedTransactionConfig, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom"
import { BACKEND_URL, CONFIG, NETWORK, PROGRAM_ID } from 'src/constants/constants';
import { IState } from 'src/store/interfaces/state';
import { formatDate, getTokenFromMint } from 'src/utils/utils';
import Slides from './Slides';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import idl from '../idl.json';
import * as anchor from '@project-serum/anchor';
import axios from 'axios';
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Button } from 'react-bootstrap';



const rv = require('../assets/icons/rv.png');

const claimRewards = async (expeditionInviteId: string, walletContext: WalletContextState) => {


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

        let response = await axios({
            method: 'post',
            url: BACKEND_URL+'/api/expedition/claimReward',
            data: {'expeditionInviteId': expeditionInviteId}
        });
        console.log(`claimRewards response`);
        console.log(response);

        const transactionBuf = Buffer.from(
            response.data
            , 'base64'
        )
        const versionedTransaction = VersionedTransaction.deserialize(transactionBuf);
        console.log(`versionedTransaction`);
        console.log(versionedTransaction);

        if (walletContext && walletContext.signTransaction) {
            const txId = await walletContext.signTransaction(versionedTransaction);
            console.log(`txId`);
            console.log(txId);
        }

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
    const [expeditionInviteId, setExpeditionInviteId] = useState('');
    const [show, setShow] = useState(false);
    const [trailheadId, setTrailheadId] = useState(-1);

    const wallet = useWallet();

    const handleClose = () => {
        setShow(false);
    };

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
    console.log(`trailId = ${trailId}. trailheadId = ${trailheadId}. show = ${show}. `)
    console.log(data.expeditionInvites)
    const rows = data.expeditionInvites.map( x => {
        const projects = data.trailheads.filter(trailhead => trailhead.id == x.trailheadId)
        // const status = x.claimTimestamp
        if (projects.length) {
            const img = require(`../assets/projects/${projects[0].name.toLowerCase()}.png`);
            const completed = data.hikes.filter(hike =>
                (hike.result == VerifyTransactionResult.VERIFIED)
                && (hike.expeditionInviteId == x.id)
            ).length > 0;
            return(
                <div className='row expeditions-table-row'>
                    <div className='col'><img className='icon' alt='logo' src={String(img)}></img></div>
                    <div className='col'>{x.title}</div>
                    <div className='col'>{`${x.amount} $${getTokenFromMint(x.mint)}`}</div>
                    <div className='col'>{x.maxNumClaims} / {x.maxNumClaims}</div>
                    <div className='col'>{formatDate(x.endTimestamp)}</div>
                    <div className='col'>
                        <Button className='trails-button' onClick={() => {
                            if (completed) {

                                claimRewards(x.id, wallet);

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

                            } else  {
                                setTrailId(x.trailId)
                                setTrailheadId(x.trailheadId)
                                setShow(true)
                                setExpeditionInviteId(x.id)
                            }
                        }}>{
                            completed ? 'Claim Reward' : 'Begin'
                        }</Button>
                    </div>
                </div>
            )
        } else {
            return(null);
        }
    })
	return (
        <div className='expeditions-page'>
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

                <div className='expeditions-table'>
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
                </div>
            </div>
            {
                <Slides expeditionInviteId={expeditionInviteId} show={show} trailId={trailId} handleClose={handleClose} />
            }
        </div>
	);
}

export default ExpeditionsPage;