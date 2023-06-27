import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from 'src/store/interfaces/state';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { BACKEND_URL } from 'src/constants/constants';
import { setMadTrailScorecard, setUserXp, setUserXps } from 'src/store/actions/actions';
import { getCurrentTimestamp, getXpFromMadWarsScorecard } from 'src/utils/utils';
import { Xp } from 'src/models/Xp';
import { Tooltip } from 'react-tooltip'

const LeaderboardPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
    // const [activeTab, setActiveTab] = useState('Mad Trail');
    const [activeTab, setActiveTab] = useState('Overall');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const colors1 = [
        '118, 159, 202'
        , '234, 188, 71'
        , '65, 136, 142'
        , '105, 29, 29'
        , '39, 50, 112'
        , '189, 157, 117'
        , '44, 102, 126'
        , '206, 63, 46'
    ]
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
    const handleTabClick = (e: any) => {
        // console.log(`handleTabClick`)
        // console.log(e.target);
        setActiveTab(e.target.innerText);
    }
    const register = async () => {
        setLoading(true);
        console.log(`register`);

		let response = await axios({
			method: 'post',
			url: BACKEND_URL+'/api/madWars/register',
			data: {'address': data.address}
		});
        console.log(`register response`);
        console.log(response);

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

		dispatch(setUserXps(xps));
		dispatch(setUserXp(xps.reduce((a, b) => a + b.xp, 0)));
		dispatch(setMadTrailScorecard(response.data));
        setLoading(false);
    }
    const img = require(`../assets/projects/madwars.png`);

    const totColors = colors.length;
    const cur: [string, string, string, number, boolean] = ['Overall', data.address, data.username, data.xp, false];
    // const curXp = data.xps.filter(x => [10, 11, 12, 13].includes(x.trailheadId)).reduce( (a, b) => a + b.xp, 0 );
    const curXp = data.xps.filter(x => ['MadTrail'].includes(x.trailId)).reduce( (a, b) => a + b.xp, 0 );
    const curC: [string, string, string, number, boolean] = ['Mad Trail', data.address, data.username, curXp, false];
    let leaderboard = data.leaderboard.filter(x => x[1] != data.address && x[0] == activeTab);
    const isRegistered = data.xps.filter( x => x.trailId == 'MadTrail').length > 0;
    const userImg = data.image ? <img className='avatar' src={data.image} />
    : <div style={{'backgroundColor': `#${colors[0 % totColors]}`}} className='avatar'><div className='username-letter'>{data.username.slice(0, 1)}</div></div>

    console.log('data.madTrailScorecard');
    console.log(data.madTrailScorecard);

    const d: [string, number, string, number, number][][] = [
        [
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
        , [
            ['Size', 0, '', 0, 0]
            , ['$10', data.madTrailScorecard.numVolume10, 'Make a trade of $10-$50', 3, 5]
            , ['$50', data.madTrailScorecard.numVolume50, 'Make a trade of $50-$100', 3, 10]
            , ['$100', data.madTrailScorecard.numVolume100, 'Make a trade of $100-$500', 3, 20]
            , ['$500', data.madTrailScorecard.numVolume500, 'Make a trade of $500-$1k', 3, 50]
            , ['$1k', data.madTrailScorecard.numVolume1000, 'Make a trade of $1k+', 3, 100]
        ]
        // , [
        //     'Profit'
        //     , '$5'
        //     , '$10'
        //     , '$50'
        //     , '$100'
        //     , '$500'
        // ]
    ]

    const scorecardRows = d.map((x, ind) => {
        let xp = 0;
        const cols = x.map((y, i) => {
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
            // const img = ['BTC','SOL','ARB','APT','ETH'].includes(y) ? <img src={String()}/>
            const totXp = Math.min(y[3], y[1]) * y[4];
            xp += totXp
            return(
                <div className={`col ${ i ? `col-10` : `first-col col-${20}` }-pct`}>
                    {
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

    const header = isRegistered ? 
    <div className='mad-trail-scorecard row'>
        <div className='col col-lg-2 scorecard-profile'>
            {userImg}
            <div>{curXp} XP</div>
            <div>21st</div>
            <img className='profile-img' src={String(img)}/>
        </div>
        <div className='col col-lg-10'>
            {scorecardRows}
        </div>
    </div>
    :
    <div>
        <div style={{paddingBottom: '10px'}}>Earn $SOL and a Mad Trainee WL by climbing up the Mad Trail leaderboard</div>
        <Button disabled={loading} className='register-button' onClick={register}>
            <img className='button-img' src={String(img)}/>
            <div className='register-label'>{
                    !loading ? `Register Now 🫡` : <div className="spinner-border" role="status"/>
            }</div>
        </Button>
    </div>
    // if (leaderboard.length == 0) {
    //     leaderboard.push(cur);
    // } else if (data.xp >= leaderboard[leaderboard.length - 1][2] || leaderboard.length < 20) {
    //     console.log('adding')
    //     leaderboard.push(cur);
    // }
    if (activeTab == 'Overall') {
        leaderboard.push(cur);
    } else {
        if (isRegistered) {
            leaderboard.push(curC);
        }
    }
    leaderboard = leaderboard.sort((a, b) => a[3] != b[3] ? b[3] - a[3] : a[2] == data.username ? -1 : a[3] < b[3] ? -1 : 1 );
    // console.log(`leaderboard`);
    // console.log(leaderboard);
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
            // const username = x[1];
            const l = username.length;
            // console.log(`colors[${index}] = ${colors[index]}`)
            // console.log(`data.image`);
            // console.log(data.image);

            // https://trails-avatars.s3.us-east-1.amazonaws.com/AoNVE2rKCE2YNA44V7NQt8N73JdPM7b6acZ2vzSpyPyi.png
            // https://trails-avatars.s3.us-east-1.amazonaws.com/AoNVE2rKCE2YNA44V7NQt8N73JdPM7b6acZ2vzSpyPyi

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
    // console.log('rows');
    // console.log(rows);
    // console.log(leaderboard);
    // const rows = .map((x: any, index: number) => {
    //     const className = x[0] == data.address ? 'highlight' : ''
    //     const l = x[0].length;
    //     console.log(`colors[${index}] = ${colors[index]}`)
    //     return(
    //         <tr className={className}>
    //             <td className='bold'>{index + 1}</td>
    //             <td className='bold align-left'>
    //                 <div style={{'backgroundColor': `#${colors[index]}`}} className='avatar'>{x[0].slice(0, 1)}</div>
    //                 <span className='username'>{x[0].slice(0, 10)}...</span>
    //             </td>
    //             <td className='xp'>{x[1]} XP</td>
    //         </tr>
    //     )
    // })

	return (
        <div>
        {/* <div className='light-text'>0.5 $SOL for the top 20 on the Mad Trail Leaderboard on June 28th at 9pm UTC</div> */}
        <div className='leaderboard-page'>
        <div className='leaderboard-tabs row'>
            {/* <div className={`col ${activeTab == 'Mad Trail' ? 'active' : ''}`} onClick={handleTabClick}>
                Mad Trail
            </div> */}
            <div className={`col ${activeTab == 'Overall' ? 'active' : ''}`} onClick={handleTabClick}>
                Overall
            </div>
        </div>
        <div className='leaderboard-page-outer-1'>
        <div className='leaderboard-page-outer-2'>
        <div className='leaderboard-page-outer-3'>
            {
                activeTab == 'Mad Trail' ? <div className='leaderboard-header'>{header}</div> : null
            }
            {/* <h1>Leaderboard</h1> */}
            <Table hover>
                {/* <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead> */}
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
        </div>
        </div>
        </div>
        </div>
	);
}

export default LeaderboardPage;