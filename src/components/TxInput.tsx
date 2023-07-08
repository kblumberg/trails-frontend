/*******************/
/*     TxInput     */
/*******************/
// The form to submit a transaction on a trail

// @ts-ignore
import mojs from '@mojs/core';
import useSound from 'use-sound';
import Check from 'src/models/Check';
import Cross from 'src/models/Cross';
import { cleanTxId, parseMessage } from 'src/utils/utils';
import { saveHike } from 'src/utils/dbUtils';
import { Button, Form } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { IState } from 'src/store/interfaces/state';
import { useDispatch, useSelector } from 'react-redux';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';

// the sound effects
const completeMp3 = require('../assets/sounds/Tiny Victory.wav');
const incorrectMp3 = require('../assets/sounds/Quick Tuba Fail.wav');
const successTimeline = new mojs.Timeline({ speed: 1.5 });
const incorrectTimeline = new mojs.Timeline({ speed: 1.5 });

const RADIUS = 100;

interface IProps {
    trailheadId: number;
    step: number;
    slide: number;
    trailId: string;
    slideId: string;
    xp: number;
    expeditionInviteId: string;
    setCompleted: any;
}

const TxInput = (props: IProps) => {
    // react hooks
    const dispatch = useDispatch();
    const [value, setValue] = useState('');
    const [playComplete] = useSound(completeMp3);
    const [playIncorrect] = useSound(incorrectMp3);
    const [errorText, setErrorText] = useState('');
    const [fadeProp, setFadeProp] = useState('fade-in');
    const [incorrectClass, setIncorrectClass] = useState('');
    const [buttonClass, setButtonClass] = useState('primary');
    const [buttonDisabled, setButtonDisabled] = useState(false);
	const data: IState = useSelector((state: any) => state.data);

    useEffect(() => {
        // create the animations - burst with check + the cross
        const circle = new mojs.Shape({
            parent: '#burst-button',
            left: '50%', top: '50%',
            stroke:   '#ffffff',
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
                // verify and save the hike in the backend
                const status = await saveHike(data.address, props.trailheadId, props.step, props.slide, props.trailId, props.slideId, txId, props.xp, props.expeditionInviteId, data, dispatch);
                const val = status.data;

                if (val === VerifyTransactionResult.VERIFIED) {
                    // transaction was verified - woohoo!
                    setButtonClass('success');
                    successTimeline.play();
                    playComplete();
                    setButtonDisabled(true);
                    props.setCompleted(true);
                } else {
                    // verification failed - boo!
                    setIncorrectClass('not-hidden');
                    setButtonClass('danger');
                    incorrectTimeline.play();
                    playIncorrect();
                    if (val === VerifyTransactionResult.WRONG_ADDRESS) {
                        setErrorText('Incorrect address');
                    } else if (val === VerifyTransactionResult.DUPLICATE) {
                        setErrorText('Tx already submitted');
                    } else if (val === VerifyTransactionResult.TIME_LIMIT) {
                        setErrorText('Cooldown period not finished yet');
                    } else if (val === VerifyTransactionResult.STALE_TX) {
                        setErrorText('Transaction is too old. Check the About Us page.');
                    } else if (val === VerifyTransactionResult.INVALID_TOKEN) {
                        setErrorText('Invalid token');
                    } else if (val === VerifyTransactionResult.INVALID_INVITE) {
                        setErrorText('Invalid expedition invite');
                    } else if (val === VerifyTransactionResult.INVITE_EXPIRED) {
                        setErrorText('Expedition invite expired');
                    } else {
                        // setErrorText('Incorrect transaction');
                        setErrorText(parseMessage(val) );
                    }
                    setTimeout(function () {
                        setButtonClass('primary');
                        setFadeProp('fade-in')
                        setIncorrectClass('hidden')
                    }, 1000);
                }                             
            }}>
                <span className={fadeProp}>Submit</span>
                <div id='success-timeline'></div>
                <div id='incorrect-timeline' className={incorrectClass}></div>
            </Button>
            <div className='error-text'>{errorText}</div>
            </div>
            </div>
        </Form>
    )
}

export default TxInput;