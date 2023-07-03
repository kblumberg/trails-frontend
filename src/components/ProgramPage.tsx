import Slides from './Slides';
import Countdown from 'react-countdown';
import { Tooltip } from 'react-tooltip';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { cleanProjectName } from '../utils/utils';
import { IState } from 'src/store/interfaces/state';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeftCircleFill } from 'react-bootstrap-icons';

const clickSound = require('../assets/sounds/click.wav');

// @ts-ignore
const Renderer = ({ hours, minutes, seconds, completed }) => {
    // render the time until a user can complete the trail again
    if (completed) {
      return null;
    } else {
        return (
            <span>
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

const ProgramPage = (props: any) => {
    // react hooks
    const { program } = useParams();
    const [show, setShow] = useState(false);
    const [trailId, setTrailId] = useState('');

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

	const data: IState = useSelector((state: any) => state.data);

    const curTrailheads = data.trailheads.filter(x => x.name == program?.replaceAll('_', ' ')).map(x => x.id);
    const curTrailheadId = curTrailheads.length ? curTrailheads[0] : -1;
    const curTrails = data.trails.filter(x => curTrailheads.includes(x.trailheadId)).sort((a, b) => a.step - b.step);

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // the trails that you see when you first enter the page
    const trailDivs = curTrails.map((trail, i) => {
        // only trails where you submit a tx are repeatable
        const isRepeatable = curTrails[i].slides.filter(x => x.programIds && (x.programIds.length > 0)).length > 0 && curTrailheadId != 12;

        // how long do we have to wait to re-submit?
        const lastComplete = data.xps.filter(x => x.trailId == trail.id ).reduce((a, b) => Math.max(a, b.timestamp), 0);
        const lastCompleteSecondsAgo = (Date.now() - lastComplete) / 1000;
        const wait = Math.max(0, (24 * 60 * 60) - lastCompleteSecondsAgo);

        // hover text for the trail
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
                                setTrailId(trail.id);
                            }
                        }}>
                        <div className='icon'>
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
    
    const programName = cleanProjectName(program || '');
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
                    <div>{`Get introduced to ${programName == 'Mad Trail' ? 'the Mad Wars' : programName}`}</div>
                    <div className='mad-trail-subheader'>{programName == 'Mad Trail' ? <>After completing the Mad Trail, climb the <NavLink to='/leaderboard'>leaderboard</NavLink> to earn your <a target='blank' href='https://docs.zeta.markets/mad-wars/whitelists/mad-trainee'>Mad Trainee WL</a></> : null}</div>
                </div>
                {trailDivs}
            </div>
            {
                <Slides expeditionInviteId={''} trailId={trailId} show={show} trailheadId={curTrailheadId} handleClose={handleClose} />
            }
        </>
	);
}

export default ProgramPage;