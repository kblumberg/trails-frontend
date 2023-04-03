import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, GetVersionedTransactionConfig, MessageV0 } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom'
import { BACKEND_URL, CONFIG, NETWORK } from 'src/constants/constants';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import useSound from 'use-sound';
// const mojs = require('@mojs/core');

// @ts-ignore
import mojs from '@mojs/core';
import { IState } from 'src/store/interfaces/state';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Hike } from '../models/Hike';
import { ChevronLeft } from 'react-bootstrap-icons';

const completeMp3 = require('../assets/complete.mp3');
const incorrectMp3 = require('../assets/incorrect.mp3');

const cleanTxId = (txId: string) => {
    const cleaned_0 = txId.split('/')
    const i = cleaned_0.length;
    const cleaned_1 = cleaned_0[i - 1].split('?')[0];
    return(cleaned_1);
}

const validateTx = async (connection: Connection, txId: string, publicKey: string, programIds: string[]) => {
    console.log(`validateTx txId = ${txId}`);
    const config: GetVersionedTransactionConfig = {
        'commitment': 'confirmed'
        , 'maxSupportedTransactionVersion': 100
    }
    try {
        const result = await connection.getTransaction(txId, config);
        console.log('result');
        if (result) {
            console.log(result.transaction.message);
            if (Object.hasOwn(result.transaction.message, 'staticAccountKeys')) {
                console.log('resultV0');
                // @ts-ignore
                const resultV0: MessageV0 = result.transaction.message;
                const accountKeys = resultV0.staticAccountKeys.map(x => x.toString());
                console.log('accountKeys');
                console.log(accountKeys);
                if (accountKeys[0] != publicKey) {
                    return(VerifyTransactionResult.WRONG_ADDRESS);
                }
                const programIdIndices = resultV0.compiledInstructions.map(x => x.programIdIndex);
                // for (let i = 0; i < accountKeys.length; i++) {
                for (let i = 0; i < programIdIndices.length; i++) {
                    const ind = programIdIndices[i];
                    console.log(`#${i} accountKeys[${ind}] = ${accountKeys[ind]}`)
                    if (programIds.includes(accountKeys[ind])) {
                        return(VerifyTransactionResult.VERIFIED);
                    }
                    
                }
            } else if (Object.hasOwn(result.transaction.message, 'instructions')) {
                console.log('transaction');
                for (let i = 0; i < result.transaction.message.instructions.length; i++) {
                    console.log(result.transaction.message.instructions);
                    const j = result.transaction.message.instructions[i];
                    // const programId0 = result.transaction.message.instructions[0].accounts[i.programIdIndex];
                    const accountKeys = result.transaction.message.accountKeys.map(x => x.toString());
                    if (accountKeys[0] != publicKey) {
                        return(VerifyTransactionResult.WRONG_ADDRESS);
                    }
                    console.log('accountKeys');
                    console.log(accountKeys);
                    const programId = result.transaction.message.accountKeys[j.programIdIndex];
                    // const programId2 = result.transaction.message.accountKeys[programId0];
                    console.log(`programId = ${programId.toString()}`)
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

const RADIUS = 28;


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
const successTimeline = new mojs.Timeline({ speed: 1.5 });
const incorrectTimeline = new mojs.Timeline({ speed: 1.5 });
const timelineSpinner = new mojs.Timeline({ speed: 1.5 });


const saveHike = async (address: string, trailheadId: number, trailId: number, txId: string, step: number, slide: number) => {
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/hikes/saveHike',
        data: {
            'address': address
            , 'trailheadId': trailheadId
            , 'trailId': trailId
            , 'txId': txId
            , 'step': step
            , 'slide': slide
        }
    });
    console.log(`saveHike response`);
    console.log(response);
    return(response);
}

const ProgramPage = (props: any) => {
    const { program } = useParams();
    const connection = new Connection(NETWORK, CONFIG);
    let animation: any = null;
    const [playComplete] = useSound(completeMp3);
    const [playIncorrect] = useSound(incorrectMp3);

    const [fadeProp, setFadeProp] = useState('fade-in');
    const [buttonClass, setButtonClass] = useState('primary');
    const [errorText, setErrorText] = useState('');
    const [correctClass, setCorrectClass] = useState('');
    const [incorrectClass, setIncorrectClass] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);

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

        // const spinner = new mojs.Shape({
        //     parent:           '#spinner',
        //     shape:            'circle',
        //     stroke:           '#FC46AD',
        //     strokeDasharray:  '125, 125',
        //     strokeDashoffset: {'0': '-125'},
        //     strokeWidth:      4,
        //     fill:             'none',
        //     left:             '50%',
        //     top:              '50%',
        //     rotate:            {'-90': '270'},
        //     radius:           20,
        //     isShowStart:      true,
        //     duration:         3000,
        //     // easing:           'back.in',
        //     easing:           'cubic.out',
        //     repeat: 20,
        //     isYoyo: true
        //   })
        //   .then({
        //     rotate:            {'-90': '270'},
        //     strokeDashoffset: {'-125': '-250'},
        //     duration:         3000,
        //     easing:           'cubic.out',
        //   });
        //   spinner.play();


        // successtimeline.add( burst, circle );
        successTimeline.add( burst, circle, check );
        incorrectTimeline.add( cross );
        // timelineSpinner.add( spinner );
        // timelineSpinner.play();
        console.log('successTimeline p1');
        console.log(successTimeline);
      }, []);

    const [value, setValue] = useState('');

    const wallet = useWallet();
    const publicKey = wallet.publicKey ? wallet.publicKey.toString() : '';
	const data: IState = useSelector((state: any) => state.data);
    console.log('data');
    console.log(data);

    const curTrailheads = data.trailheads.filter(x => x.name == program?.replaceAll('_', ' ')).map(x => x.id);
    const curTrails = data.trails.filter(x => curTrailheads.includes(x.trailheadId));
    const img = require(`../assets/${program?.toLowerCase().replaceAll('_', '')}Header.jpeg`);
    const cards: any[] = [];
    // const cards = curTrails.map( (x, index) => {
    //     return(
    //         <Card key={index}>
    //             <Card.Img variant='top' src={String(img)} />
    //             <Card.Body>
    //                 <Card.Title>{x.title}</Card.Title>
    //                 <Card.Text>
    //                     <div dangerouslySetInnerHTML={{__html: x.htmlDescription}}>
    //                     </div>
    //                     <div>
    //                         After, paste your tx id below
    //                     </div>
    //                 </Card.Text>
    //                 <Form>
    //                     <Form.Group className='mb-3' controlId='formBasicEmail'>
    //                         {/* <Form.Label>Transaction ID</Form.Label> */}
    //                         <Form.Control type='txId' placeholder='Enter tx id' onChange={(e) => {
    //                             setValue(e.target.value)
    //                         }} />
    //                         <Form.Text className='text-muted'>
    //                             Can also be Solscan or SFM link
    //                         </Form.Text>
    //                     </Form.Group>
    //                     <div className='error-text'>{errorText}</div>
    //                     <Button disabled={buttonDisabled} id='burst-button' className='burst-button fade-button' variant={buttonClass} type='button' onClick={async () => {
    //                         setErrorText('');
    //                         console.log('clicked');
    //                         setFadeProp('fade-out')
    //                         // setIncorrectClass('hidden')
    //                         // setCorrectClass('hidden')
    //                         // setButtonClass('success')
    //                         // setButtonClass('danger')
                            
    //                         const txId = cleanTxId(value);
    //                         let val = await validateTx(connection, txId, publicKey, x.programIds);
                            
    //                         // TODO: do all the validation on the backend
    //                         const status = await saveHike(data.address, x.trailheadId, x.id, txId, val);
    //                         val = status.data;
    //                         const hike = new Hike(data.address, x.trailheadId, x.id, Date.now(), txId, val);
    //                         console.log(data.hikes);
    //                         console.log('data.hikes');
    //                         data.hikes.push(hike);

    //                         if (val == VerifyTransactionResult.VERIFIED) {
    //                             setButtonClass('success');
    //                             successTimeline.play();
    //                             playComplete();
    //                             setButtonDisabled(true);
    //                             // alert('Verified!');
    //                         } else {
    //                             setIncorrectClass('not-hidden');
    //                             setButtonClass('danger');
    //                             incorrectTimeline.play();
    //                             playIncorrect();
    //                             if (val == VerifyTransactionResult.WRONG_ADDRESS) {
    //                                 setErrorText('Incorrect address');
    //                             } else if (val == VerifyTransactionResult.DUPLICATE) {
    //                                 setErrorText('Tx already submitted');
    //                             } else if (val == VerifyTransactionResult.TIME_LIMIT) {
    //                                 setErrorText('Cooldown period not finished yet');
    //                             } else {
    //                                 // alert('Incorrect Tx!');
    //                                 setErrorText('Incorrect transaction');
    //                             }
    //                             setTimeout(function () {
    //                                 // incorrectTimeline.
    //                                 setButtonClass('primary');
    //                                 setFadeProp('fade-in')
    //                                 setIncorrectClass('hidden')
    //                             }, 1000);
    //                         }                             
    //                     }}>
    //                         <span className={fadeProp}>Submit</span>
    //                         <div id='success-timeline' className={correctClass}></div>
    //                         <div id='incorrect-timeline' className={incorrectClass}></div>
    //                     </Button>
    //                 </Form>
    //                 <div className='back-text'><NavLink to ='/'><ChevronLeft />{` Back to trailhead`}</NavLink></div>
    //             </Card.Body>
    //         </Card>
    //     )
    // })
    
	return (
        <div className='program-page'>
            {cards.length ? cards : null}
        </div>
	);
}

export default ProgramPage;