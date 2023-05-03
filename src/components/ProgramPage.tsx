import { Connection, GetVersionedTransactionConfig, Message, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { NavLink, useParams } from "react-router-dom"
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
import { setHikes, setSlideMovements, setUserXp, setUserXps } from 'src/store/actions/actions';
import TxInput from './TxInput';
import { ArrowLeftCircleFill, Lock, LockFill, Pencil } from 'react-bootstrap-icons';
import { SlideMovement } from 'src/models/SlideMovement';
import { Dispatch } from 'redux';
import { Tooltip } from 'react-tooltip'

import 'react-tooltip/dist/react-tooltip.css';
import { Xp } from 'src/models/Xp';
import Countdown from 'react-countdown';

const completeMp3 = require('../assets/sounds/complete.mp3');
const correctMp3 = require('../assets/sounds/correct.mp3');
const incorrectMp3 = require('../assets/sounds/incorrect.mp3');

const successTimeline = new mojs.Timeline({ speed: 1.5 });
const incorrectTimeline = new mojs.Timeline({ speed: 1.5 });

const RADIUS = 100;

// const Renderer = (hours: number, minutes: number, seconds: number, completed: boolean, props: any ) => {
// @ts-ignore
const Renderer = ({ hours, minutes, seconds, completed, props }) => {

    if (completed) {
      return null;
    } else {
      return (<span>
        {`${hours}:${minutes.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          })}:${seconds.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          })}`}
          </span>
      );
    }
  };


class Check extends mojs.CustomShape {
    getShape () {
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3.699 9.699l4.193 4.193 M19.995 3.652L8.677 14.342'/>";
        // return "<path stroke-width='10px' transform-origin: 50% 50% 0px; stroke-linecap='square' d='M0 50 l32 32 L 100 0'/>";
        // return "<path stroke-width='10px' stroke-linecap='square' d='M15.9057 41.7057 l18.0299 18.0299 M85.9785 15.7036 L36.751 62.61'/>";
        return "<path stroke-width='10px' stroke-linecap='square' d='M20.9057 41.7057 l18.0299 18.0299 M90.9785 15.7036 L41.751 62.61'/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3.699 9.699 L20 0 M19.995 3.652L8.677 14.342'/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M7.398 19.398 L 8.386 8.386 M 39.99 7.304 L 17.354 28.684'/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M7.398 19.398 L 8.386 8.386'/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3 9 L6 6 M 40 3 L20 40 '/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M 2.328125 4.222656 L 27.734375 4.222656 L 27.734375 24.542969 L 2.328125 24.542969 Z M 2.328125 4.222656'/>";
        // return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M14.1 27.2l7.1 7.2 16.7-16.8'/>";
    }
}
class Cross extends mojs.CustomShape {
    getShape () {
        return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3 3 L18 18 M18 3 L3 18'/>";
    }
}

const saveSlideMovement = async (address: string, trailheadId: number, step: number, slide: number, isForward: boolean, dispatch: Dispatch, data: IState) => {
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/slideMovement/saveSlideMovement',
        data: {
            'address': address
            , 'trailheadId': trailheadId
            , 'isForward': isForward
            , 'step': step
            , 'slide': slide
            , 'token': data.token
        }
    });
    const slideMovement = new SlideMovement(Date.now(), address, trailheadId, step, slide, isForward);
    const slideMovements = data.slideMovements
    slideMovements.push(slideMovement);
    dispatch(setSlideMovements(slideMovements))
    return(response);
}

const saveUserXp = async (address: string, trailheadId: number, step: number, slide: number, xp: number, dispatch: Dispatch, data: IState) => {
    const fields = {
        'address': address
        , 'trailheadId': trailheadId
        , 'step': step
        , 'slide': slide
        , 'xp': xp
        , 'token': data.token
    };
    const newXp = new Xp(address, trailheadId, step, slide, Date.now(), xp);
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/user/saveUserXp',
        data: fields
    });
    if (response.status == 200) {
        const xps = data.xps;
        xps.push(newXp);
        dispatch(setUserXps(xps));
        const newUserXp = data.xp + xp;
        dispatch(setUserXp(newUserXp));
    }
    return(response);
}


const cleanTxId = (txId: string) => {
    const cleaned_0 = txId.split('/')
    const i = cleaned_0.length;
    const cleaned_1 = cleaned_0[i - 1].split('?')[0];
    return(cleaned_1);
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
        // if (result) {
        //     console.log(result.transaction.message);
        //     if (Object.hasOwn(result.transaction.message, 'staticAccountKeys')) {
        //         console.log('resultV0');
        //         // @ts-ignore
        //         const resultV0: MessageV0 = result.transaction.message;
        //         const accountKeys = resultV0.staticAccountKeys.map((x: any) => x.toString());
        //         console.log('accountKeys');
        //         console.log(accountKeys);
        //         if (accountKeys[0] != publicKey) {
        //             return(VerifyTransactionResult.WRONG_ADDRESS);
        //         }
        //         const programIdIndices = resultV0.compiledInstructions.map((x: any) => x.programIdIndex);
        //         // for (let i = 0; i < accountKeys.length; i++) {
        //         for (let i = 0; i < programIdIndices.length; i++) {
        //             const ind = programIdIndices[i];
        //             console.log(`#${i} accountKeys[${ind}] = ${accountKeys[ind]}`)
        //             if (programIds.includes(accountKeys[ind])) {
        //                 return(VerifyTransactionResult.VERIFIED);
        //             }
                    
        //         }
        //     } else if (Object.hasOwn(result.transaction.message, 'instructions')) {
        //         console.log('transaction');
        //         const message: Message = result.transaction.message;
        //         const accountKeys = message.accountKeys.map((x: any) => x.toString());
        //         const preTokenBalances = result.meta?.preTokenBalances?.filter(x => x.mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' && x.owner == accountKeys[0]);
        //         const postTokenBalances = result.meta?.postTokenBalances?.filter(x => x.mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' && x.owner == accountKeys[0]);
        //         const preTokenBalance = preTokenBalances && preTokenBalances[0].uiTokenAmount.uiAmount ? preTokenBalances[0].uiTokenAmount.uiAmount : 0
        //         const postTokenBalance = postTokenBalances && postTokenBalances[0].uiTokenAmount.uiAmount ? postTokenBalances[0].uiTokenAmount.uiAmount : 0
        //         const spent = preTokenBalance  - postTokenBalance;
        //         const secondsAgo = (Date.now() / 1000.0) - (result.blockTime ? result.blockTime : 0);
        //         const hoursAgo = secondsAgo / (60 * 60.0);
        //         if (hoursAgo > 72) {
        //             return(VerifyTransactionResult.TIME_LIMIT);
        //         }
        //         console.log(`spent = ${spent}`);
        //         console.log(`hoursAgo = ${hoursAgo}`);
        //         for (let i = 0; i < result.transaction.message.instructions.length; i++) {
        //             console.log(result.transaction.message.instructions);
        //             const j = result.transaction.message.instructions[i];
        //             // const programId0 = result.transaction.message.instructions[0].accounts[i.programIdIndex];
        //             const accountKeys = result.transaction.message.accountKeys.map(x => x.toString());
        //             if (accountKeys[0] != publicKey) {
        //                 return(VerifyTransactionResult.WRONG_ADDRESS);
        //             }
        //             console.log('accountKeys');
        //             console.log(accountKeys);
        //             const programId = result.transaction.message.accountKeys[j.programIdIndex];
        //             // const programId2 = result.transaction.message.accountKeys[programId0];
        //             console.log(`programId = ${programId.toString()}`)
        //             if (programIds.includes(programId.toString())) {
        //                 return(VerifyTransactionResult.VERIFIED);
        //             }
        //         }
        //     }
        // }
        // return(VerifyTransactionResult.WRONG_TX);
    } catch (error) {
        return(VerifyTransactionResult.WRONG_TX);
    }
    // console.log(result?.transaction.message.instructions[0]);
    // return result.value?.confirmationStatus;
}

const ProgramPage = (props: any) => {
    const { program } = useParams();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);
    const [slideNum, setSlideNum] = useState(0);
    const [completed, setCompleted] = useState(0);
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
  
    const handleClose = () => {
        setShow(false);
        setSlideNum(0);
    };
    const handleShow = () => setShow(true);


    const wallet = useWallet();
    const publicKey = wallet.publicKey ? wallet.publicKey.toString() : '';
	const data: IState = useSelector((state: any) => state.data);
    // console.log(`data`);
    // console.log(data);

    const curTrailheads = data.trailheads.filter(x => x.name == program?.replaceAll('_', ' ')).map(x => x.id);
    const curTrailheadId = curTrailheads.length ? curTrailheads[0] : -1;
    const curTrails = data.trails.filter(x => curTrailheads.includes(x.trailheadId)).sort((a, b) => b.step - a.step);
    const maxUnlockedSteps = data.slideMovements.filter(x =>
        curTrailheads.includes(x.trailheadId)
        // && x.step == step
        && x.slide
        && x.slide == curTrails[x.step].slides.length - 1
        && x.isForward
    )
    const maxUnlockedStep = maxUnlockedSteps.length ? maxUnlockedSteps.reduce((a, b) => Math.max(a, b.step + 1), 0) : 0;
    // const maxUnlockedStep = 100;
    // const stepXp = maxUnlockedStep > step ? 0 : curTrails[step].xp;
    

    // const items: any[] = [];
    const items = curTrails.sort( (a, b) => a.step - b.step ).map((x, i) => {
        const slides = x.slides.map((y, j) => {
            const img = require(`../assets/${program}/${x.step}/${program}-${x.step}-${j}.${y.extension}`);
            // const img = require(`../assets/${program}/${1}/${program}-${1}-${0}.gif`);
            const className = y.alignment == 'left' ? 'col-6' : 'col-12';
            const item = 
                <div key={`${i}_${j}`} className={`row slideshow ${y.alignment}`}>
                    <div className={className}>
                        <img src={String(img)} />
                    </div>
                    <div className={className}>
                        <div className='card-text'>
                            <div dangerouslySetInnerHTML={{__html: y.htmlDescription}} />
                        </div>
                        {
                            !y.programIds || y.programIds.length == 0 ? null
                            :
                            <div className=''>
                                <TxInput
                                    trailheadId = {x.trailheadId}
                                    step = {x.step}
                                    slide = {slideNum}
                                    setCompleted = {setCompleted}
                                    xp = {y.xp ? y.xp : 0}
                                />
                            </div>
                        }
                    </div>
                </div>
            return(item);
        })

        slides.push(
            <div className='row slideshow'>
                <div className='col'>
                </div>
            </div>
        )
        return(slides);
    })
    const slides = items[step];
    const now = Math.round(100 * slideNum / (slides.length - 1));
    const title = curTrails[step].slides[slideNum]?.title;
    const programIds = curTrails[step].slides[slideNum]?.programIds;

    useEffect(() => {
        const connection = new Connection(NETWORK, CONFIG);
        const txId = cleanTxId('25ejcuBvdG7TWoFGVJZHWwgvztCcRgr3R9scXRjmTajsG89jtXdkfhGhKUR3qN4xMeivEXhDMi4eX5mzC6QKPHAB');
        // verify the signer is the first pubkey
        // program id is ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD
        // verify usdc is transferred to the vault from the signer
        validateTx(connection, txId, publicKey, ['ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD']);
        // const status = await saveHike(data.address, x.trailheadId, x.id, txId, val);
        try {
            const circle = new mojs.Shape({
                parent: '#burst',
                left: '50%', top: '50%',
                stroke:   '#ffffff',
                // stroke:   '#000000',
                strokeWidth: { [2*RADIUS] : 0 },
                fill:     'none',
                scale:    { 0: 1, easing: 'quad.out' },
                radius:   RADIUS,
                duration:  450 * 2
            });
    
            const burst = new mojs.Burst({
                parent: '#burst',
                left: '50%', top: '50%',
                radius:   { 6: RADIUS - 7 },
                angle:    45,
                children: {
                    shape:        'line',
                    radius:       RADIUS/7.3,
                    scale:        1,
                    stroke:       '#ffffff',
                    // stroke:       '#eab815',
                    // stroke:       '#fbea8c',
                    // stroke:       '#000000',
                    strokeDasharray: '100%',
                    strokeDashoffset: { '-100%' : '100%' },
                    degreeShift:     'stagger(0,-5)',
                    duration:     700 * 2,
                    delay:        1450,
                    easing:       'quad.out',
                }
            });
    
            mojs.addShape( 'check', Check );
            mojs.addShape( 'cross', Cross );
            const check = new mojs.Shape({
                parent: '#success-timeline',
                // left: 22, top: 20,
                shape:    'check',
                // origin: '10% 0%',
                // origin: '20% 10%',
                stroke:       '#ffffff',
                scale:    { 0 : 1 },
                easing:   'elastic.out',
                duration: 1600 * 2,
                innerHeight: 90,
                delay:    300
            });
            // const cross = new mojs.Shape({
            //     parent: '#incorrect-timeline',
            //     left: 52, top: 50,
            //     shape:    'cross',
            //     origin: '20% 10%',
            //     stroke:     '#ffffff',
            //     scale:    { 0 : 1 },
            //     easing:   'elastic.out',
            //     duration: 1600,
            //     innerHeight: 50,
            //     delay:    300
            // });
    
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
            // incorrectTimeline.add( cross );
            // timelineSpinner.add( spinner );
            // timelineSpinner.play();
            // successTimeline.play();
        }
        catch {

        }
    }, [slideNum]);
    const isLastSlide = slideNum == slides.length - 1;
    const className = isLastSlide ? '' : 'hidden';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const trailDivs = items.map((x, i) => {
        // it is the max: "embark here!"
        // it is completed and no repeat: "This trail is complete"
        // it is completed but can redo but not time: "repeat this trail in XX:XX for more XP!"
        // it is completed and can redo now: "repeat this trail for more XP!"
        // locked: "complete previous trail to unlock this one"
        // const status = i > maxUnlockedStep ? 'locked' : i < maxUnlockedStep ? 'completed' : 'current'
        const status = i > maxUnlockedStep ? 'current' : i < maxUnlockedStep ? 'completed' : 'current'
        const isRepeatable = curTrails[i].slides.filter(x => x.xp > 0).length > 0;

        // const lastComplete = data.xps.filter(y => y.trailheadId == curTrailheadId && y.step == i && y.slide == curTrails[i].slides.length - 1 ).reduce((a, b) => Math.max(a, b.timestamp), 0);
        const lastComplete = data.xps.filter(y => y.trailheadId == curTrailheadId && y.step == i ).reduce((a, b) => Math.max(a, b.timestamp), 0);
        const lastCompleteSecondsAgo = (Date.now() - lastComplete) / 1000;
        const wait = Math.max(0, (24 * 60 * 60) - lastCompleteSecondsAgo);
        const hours = Math.floor(wait / (60 * 60));
        const minutes = Math.floor((wait % (60 * 60)) / 60);
        const seconds = Math.floor(wait % 60);

        // const content = status == 'locked' ? <span>Complete previous trail to unlock this one</span>
        const content = false ? <span>Complete previous trail to unlock this one</span>
        // : status == 'completed' && isRepeatable && wait > 0 ? <span>{`Repeat this trail in `<Countdown date={Date.now() + (wait * 1000)} />${hours}:${minutes.toLocaleString('en-US', {
        : isRepeatable && wait > 0 ? 
            <>
                <span>{curTrails[i].title}<br/>{`Repeat this trail in `}</span>
                <Countdown zeroPadDays={0} renderer={Renderer} date={Date.now() + (wait * 1000)} />
                <span> for more XP!</span>
            </>
        // : status == 'completed' && isRepeatable ? <span>{curTrails[i].title}</span>
        : lastComplete > 0 && !isRepeatable ? <span>{curTrails[i].title}<br/>This trail is complete</span>
        : <span>{curTrails[i].title}</span>;
        // const isLocked = (i > maxUnlockedStep) || (i != maxUnlockedStep && wait > 0 && isRepeatable);
        // const isLocked = (wait > 0 && isRepeatable);
        const isLocked = false;
        // const isGray = (i > maxUnlockedStep) || (i != maxUnlockedStep && wait > 0 && isRepeatable) || (status == 'completed' && !isRepeatable);
        // const isGray = (i != maxUnlockedStep && wait > 0 && isRepeatable) || (status == 'completed' && !isRepeatable);
        const isGray = wait > 0 || (lastComplete > 0 && !isRepeatable);

        return(
            <div key={i} className={`trail ${i % 2 ? 'even' : 'odd'} ${alphabet[i]}`}>
                <div className='inner'>
                    <div className='marker'>
                        <div className='dotted'></div>
                        <div id={`button_${i}`} className={`button ${isGray ? 'gray' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => {
                            if (!isLocked) {
                                handleShow()
                                setStep(i)
                            }
                        }}>
                        <div className='icon'>
                            {/* <Countdown date={Date.now() + (wait * 1000)} /> */}
                        {/* <a data-tooltip-id={`button_${i}`} data-tooltip-content={content}> */}
                        <a id={`button_${i}`}>
                            {
                                // i > maxUnlockedStep
                                false
                                ? 
                                    '🔒'
                                : i < maxUnlockedStep
                                ? '✔️'
                                : '⭐'
                            }
                            </a>
                            </div>
                            
                        </div>
                            <Tooltip anchorSelect={`#button_${i}`} >{content}</Tooltip>
                    </div>
                </div>
            </div>
        )

    })
    
    const lastComplete = data.xps.filter(x => x.trailheadId == curTrailheadId && x.step == step && x.slide == slideNum ).reduce((a, b) => Math.max(a, b.timestamp), 0);
    return (
        <>
        <div className='test-page'>
            <div className='trailhead'>
                <h3>
                    <div className='back-arrow'>
                        <NavLink to ='/'>
                            <ArrowLeftCircleFill />
                        </NavLink>
                    </div>
                    {program}
                    <div className='forward-arrow'>
                        <ArrowLeftCircleFill />
                    </div>
                </h3>
                <div>{`Learn the basics of ${program}`}</div>
            </div>
            {trailDivs}
        </div>
            <Modal className='trails-modal' show={show} onHide={handleClose}>
                <Modal.Body>
                    <div className='modal-progress'>
                        <div className='flex-container'>
                            <div className='flex-child-1'>
                                <button onClick={handleClose} type="button" className="btn-close" aria-label="Close"></button>
                            </div>
                            <div className='flex-child-10'>
                                <ProgressBar className='trails-green-background' now={now} label={`${now}%`} />
                            </div>
                        </div>
                    </div>
                    <div className='modal-main'>
                        <div className='modal-main-header'>
                            {title}
                        </div>
                        <div className='modal-main-description'>
                            {slides[slideNum]}
                            <div className={`${isLastSlide ? 'level-complete-outer' : ''}`}>
                                <div id='burst' className={`level-complete fade-button ${className}`} onClick={async () => {}}>
                                    <div className='level-complete-text'>Level<br/>Complete</div>
                                    <div id='success-timeline' className={'correctClass'}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='row'>
                            {
                                slideNum == 0 ? null
                                : 
                                <div className='col'>
                                    <Button className='inner' variant="primary" onClick={() => {
                                        const num = slideNum;
                                        saveSlideMovement(data.address, curTrailheadId, step, num, false, dispatch, data);
                                        setSlideNum(num - 1);
                                    }}>
                                        <div>
                                            <div>
                                                Back
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            }
                        <div className='col'>
                            <Button disabled={ (completed < step) && lastComplete == 0 && programIds && programIds.length > 0} variant="primary" onClick={() => {
                                const num = slideNum;
                                saveSlideMovement(data.address, curTrailheadId, step, num, true, dispatch, data);
                                // TODO: check if they've completed this slide before. if not, add xp
                                const hasCompleted = data.xps.filter(x => 
                                    x.address == data.address
                                    && x.trailheadId == curTrailheadId
                                    && x.step == step
                                    && x.slide == num
                                    && x.xp == curTrails[step].xp
                                )

                                if (num + 1 == slides.length) {
                                    setSlideNum(0);
                                    handleClose();
                                } else {
                                    if (num + 2 == slides.length) {
                                        playComplete();
                                        successTimeline.play();
                                        if (!hasCompleted.length) {
                                            const response = saveUserXp(data.address, curTrailheadId, step, num, curTrails[step].xp, dispatch, data);
                                        }
                                    } else {
                                        playCorrect();
                                    }
                                    setSlideNum(num + 1);
                                }
                            }}>
                                { slideNum == slides.length - 1 ? 'Return to Trail' : 'Next'}
                            </Button>
                        </div>
                        {/* <div className='col'>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </div> */}
                    </div>
                </Modal.Footer>
            </Modal>
        </>
	);
}

export default ProgramPage;