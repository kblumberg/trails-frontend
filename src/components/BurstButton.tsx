import { Connection, GetVersionedTransactionConfig, Message, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useRef, useState } from 'react';
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
import { setHikes, setUserXp, setUserXps, setQuizDisabledUntil } from 'src/store/actions/actions';
import { Dispatch } from 'redux';
import { Xp } from 'src/models/Xp';

const completeMp3 = require('../assets/sounds/Tiny Victory.wav');
const correctMp3 = require('../assets/sounds/correct.mp3');
const incorrectMp3 = require('../assets/sounds/Quick Tuba Fail.wav');

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

const saveQuizSubmission = async (
    address: string
    , trailheadId: number
    , step: number
    , slide: number
    , trailId: string
    , slideId: string
    , txId: string
    , xp: number
    , data: IState
    , dispatch: Dispatch
) => {
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/quiz/saveQuizSubmission',
        data: {
            'address': address
            , 'trailheadId': trailheadId
            , 'step': step
            , 'slide': slide
            , 'selectedOption': txId
            , 'isCorrect': false
        }
    });
    if (response.data == VerifyTransactionResult.VERIFIED) {
        const newXp = xp + data.xp;
        dispatch(setUserXp(newXp));
        const newXp1 = new Xp(address, trailheadId, step, slide, trailId, slideId, Date.now(), xp);
        const xps = data.xps;
        xps.push(newXp1);
        dispatch(setUserXps(xps));
    }
    return(response);
}


const getTimeRemaining2 = (quizDisabledUntil: number) => {
    const t = Math.ceil((quizDisabledUntil - new Date().getTime()) / 1000);
    console.log(`getTimeRemaining2 t = ${t}`)
    return(Math.max(0, t));

}

const Timer = (props: any) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const startTimer = (timeRemaining: number) => {
        console.log(`startTimer 1 intervalId = ${intervalId}`);
        const i = setInterval(() => {
            const t = getTimeRemaining2(props.quizDisabledUntil)
            // const t = Math.max(0, timeRemaining - 1);
            console.log(`Timer t = ${t}`);
            setTimeRemaining(t);
        }, 5000)
        // @ts-ignore
        setIntervalId(i);
        console.log(`startTimer 2 intervalId = ${intervalId}`)
    }

    // useEffect(() => {
    //     console.log(`useEffect timeRemaining = ${timeRemaining}`);
    //     console.log(intervalId);
    //     if ((timeRemaining <= 0) && intervalId) {
    //         clearInterval(intervalId)
    //     }
    // }, [timeRemaining])

    useEffect(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        startTimer(props.timeRemaining);
    }, [props.quizDisabledUntil])
    return(
        timeRemaining > 0 
        ? <span>{timeRemaining >= 10 ? `00:${timeRemaining}` : `00:0${timeRemaining}`}</span>
        : <>Submit</>
    )
}


let successTimeline = new mojs.Timeline({ speed: 1.5 });
let incorrectTimeline = new mojs.Timeline({ speed: 1.5 });
const BurstButton = (props: any) => {
    const { program } = useParams();
    const dispatch = useDispatch();

    const data: IState = useSelector((state: any) => state.data);

    const [show, setShow] = useState(false);
    const [value, setValue] = useState('');
    const [errorText, setErrorText] = useState('');
    const [correctClass, setCorrectClass] = useState('');
    const [incorrectClass, setIncorrectClass] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [fadeProp, setFadeProp] = useState('fade-in');
    const [buttonClass, setButtonClass] = useState('primary');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [disabledUntil, setDisabledUntil] = useState(data.quizDisabledUntil);
    const [numIncorrect, setNumIncorrect] = useState(0);
    const [playComplete] = useSound(completeMp3);
    const [playCorrect] = useSound(correctMp3);
    const [playIncorrect] = useSound(incorrectMp3);


    const Ref = useRef(null);

    // const updateTimer = (quizDisabledUntil: number) => {
    const updateTimer = (quizDisabledUntil: number) => {
        // const t = timeRemaining;
        // const quizDisabledUntil = data.quizDisabledUntil;
        console.log(`updateTimer quizDisabledUntil = ${quizDisabledUntil}. timeRemaining = ${timeRemaining}`)
        if (timeRemaining) {
            // const t = getTimeRemaining(quizDisabledUntil)
            const t = getTimeRemaining()
            setTimeRemaining(t);
        }
    }

    const getTimeRemaining = () => {
        const t = Math.ceil((disabledUntil - new Date().getTime()) / 1000);
        console.log(`getTimeRemaining t = ${t}`)
        return(Math.max(0, t));
    
    }

    const startTimer = (quizDisabledUntil: number) => {
        // if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            // const quizDisabledUntil = data.quizDisabledUntil;
            const t = getTimeRemaining()
            if (!(t <= 0 && timeRemaining <= 0)) {
                setTimeRemaining(t);
            }
            // updateTimer(quizDisabledUntil);
        }, 1000)
        // @ts-ignore
        // Ref.current = id;
    }
    // useEffect(() => {
    //     const t = getTimeRemaining(data.quizDisabledUntil)
    //     setTimeRemaining(t);
    //     // startTimer(data.quizDisabledUntil);
    // }, [data.quizDisabledUntil]);

    // console.log(`timeRemaining = ${timeRemaining}`)

    useEffect(() => {
        // startTimer(data.quizDisabledUntil);
        console.log(`BurstButton useEffect`);
        setButtonClass('primary');
        setCorrectClass('hidden');
        setFadeProp('fade-in');
        // successTimeline = new mojs.Timeline({ speed: 1.5 });
        // incorrectTimeline = new mojs.Timeline({ speed: 1.5 });

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
            innerHeight: '60px',
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
            parent: '#success-timeline-2',
            left: 52, top: 50,
            shape:    'check',
            origin: '20% 10%',
            stroke:     '#ffffff',
            scale:    { 0 : 1 },
            easing:   'elastic.out',
            duration: 1600,
            innerHeight: 50,
            delay:    200
        });
        const cross = new mojs.Shape({
            parent: '#incorrect-timeline-2',
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
      }, [props.slideNum]);
    //   const t = getTimeRemaining(data.quizDisabledUntil);
    //   const t = getTimeRemaining();
    console.log(`${props.step} = props.step`);

    return(
        <Button disabled={props.disabled || timeRemaining ? true : false} id='burst-button' className='burst-button fade-button' variant={buttonClass} type='button' onClick={async () => {
            props.onClick()
            setErrorText('');
            setFadeProp('fade-out')
            console.log(`BurstButton onClick isCorrect ${props.isCorrect}`)

            if (props.isCorrect) {
                setCorrectClass('');
                setButtonClass('success');
                successTimeline.play();
                playComplete();
                setButtonDisabled(true);
                console.log(`BurstButton setCompleted ${true}`)
                props.setCompleted(true);
                // alert('Verified!');
            } else {
                setIncorrectClass('not-hidden');
                setButtonClass('danger');
                const curTimestamp = new Date().getTime();
                const newTimeRemaining = Math.ceil(Math.min(30, 7.5 * (numIncorrect + 1)));
                const newDisabledUntil = curTimestamp + (newTimeRemaining * 1000);
                console.log(`curTimestamp = ${curTimestamp}. newDisabledUntil = ${newDisabledUntil}. newTimeRemaining = ${newTimeRemaining}`)
                setDisabledUntil(newDisabledUntil);
                dispatch(setQuizDisabledUntil(newDisabledUntil))
                // if (newTimeRemaining > 0) {
                //     setTimeRemaining(newTimeRemaining);
                // }
                const n = numIncorrect
                setNumIncorrect(n + 1);
                incorrectTimeline.play();
                playIncorrect();
                setErrorText('Incorrect');
                setTimeout(function () {
                    // incorrectTimeline.
                    setButtonClass('primary');
                    setFadeProp('fade-in')
                    setIncorrectClass('hidden')
                }, 1000);
            }                             
        }}>
            <span className={fadeProp}>
                {/* {
                    timeRemaining
                    ? `Try again in ${
                        (
                            timeRemaining >= 10 
                            ? `00:${timeRemaining}`
                            : `00:0${timeRemaining}`
                        )}`
                    : `Submit`
                } */}
                {/* <Timer timeRemaining={timeRemaining} quizDisabledUntil={data.quizDisabledUntil} /> */}
                Submit
            </span>
            <div id='success-timeline-2' className={correctClass}></div>
            <div id='incorrect-timeline-2' className={incorrectClass}></div>
        </Button>
    )
}

export default BurstButton;