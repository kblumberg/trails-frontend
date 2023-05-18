import { Connection, GetVersionedTransactionConfig, Message, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useParams } from "react-router-dom"
import { BACKEND_URL, CONFIG, NETWORK } from 'src/constants/constants';
import ProgressBar from 'react-bootstrap/ProgressBar';
import useSound from 'use-sound';
// @ts-ignore
import mojs from '@mojs/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { IState } from 'src/store/interfaces/state';
import { useDispatch, useSelector } from 'react-redux';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import axios from 'axios';
import { Hike } from 'src/models/Hike';
import { setHikes, setUserXp, setUserXps } from 'src/store/actions/actions';
import { Dispatch } from 'redux';
import { Xp } from 'src/models/Xp';

const completeMp3 = require('../assets/sounds/Tiny Victory.wav');
const correctMp3 = require('../assets/sounds/correct.mp3');
const incorrectMp3 = require('../assets/sounds/Quick Tuba Fail.wav');

const successTimeline = new mojs.Timeline({ speed: 1.5 });
const incorrectTimeline = new mojs.Timeline({ speed: 1.5 });

const RADIUS = 100;


class Check extends mojs.CustomShape {
    getShape () {
        return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3.699 9.699l4.193 4.193M19.995 3.652L8.677 14.342'/>";
    }
}
class Cross extends mojs.CustomShape {
    getShape () {
        return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3 3 L18 18 M18 3 L3 18'/>";
    }
}


const cleanTxId = (txId: string) => {
    const cleaned_0 = txId.split('/')
    const i = cleaned_0.length;
    const cleaned_1 = cleaned_0[i - 1].split('?')[0];
    return(cleaned_1);
}


const saveHike = async (address: string, trailheadId: number, step: number, slide: number, txId: string, xp: number, data: IState, dispatch: Dispatch) => {
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/hikes/saveHike',
        data: {
            'address': address
            , 'trailheadId': trailheadId
            , 'step': step
            , 'slide': slide
            , 'txId': txId
            , 'token': data.token
        }
    });
    if (response.data == VerifyTransactionResult.VERIFIED) {
        const newXp = xp + data.xp;
        dispatch(setUserXp(newXp));
        const newXp1 = new Xp(address, trailheadId, step, slide, Date.now(), xp);
        const xps = data.xps;
        xps.push(newXp1);
        dispatch(setUserXps(xps));
    }
    return(response);
}

const validateTx = async (connection: Connection, txId: string, publicKey: string, programIds: string[]) => {
    const config: GetVersionedTransactionConfig = {
        'commitment': 'confirmed'
        , 'maxSupportedTransactionVersion': 100
    }
    try {
        const result = await connection.getTransaction(txId, config);
        // console.log('result');
        // console.log(result);
        if (result) {
            if (Object.hasOwn(result.transaction.message, 'staticAccountKeys')) {
                // @ts-ignore
                const resultV0: MessageV0 = result.transaction.message;
                const accountKeys = resultV0.staticAccountKeys.map((x: any) => x.toString());
                if (accountKeys[0] != publicKey) {
                    return(VerifyTransactionResult.WRONG_ADDRESS);
                }
                const programIdIndices = resultV0.compiledInstructions.map((x: any) => x.programIdIndex);
                // for (let i = 0; i < accountKeys.length; i++) {
                for (let i = 0; i < programIdIndices.length; i++) {
                    const ind = programIdIndices[i];
                    if (programIds.includes(accountKeys[ind])) {
                        return(VerifyTransactionResult.VERIFIED);
                    }
                }
            } else if (Object.hasOwn(result.transaction.message, 'instructions')) {
                const message: Message = result.transaction.message;
                const accountKeys = message.accountKeys.map((x: any) => x.toString());
                const preTokenBalances = result.meta?.preTokenBalances?.filter(x => x.mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' && x.owner == accountKeys[0]);
                const postTokenBalances = result.meta?.postTokenBalances?.filter(x => x.mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' && x.owner == accountKeys[0]);
                const preTokenBalance = preTokenBalances && preTokenBalances[0].uiTokenAmount.uiAmount ? preTokenBalances[0].uiTokenAmount.uiAmount : 0
                const postTokenBalance = postTokenBalances && postTokenBalances[0].uiTokenAmount.uiAmount ? postTokenBalances[0].uiTokenAmount.uiAmount : 0
                const spent = preTokenBalance  - postTokenBalance;
                const secondsAgo = (Date.now() / 1000.0) - (result.blockTime ? result.blockTime : 0);
                const hoursAgo = secondsAgo / (60 * 60.0);
                if (hoursAgo > 72) {
                    return(VerifyTransactionResult.TIME_LIMIT);
                }
                for (let i = 0; i < result.transaction.message.instructions.length; i++) {
                    const j = result.transaction.message.instructions[i];
                    // const programId0 = result.transaction.message.instructions[0].accounts[i.programIdIndex];
                    const accountKeys = result.transaction.message.accountKeys.map(x => x.toString());
                    if (accountKeys[0] != publicKey) {
                        return(VerifyTransactionResult.WRONG_ADDRESS);
                    }
                    const programId = result.transaction.message.accountKeys[j.programIdIndex];
                    // const programId2 = result.transaction.message.accountKeys[programId0];
                    if (programIds.includes(programId.toString())) {
                        return(VerifyTransactionResult.VERIFIED);
                    }
                }
            }
        }
        return(VerifyTransactionResult.WRONG_TX);
    } catch (error) {
        return(VerifyTransactionResult.WRONG_TX);
    }
    // console.log(result?.transaction.message.instructions[0]);
    // return result.value?.confirmationStatus;
}

const TxInput = (props: any) => {
    const { program } = useParams();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [value, setValue] = useState('');
    const [errorText, setErrorText] = useState('');
    const [correctClass, setCorrectClass] = useState('');
    const [incorrectClass, setIncorrectClass] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [fadeProp, setFadeProp] = useState('fade-in');
    const [buttonClass, setButtonClass] = useState('primary');
    const [playComplete] = useSound(completeMp3);
    const [playCorrect] = useSound(correctMp3);
    const [playIncorrect] = useSound(incorrectMp3);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


	const data: IState = useSelector((state: any) => state.data);

    useEffect(() => {

        const circle = new mojs.Shape({
            parent: '#burst-button',
            left: '50%', top: '50%',
            stroke:   '#ffffff',
            // stroke:   '#000000',
            strokeWidth: { [2*RADIUS] : 0 },
            fill:     'none',
            scale:    { 0: 1, easing: 'quad.out' },
            radius:   RADIUS,
            duration:  450
        });

        const burst = new mojs.Burst({
            parent: '#burst-button',
            left: '50%', top: '50%',
            radius:   { 6: RADIUS - 7 },
            angle:    45,
            children: {
                shape:        'line',
                radius:       RADIUS/7.3,
                scale:        1,
                stroke:       '#ffffff',
                // stroke:       '#000000',
                strokeDasharray: '100%',
                strokeDashoffset: { '-100%' : '100%' },
                degreeShift:     'stagger(0,-5)',
                duration:     700,
                delay:        200,
                easing:       'quad.out',
            }
        });

        mojs.addShape( 'check', Check );
        mojs.addShape( 'cross', Cross );
        const check = new mojs.Shape({
            parent: '#success-timeline',
            left: 52, top: 50,
            shape:    'check',
            origin: '20% 10%',
            stroke:     '#ffffff',
            scale:    { 0 : 1 },
            easing:   'elastic.out',
            duration: 1600,
            innerHeight: 50,
            delay:    300
        });
        const cross = new mojs.Shape({
            parent: '#incorrect-timeline',
            left: 52, top: 50,
            shape:    'cross',
            origin: '20% 10%',
            stroke:     '#ffffff',
            scale:    { 0 : 1 },
            easing:   'elastic.out',
            duration: 1600,
            innerHeight: 50,
            delay:    300
        });

        successTimeline.add( burst, circle, check );
        incorrectTimeline.add( cross );
      }, []);

    return(
        <Form>
            <div className='row'>
            <div className='col-8'>
            <Form.Group className='mb-3' controlId='formBasicEmail'>
                {/* <Form.Label>Transaction ID</Form.Label> */}
                <Form.Control type='txId' placeholder='Enter tx id' onChange={(e) => {
                    // @ts-ignore
                    setValue(e.target.value)
                }} />
                <Form.Text className='text-muted'>
                    Can also be Solscan or SFM link
                </Form.Text>
            </Form.Group>
            </div>
            <div className='col-4'>
            <Button disabled={buttonDisabled} id='burst-button' className='burst-button fade-button' variant={buttonClass} type='button' onClick={async () => {
                setErrorText('');
                setFadeProp('fade-out')

                const txId = cleanTxId(value);
                
                const status = await saveHike(data.address, props.trailheadId, props.step, props.slide, txId, props.xp, data, dispatch);
                const val = status.data;
                const hike = new Hike(data.address, props.trailheadId, props.step, props.slide, Date.now(), txId, val);
                const hikes = data.hikes;
                hikes.push(hike);
                dispatch(setHikes(hikes));

                if (val == VerifyTransactionResult.VERIFIED) {
                    setButtonClass('success');
                    successTimeline.play();
                    playComplete();
                    setButtonDisabled(true);
                    props.setCompleted(props.step);
                    // alert('Verified!');
                } else {
                    setIncorrectClass('not-hidden');
                    setButtonClass('danger');
                    incorrectTimeline.play();
                    playIncorrect();
                    if (val == VerifyTransactionResult.WRONG_ADDRESS) {
                        setErrorText('Incorrect address');
                    } else if (val == VerifyTransactionResult.DUPLICATE) {
                        setErrorText('Tx already submitted');
                    } else if (val == VerifyTransactionResult.TIME_LIMIT) {
                        setErrorText('Cooldown period not finished yet');
                    } else if (val == VerifyTransactionResult.STALE_TX) {
                        setErrorText('Transaction is too old. Check the About Us page.');
                    } else if (val == VerifyTransactionResult.INVALID_TOKEN) {
                        setErrorText('Invalid token.');
                    } else {
                        // alert('Incorrect Tx!');
                        setErrorText('Incorrect transaction');
                    }
                    setTimeout(function () {
                        // incorrectTimeline.
                        setButtonClass('primary');
                        setFadeProp('fade-in')
                        setIncorrectClass('hidden')
                    }, 1000);
                }                             
            }}>
                <span className={fadeProp}>Submit</span>
                <div id='success-timeline' className={correctClass}></div>
                <div id='incorrect-timeline' className={incorrectClass}></div>
            </Button>
            <div className='error-text'>{errorText}</div>
            </div>
            </div>
        </Form>
    )
}

export default TxInput;