/******************/
/*     Slides     */
/******************/
// the slides we show to the user as they go through a trail

// @ts-ignore
import mojs from '@mojs/core';
import TxInput from './TxInput';
import useSound from 'use-sound';
import Cross from 'src/models/Cross';
import BurstButton from './BurstButton';
import { Trail } from 'src/models/Trail';
import LargeCheck from 'src/models/LargeCheck';
import { Button, Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { IState } from 'src/store/interfaces/state';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useDispatch, useSelector } from 'react-redux';
import { saveSlideMovement, saveUserXp } from 'src/utils/dbUtils';

// load sound effects and animations
const completeMp3 = require('../assets/sounds/complete.mp3');
const correctMp3 = require('../assets/sounds/correct.mp3');
const clickSound = require('../assets/sounds/click.wav');
const successTimeline = new mojs.Timeline({ speed: 1.5 });

const RADIUS = 100;

interface IProps {
    show: boolean;
    handleClose: any;
    trailId: string;
    trailheadId: number;
    expeditionInviteId: string;
}

const Slides = (props: IProps) => {
    // react hooks
    const [playClick] = useSound(clickSound);
    const [playCorrect] = useSound(correctMp3);
    const [slideNum, setSlideNum] = useState(0);
    const [playComplete] = useSound(completeMp3);
    const [completed, setCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(-1);

    const dispatch = useDispatch();
    const data: IState = useSelector((state: any) => state.data);

    const handleClose = () => {
        setSlideNum(0);
        props.handleClose()
    };

    useEffect(() => {
        // the effect for when we get to the end of the slides
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
    
            mojs.addShape( 'check', LargeCheck );
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

    let curTrailheadId = -1;
    let curTrails: Trail[] = []

    if (props.trailId) {
        curTrails = data.trails.filter(x => x.id == props.trailId ).sort((a, b) => a.step - b.step);
        if (curTrails.length) {
            curTrailheadId = curTrails[0].trailheadId;
        }
    }
    if (curTrails.length == 0) {
        // if there are no curTrails, then something went wrong and return null
        return(null);
    }
    const curTrail = curTrails[0];

    const slides = curTrail.slides.map((y, j) => {
        // create a list of slides the user will go through
        let item = null;
        if (y.quiz) {
            // quiz component has some options and a submit button
            const hasCompleted = data.xps.filter(xp => xp.slideId == y.id ).length > 0;
            const options = y.quiz.options.map( (op, index) => {
                return(
                    <div key={index} className={`quiz-pill ${selectedOption == index ? 'selected' : ''}`}>
                    <Button className='trails-button quiz-pill inner' variant='primary' onClick={() => {
                        playClick();
                        setSelectedOption(index);
                    }}>
                        <div>
                            <div>
                                {op}
                            </div>
                        </div>
                    </Button></div>);
            })
            
            item = <div className='quiz'>
                {options}
                <div style={{'textAlign': 'center', 'paddingTop': '20px'}} className=''>
                        <BurstButton
                            slideNum={slideNum}
                            setCompleted={setCompleted}
                            isCorrect={selectedOption == y.quiz.correctOption}
                            disabled={selectedOption < 0}
                            onClick = {() => {
                                if ((!hasCompleted) && selectedOption == y.quiz?.correctOption) {
                                    saveUserXp(data.address, curTrailheadId, curTrail.step, slideNum, trailId, slideId, y.xp, dispatch, data);
                                }
                            }}
                        />
                    </div>

            </div>
        } else {
            // the other slides will have and image and some text
            const colSize = y.colSize ? parseInt(y.colSize) : 6;
            const p = data.trailheads.filter(t => t.id == curTrail.trailheadId)[0].name;
            const img = require(`../assets/${p}/${curTrail.step}/${p}-${curTrail.step}-${j}.${y.extension}`);
            const imgStyle: any = y.maxHeight ? {'maxHeight': y.maxHeight} : {};
            if (y.imgHeight) {
                imgStyle['height'] = y.imgHeight;
            }
            if (y.imgWidth) {
                imgStyle['width'] = y.imgWidth;
            }
            const alignStyle = y.alignImage ? {'alignItems': y.alignImage} : {};
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
                            trailheadId = {curTrail.trailheadId}
                            step = {curTrail.step}
                            slide = {slideNum}
                            trailId = {curTrail.id}
                            slideId = {y.id}
                            setCompleted = {setCompleted}
                            xp = {y.xp ? y.xp : 0}
                            expeditionInviteId = {props.expeditionInviteId ? props.expeditionInviteId : ''}
                        />
                    </div>
                }
            </div>
            item = 
                <div key={`${curTrail.step}_${j}`} style={alignStyle} className={`row slideshow ${y.alignment}`}>
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
    );
    
    let now = 0;
    let trailId = '', slideId = '', title = '';
    let programIds: any[] = [];
    let quiz = null;
    const slidesLength = slides && slides.length ? slides.length : 0;
    if (slidesLength) {
        now = Math.round(100 * slideNum / (slides.length - 1));
        trailId = curTrail.id;
        slideId = curTrail.slides[slideNum]?.id;
        title = curTrail.slides[slideNum]?.title;
        programIds = curTrail.slides[slideNum]?.programIds;
        quiz = curTrail.slides[slideNum]?.quiz;
    }
    const isLastSlide = slideNum == slidesLength - 1;
    const className = isLastSlide ? '' : 'hidden';
    
    const hasCompleted = data.xps.filter(x => x.slideId == slideId ).length > 0;
    const hasQuiz = (quiz != null && quiz.options.length > 0);

    // render the component
    return (
        !slidesLength ? null :
        <Modal className='trails-modal' show={props.show} onHide={handleClose}>
            <Modal.Body>
                <div className='modal-progress'>
                    <div className='flex-container'>
                        <div className='flex-child-1'>
                            <button onClick={handleClose} type='button' className='btn-close' aria-label='Close'></button>
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
                                <Button className='inner trails-button' variant='primary' onClick={() => {
                                    const num = slideNum;
                                    saveSlideMovement(data.address, curTrailheadId, curTrail.step, num, false, dispatch, data);
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
                        <Button className='trails-button' disabled={ !completed && !hasCompleted && ((programIds && programIds.length > 0) || hasQuiz) } variant='primary' onClick={() => {
                            const num = slideNum;
                            setCompleted(false);
                            saveSlideMovement(data.address, curTrailheadId, curTrail.step, num, true, dispatch, data);

                            if (num + 1 == slidesLength) {
                                // if we are not at the end, move the slide forward
                                setSlideNum(0);
                                handleClose();
                            } else {
                                if (num + 2 == slidesLength) {
                                    // if we are at the penultimate slide, mark as complete and update xp
                                    const finalSlideId = curTrail.slides[num]?.id;

                                    const hasCompleted = data.xps.filter(x => 
                                        x.address == data.address
                                        && x.slideId == finalSlideId
                                        && x.xp == curTrail.xp
                                    )
                                    playComplete();
                                    successTimeline.play();
                                    if (!hasCompleted.length) {
                                        const response = saveUserXp(data.address, curTrailheadId, curTrail.step, num, trailId, finalSlideId, curTrail.xp, dispatch, data);
                                    }
                                } else {
                                    // the final slide is always a congratulatory animation
                                    playCorrect();
                                }
                                setSlideNum(num + 1);
                            }
                        }}>
                            { slideNum == slidesLength - 1 ? 'Return to Trail' : 'Next'}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
	);
}

export default Slides;