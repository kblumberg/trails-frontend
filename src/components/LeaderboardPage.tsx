/****************************/
/*     Leaderboard Page     */
/****************************/
// Displays the overall and campaign leaderboard to the users

import axios from 'axios';
import { Xp } from 'src/models/Xp';
import { Tooltip } from 'react-tooltip';
import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { IState } from 'src/store/interfaces/state';
import { Button, ProgressBar } from 'react-bootstrap';
import { BACKEND_URL } from 'src/constants/constants';
import { QuestionCircle } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMadTrailScorecard, setUserXp, setUserXps } from 'src/store/actions/actions';
import { getCurrentTimestamp, getXpFromMadWarsScorecard, ordinal_suffix_of } from 'src/utils/utils';
import TrailsTable from './TrailsTable';

const LeaderboardPage = (props: any) => {
    // react hooks
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Mad Trail');
	const data: IState = useSelector((state: any) => state.data);

    // a list of color to use as background avatar colors if a user has not uploaded their own avatar
    const colors = [
        '769fca'
        , 'eabc47'
        , '41888e'
        , '691d1d'
        , '273270'
        , 'bd9d75'
        , '2c667e'
        , 'ce3f2e'
    ]
    const totColors = colors.length;

    const img = require(`../assets/projects/madwars.png`);

    const handleTabClick = (e: any) => {
        setActiveTab(e.target.innerText);
    }

    // register a user for the Mad Trail competition
    const register = async () => {
        setLoading(true);

        // get their current xp
		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/madWars/updateMadTrail',
			data: {'address': data.address}
		});

        // add xp to our global state
        const xp = getXpFromMadWarsScorecard(response.data);
        const xps = data.xps.filter(x => x.trailId != 'MadTrail');
        const newXp = new Xp(
            data.address
            , 19
            , 0
            , 0
            , 'MadTrail'
            , 'MadTrail'
            , getCurrentTimestamp()
            , xp
        )
        xps.push(newXp);

        // update our state
		dispatch(setUserXps(xps));
		dispatch(setUserXp(xps.reduce((a, b) => a + b.xp, 0)));
		dispatch(setMadTrailScorecard(response.data));
        setLoading(false);
    }

    // user's current xp
    const cur: [string, string, string, number, boolean] = ['Overall', data.address, data.username, data.xp, false];

    // user's current campaign xp
    const curXp = data.xps.filter(x => ['MadTrail'].includes(x.trailId)).reduce( (a, b) => a + b.xp, 0 );
    const curC: [string, string, string, number, boolean] = ['Mad Trail', data.address, data.username, curXp, false];

    // 
    let leaderboard = data.leaderboard.filter(x => x[1] != data.address && x[0] == activeTab);
    const isRegistered = data.xps.filter( x => x.trailId == 'MadTrail').length > 0;

    // user avatar
    const userImg = data.image ? <img className='avatar' src={data.image} />
    : <div style={{'backgroundColor': `#${colors[0 % totColors]}`}} className='avatar'><div className='username-letter'>{data.username.slice(0, 1)}</div></div>


    // Mad Wars Scorecard
    const d: [string, number, string, number, number][][] = [
        [
            ['Volume', data.madTrailScorecard.volume, '', 0, 0]
        ]
        , [
            ['Achievements', 0, '', 0, 0]
            , ['Long', data.madTrailScorecard.hasLong ? 1 : 0, 'Take a long position', 1, 10]
            , ['Short', data.madTrailScorecard.hasShort ? 1 : 0, 'Take a short position', 1, 10]
            , ['', 0, '', 1, 0]
            , ['', 0, '', 1, 0]
            , ['', 0, '', 1, 0]
        ]
        , [
            ['Markets', 0, '', 0, 0]
            , ['SOL', data.madTrailScorecard.hasSol ? 1 : 0, 'Take a $SOL position', 1, 10]
            , ['BTC', data.madTrailScorecard.hasBtc ? 1 : 0, 'Take a $BTC position', 1, 10]
            , ['ETH', data.madTrailScorecard.hasEth ? 1 : 0, 'Take an $ETH position', 1, 10]
            , ['APT', data.madTrailScorecard.hasApt ? 1 : 0, 'Take an $APT position', 1, 10]
            , ['ARB', data.madTrailScorecard.hasArb ? 1 : 0, 'Take an $ARB position', 1, 10]
        ]
    ]

    // rows for Mad Trail Scorecard
    const scorecardRows = d.map((x, ind) => {
        let xp = 0;
        if (x[0][0] == 'Volume') {
            const amt = Math.round(Math.min(1000000, x[0][1]));
            const xp = Math.floor(amt / 1000) + Math.floor(Math.log10(amt)) * 15
            const amtLabel = amt.toLocaleString()
            const pct = Math.max(0, Math.floor(100 * (Math.log10(amt) / Math.log10(1000000))));
            const div = 
            <div className='row scorecard-row'>
                <div className={`col first-col col-${20}-pct`}>
                    Volume
                    <QuestionCircle style={{'marginLeft': '5px', 'paddingLeft': '1px'}} id='question-circle' />
                    <Tooltip anchorSelect={`#question-circle`} >
                        <div>+15xp for each volume checkpoint<br/>+1xp for every $1k of volume</div>
                    </Tooltip>
                </div>
                <div className={`col`} style={{'position': 'relative'}}>
                    <div className='checkpoint' id={`volume-1`} style={{'left': '16.667%'}}>|</div>
                    <Tooltip anchorSelect={`#volume-1`} >
                        <div>$10</div>
                        <div className='max-text'>+15xp</div>
                    </Tooltip>
                    <div className='checkpoint' id={`volume-2`} style={{'left': '33.33%'}}>|</div>
                    <Tooltip anchorSelect={`#volume-2`} >
                        <div>$100</div>
                        <div className='max-text'>+15xp</div>
                    </Tooltip>
                    <div className='checkpoint' id={`volume-3`} style={{'left': '50%'}}>|</div>
                    <Tooltip anchorSelect={`#volume-3`} >
                        <div>$1k</div>
                        <div className='max-text'>+15xp</div>
                    </Tooltip>
                    <div className='checkpoint' id={`volume-4`} style={{'left': '66.667%'}}>|</div>
                    <Tooltip anchorSelect={`#volume-4`} >
                        <div>$10k</div>
                        <div className='max-text'>+15xp</div>
                    </Tooltip>
                    <div className='checkpoint' id={`volume-5`} style={{'left': '83.333%'}}>|</div>
                    <Tooltip anchorSelect={`#volume-5`} >
                        <div>$100k</div>
                        <div className='max-text'>+15xp</div>
                    </Tooltip>
                    <ProgressBar className='mad-lads-red-background' now={pct} label={`$${amtLabel}`} />
                </div>
                <div className={`col col-10-pct`}>{`${xp}`}xp</div>
            </div>
            return(div);
        }
        let cols = x.map((y, i) => {
            let val = <>{y[0]}</>;
            let className = '';
            if (['BTC','SOL','ARB','APT','ETH'].includes(y[0])) {
                className = 'no-bg';
                const png = require(`../assets/tokens/${y[0]}.png`);
                val = <img className='circle no-bg' id={`item-${ind}-${i}`} src={String(png)}/>
            }
            const completed = y[1] > 0;
            let img = <div id={`item-${ind}-${i}`} className={`circle ${completed ? 'completed' : ''} ${className}`}>{
                val
            }</div>
            const totXp = Math.min(y[3], y[1]) * y[4];
            xp += totXp
            return(
                <div className={`col ${ i ? `col-10` : `first-col col-${20}` }-pct`}>
                    {
                        y[0] == '' ? null :
                        i && y ? <>
                        <Tooltip anchorSelect={`#item-${ind}-${i}`} >
                            <div>{`${y[2]}`}</div>
                            <div>{`${y[1]} x ${y[4]}xp = ${totXp}xp`}</div>
                            <div className='max-text'>{`Max ${y[3]}`}</div>
                        </Tooltip>
                        {img}
                        </> : <>{y[0]}</>
                    }
                </div>
            )
        })
        return(
            <div className='row scorecard-row'>
                {cols}
                <div className={`col col-10-pct`}>{`${xp}`}xp</div>
            </div>
        )
    })

    // add the current user's row to the leaderboard
    // we do this because we only load the leaderboard data on page refresh
    // but a user's xp may change before they refresh the page
    if (activeTab == 'Overall') {
        leaderboard.push(cur);
    } else {
        if (isRegistered) {
            leaderboard.push(curC);
        }
    }
    leaderboard = leaderboard.sort((a, b) => a[3] != b[3] ? b[3] - a[3] : a[2] == data.username ? -1 : a[3] < b[3] ? -1 : 1 );
    const place = leaderboard.map(x => x[1]).indexOf(data.address) + 1;
    const header = isRegistered ? 
    <div className='mad-trail-scorecard'>
        <div className='row scorecard-profile'>
            <div className='col-lg-2'>
                {userImg}
                <div>{curXp} XP</div>
                <div>{`${ordinal_suffix_of(place)}`}</div>
            </div>
            <div className='col-lg-10'>
                <div className='row'>
                    <div className='inline-block scorecard-header'>Mad Trail Scorecard</div>
                </div>
                <div className='scorecard-subheader'><a target='blank' href='https://docs.zeta.markets/mad-wars/whitelists/mad-trainee'>Mad Trainee WL</a> for traders that reach 100xp</div>
                <div className='row'>
                    <div>
                        <ProgressBar className='black-background' now={Math.min(100, curXp)} label={`${curXp}xp`} />
                    </div>
                </div>
            </div>
        </div>
        <div className='row'>
            <div className='col col-lg-12'>
                {scorecardRows}
            </div>
        </div>
    </div>
    :
    <div>
        <div style={{paddingBottom: '10px'}}>Earn $SOL and <a target='blank' href='https://docs.zeta.markets/mad-wars/whitelists/mad-trainee'>Mad Trainee WL</a> by climbing up the Mad Trail leaderboard</div>
        <Button disabled={loading} className='register-button' onClick={register}>
            <img className='button-img' src={String(img)}/>
            <div className='register-label'>{
                    !loading ? `Register Now 🫡` : <div className="spinner-border" role="status"/>
            }</div>
        </Button>
    </div>

    const rows = [];
    for (let index = 0; index < 20; index ++) {
        if (index >= leaderboard.length) {
            rows.push(
                <tr key={index} >
                    <td className='bold'>{index + 1}</td>
                    <td colSpan={2}/>
                </tr>
            )
        } else {
            const x = leaderboard[index];
            const className = x[1] == data.address ? 'highlight' : ''
            const username = x[1] == data.address && data.username ? data.username : x[2] ? x[2] : x[1];
            const l = username.length;

            const img = data.image && x[1] == data.address ? <img className='avatar' src={data.image} />
            : x[4] ? <img className='avatar' src={`https://trails-avatars.s3.us-east-1.amazonaws.com/${x[1]}.png`} />
            : <div style={{'backgroundColor': `#${colors[index % totColors]}`}} className='avatar'><div className='username-letter'>{username.slice(0, 1)}</div></div>
            rows.push(
                <tr key={index} className={className}>
                    <td className='bold'>{index + 1}</td>
                    <td className='bold align-left'>
                        {/* <div style={{'backgroundColor': `#${colors[index]}`}} className='avatar'>{username.slice(0, 1)}</div> */}
                        { img }
                        <span className='username'>{ l > 12 ? `${username.slice(0, 10)}...` : username}</span>
                    </td>
                    <td className='xp'>{x[3]} XP</td>
                </tr>
            )
        }
    }

	return (
        <TrailsTable
            rows = {rows}
            header = {header}
            headerTab = {'Mad Trail'}
            tabs = {['Mad Trail','Overall']}
            topDescriptions = {['1 $SOL for the top 20 on the Mad Trail Leaderboard on July 5th at 9pm UTC']}
        />
	);
}

export default LeaderboardPage;