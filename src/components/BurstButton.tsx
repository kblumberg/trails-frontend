/************************/
/*     Burst Button     */
/************************/
// A fun component to show fun animations when a user clicks a button

// @ts-ignore
import mojs from '@mojs/core';
import useSound from 'use-sound';
import Check from '../models/Check';
import Cross from '../models/Cross';
import { Button } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

// create mojs timeline with sound and graphical effects
let successTimeline = new mojs.Timeline({ speed: 1.5 });
let incorrectTimeline = new mojs.Timeline({ speed: 1.5 });
const completeMp3 = require('../assets/sounds/Tiny Victory.wav');
const incorrectMp3 = require('../assets/sounds/Quick Tuba Fail.wav');

interface IProps {
    slideNum: number;
    disabled: boolean;
    onClick: any;
    isCorrect: boolean;
    setCompleted: any;
}

const BurstButton = (props: IProps) => {

    const [playComplete] = useSound(completeMp3);
    const [playIncorrect] = useSound(incorrectMp3);
    const [fadeProp, setFadeProp] = useState('fade-in');
    const [correctClass, setCorrectClass] = useState('');
    const [buttonClass, setButtonClass] = useState('primary');
    const [incorrectClass, setIncorrectClass] = useState('');

    const RADIUS = 100;

    useEffect(() => {
        // create the burst button
        setButtonClass('primary');
        setCorrectClass('hidden');
        setFadeProp('fade-in');

        // create the button with the burst and check mark
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
            innerHeight: '60px',
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

    return(
        <Button disabled={props.disabled ? true : false} id='burst-button' className='burst-button fade-button' variant={buttonClass} type='button' onClick={async () => {
            props.onClick()
            setFadeProp('fade-out')
            console.log(`BurstButton onClick isCorrect ${props.isCorrect}`)

            if (props.isCorrect) {
                // play the correct sound effect + disply burst and check
                setCorrectClass('');
                setButtonClass('success');
                successTimeline.play();
                playComplete();
                console.log(`BurstButton setCompleted ${true}`)
                props.setCompleted(true);
            } else {
                // play the incorrect sound effect + disply cross
                setIncorrectClass('not-hidden');
                setButtonClass('danger');
                incorrectTimeline.play();
                playIncorrect();
                setTimeout(function () {
                    setButtonClass('primary');
                    setFadeProp('fade-in')
                    setIncorrectClass('hidden')
                }, 1000);
            }                             
        }}>
            <span className={fadeProp}>
                Submit
            </span>
            <div id='success-timeline-2' className={correctClass}></div>
            <div id='incorrect-timeline-2' className={incorrectClass}></div>
        </Button>
    )
}

export default BurstButton;