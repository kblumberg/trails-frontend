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
import BurstButton from './BurstButton';
import Slides from './Slides';

const completeMp3 = require('../assets/sounds/complete.mp3');
const correctMp3 = require('../assets/sounds/correct.mp3');
const incorrectMp3 = require('../assets/sounds/incorrect.mp3');
const clickSound = require('../assets/sounds/click.wav');

const successTimeline = new mojs.Timeline({ speed: 1.5 });
const incorrectTimeline = new mojs.Timeline({ speed: 1.5 });

const RADIUS = 100;

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
        return "<path stroke-width='10px' stroke-linecap='square' d='M20.9057 41.7057 l18.0299 18.0299 M90.9785 15.7036 L41.751 62.61'/>";
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

const saveUserXp = async (address: string, trailheadId: number, step: number, slide: number, trailId: string, slideId: string, xp: number, dispatch: Dispatch, data: IState) => {
    console.log(`saveUserXp`)
    const fields = {
        'address': address
        , 'trailheadId': trailheadId
        , 'step': step
        , 'slide': slide
        , 'trailId': trailId
        , 'slideId': slideId
        , 'xp': xp
        , 'token': data.token
    };
    console.log(fields);

    const newXp = new Xp(address, trailheadId, step, slide, trailId, slideId, Date.now(), xp);
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/user/saveUserXp2',
        data: fields
    });
    console.log(`saveUserXp response`)
    console.log(response)
    if (response.status == 200) {
        const xps = data.xps;
        xps.push(newXp);
        dispatch(setUserXps(xps));
        const newUserXp = data.xp + xp;
        dispatch(setUserXp(newUserXp));
    }
    return(response);
}

const ProgramPage = (props: any) => {
    const { program } = useParams();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);
    const [slideNum, setSlideNum] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [playComplete] = useSound(completeMp3);
    const [playCorrect] = useSound(correctMp3);
    const [playClick] = useSound(clickSound);
    const [selectedOption, setSelectedOption] = useState(-1);
    const [timeout, setTimeout] = useState(0);

    const handleClose = () => {
        setShow(false);
        setSlideNum(0);
    };
    const handleShow = () => setShow(true);


	const data: IState = useSelector((state: any) => state.data);

    const curTrailheads = data.trailheads.filter(x => x.name == program?.replaceAll('_', ' ')).map(x => x.id);
    const curTrailheadId = curTrailheads.length ? curTrailheads[0] : -1;
    const curTrails = data.trails.filter(x => curTrailheads.includes(x.trailheadId)).sort((a, b) => a.step - b.step);

    
    // console.log(`curTrails`);
    // console.log(curTrails);
    const trailList = curTrails.map((x, i) => {
        const slides = x.slides.map((y, j) => {
            let item = null;
            if (y.quiz) {
                // console.log('y.quiz.correctOption');
                // console.log(y.quiz.correctOption);
                const hasCompleted = data.xps.filter(xp => xp.slideId == y.id ).length > 0;
                const options = y.quiz.options.map( (op, index) => {
                    return(
                        <div key={index} className={`quiz-pill ${selectedOption == index ? 'selected' : ''}`}>
                        <Button className='trails-button quiz-pill inner' variant="primary" onClick={() => {
                            playClick();
                            setSelectedOption(index);
                            console.log(`setSelectedOption = ${index}`)
                            // const num = slideNum;
                            // saveSlideMovement(data.address, curTrailheadId, step, num, false, dispatch, data);
                            // setSlideNum(num - 1);
                        }}>
                            <div>
                                <div>
                                    {op}
                                </div>
                            </div>
                        </Button></div>);
                    return(<div className='quiz-pill inner btn btn-primary'>{op}</div>);
                })
                
                item = <div className='quiz'>
                    {options}
                    <div style={{'textAlign': 'center', 'paddingTop': '20px'}} className=''>
                            <BurstButton
                                step={step}
                                slideNum={slideNum}
                                setCompleted={setCompleted}
                                isCorrect={selectedOption == y.quiz.correctOption}
                                disabled={selectedOption < 0}
                                onClick = {() => {
                                    console.log(`BurstButton click hasCompleted = ${hasCompleted} isCorrect = ${selectedOption == y.quiz?.correctOption}`);
                                    if ((!hasCompleted) && selectedOption == y.quiz?.correctOption) {
                                        saveUserXp(data.address, curTrailheadId, step, slideNum, trailId, slideId, curTrails[step].xp, dispatch, data);
                                    }
                                }}
                            />
                        </div>

                </div>
            } else {
                const colSize = y.colSize ? parseInt(y.colSize) : 6;
                const img = require(`../assets/${program}/${x.step}/${program}-${x.step}-${j}.${y.extension}`);
                const imgStyle: any = y.maxHeight ? {'maxHeight': y.maxHeight} : {};
                if (y.imgHeight) {
                    imgStyle['height'] = y.imgHeight;
                }
                if (y.imgWidth) {
                    imgStyle['width'] = y.imgWidth;
                }
                const alignStyle = y.alignImage ? {'alignItems': y.alignImage} : {};
                // const img = require(`../assets/${program}/${1}/${program}-${1}-${0}.gif`);
                const classNameLeft = y.alignment == 'left' ? `col-12 col-lg-${ colSize }` : 'col-12';
                const classNameRight = y.alignment == 'left' ? `col-12 col-lg-${ 12 - colSize }` : 'col-12';
                const imgDiv = <div className={classNameLeft}>
                    <img style={imgStyle} className='' src={String(img)} />
                </div>
                const textDiv = <div style={y.textFirst ? {'paddingBottom': '20px'} : {} } className={classNameRight}>
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
                                trailId = {x.id}
                                slideId = {y.id}
                                setCompleted = {setCompleted}
                                xp = {y.xp ? y.xp : 0}
                            />
                        </div>
                    }
                </div>
                item = 
                    <div key={`${i}_${j}`} style={alignStyle} className={`row slideshow ${y.alignment}`}>
                        {y.textFirst ? textDiv : imgDiv}
                        {y.textFirst ? imgDiv : textDiv}
                    </div>
                
            }
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
    const slides = trailList[step];
    const now = Math.round(100 * slideNum / (slides.length - 1));
    const trailId = curTrails[step].id;
    const slideId = curTrails[step].slides[slideNum]?.id;
    const title = curTrails[step].slides[slideNum]?.title;
    const programIds = curTrails[step].slides[slideNum]?.programIds;
    const quiz = curTrails[step].slides[slideNum]?.quiz;

    useEffect(() => {
        setSelectedOption(-1);
        try {
            const circle = new mojs.Shape({
                parent: '#burst',
                left: '50%', top: '50%',
                stroke:   '#ffffff',
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
                shape:    'check',
                stroke:       '#ffffff',
                scale:    { 0 : 1 },
                easing:   'elastic.out',
                duration: 1600 * 2,
                innerHeight: 90,
                delay:    300
            });
            successTimeline.add( burst, circle, check );
        }
        catch {

        }
    }, [slideNum]);
    const isLastSlide = slideNum == slides.length - 1;
    const className = isLastSlide ? '' : 'hidden';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // the trails that you see when you first enter the page
    const trailDivs = curTrails.map((trail, i) => {
        // only trails where you submit a tx are repeatable
        const isRepeatable = curTrails[i].slides.filter(x => x.programIds && (x.programIds.length > 0)).length > 0 && curTrailheadId != 12;
        // todo: make sure it's all the way complete
        const lastComplete = data.xps.filter(x => x.trailId == trail.id ).reduce((a, b) => Math.max(a, b.timestamp), 0);

        const lastCompleteSecondsAgo = (Date.now() - lastComplete) / 1000;
        const wait = Math.max(0, (24 * 60 * 60) - lastCompleteSecondsAgo);

        const content = isRepeatable && wait > 0 ? 
            <>
                <span>{curTrails[i].title}<br/>{`Repeat this trail in `}</span>
                <Countdown zeroPadDays={0} renderer={Renderer} date={Date.now() + (wait * 1000)} />
                <span> for more XP!</span>
            </>
        : lastComplete > 0 && !isRepeatable ? <span>{curTrails[i].title}<br/>This trail is complete</span>
        : <span>{curTrails[i].title}</span>;
        const isLocked = false;
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
                                lastComplete > 0
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
    
    // 
    const hasCompleted = data.xps.filter(x => x.slideId == slideId ).length > 0;
    const hasQuiz = (quiz != null && quiz.options.length > 0);

	const program_d: any = {
		'Magic': 'Magic Eden'
		, 'Exchange': 'Exchange Art'
		, 'MadWars': 'Mad Wars'
		, 'FamousFoxFederation': 'Famous Fox Federation'
		, 'FamousFoxFederation2': 'Famous Fox Federation'
		, 'ZetaMarkets': 'Zeta Markets'
		, 'JupiterExchange': 'Jupiter Exchange'
		, 'AverExchange': 'Aver Exchange'
		, 'MarinadeFinance': 'Marinade Finance'
	};
    const programName: string = program && Object.hasOwn(program_d, program) ? program_d[program] : program;
    // console.log(`hasQuiz = ${hasQuiz}. completed = ${completed}. step = ${step}. hasCompleted = ${hasCompleted}`)
    return (
        <>
            <div className='program-page'>
                <div className='trailhead'>
                    <h3>
                        <div className='back-arrow'>
                            <NavLink to ='/'>
                                <ArrowLeftCircleFill />
                            </NavLink>
                        </div>
                        {programName}
                        <div className='forward-arrow'>
                            <ArrowLeftCircleFill />
                        </div>
                    </h3>
                    <div>{`Learn the basics of ${programName}`}</div>
                </div>
                {trailDivs}
            </div>
            {
                <Slides show={show} trailheadId={curTrailheadId} handleClose={handleClose} />
            }
            {/* <Modal className='trails-modal' show={show} onHide={handleClose}>
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
                                    <Button className='inner trails-button' variant="primary" onClick={() => {
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
                            <Button className='trails-button' disabled={ !completed && !hasCompleted && ((programIds && programIds.length > 0) || hasQuiz) } variant="primary" onClick={() => {
                                const num = slideNum;
                                setCompleted(false);
                                saveSlideMovement(data.address, curTrailheadId, step, num, true, dispatch, data);

                                console.log(`num = ${num}. slides.length = ${slides.length}`);

                                if (num + 1 == slides.length) {
                                    setSlideNum(0);
                                    handleClose();
                                } else {
                                    if (num + 2 == slides.length) {

                                        const finalSlideId = curTrails[step].slides[num]?.id;
                                        console.log(`finalSlideId = ${finalSlideId}`);

                                        const hasCompleted = data.xps.filter(x => 
                                            x.address == data.address
                                            && x.slideId == finalSlideId
                                            && x.xp == curTrails[step].xp
                                        )
                                        playComplete();
                                        successTimeline.play();
                                        console.log(`hasCompleted = ${hasCompleted}`)
                                        if (!hasCompleted.length) {
                                            console.log(`461 saveUserXp`)
                                            const response = saveUserXp(data.address, curTrailheadId, step, num, trailId, finalSlideId, curTrails[step].xp, dispatch, data);
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
                    </div>
                </Modal.Footer>
            </Modal> */}
        </>
	);
}

export default ProgramPage;