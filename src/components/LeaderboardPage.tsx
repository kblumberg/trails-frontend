import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IState } from 'src/store/interfaces/state';
import Table from 'react-bootstrap/Table';

const LeaderboardPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
    const [activeTab, setActiveTab] = useState('Overall');
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
    const totColors = colors.length;
    const cur: [string, string, string, number, boolean] = ['Overall', data.address, data.username, data.xp, false];
    const curXp = data.xps.filter(x => [10, 11, 12, 13].includes(x.trailheadId)).reduce( (a, b) => a + b.xp, 0 );
    const curC: [string, string, string, number, boolean] = ['Campaign', data.address, data.username, curXp, false];
    let leaderboard = data.leaderboard.filter(x => x[1] != data.address && x[0] == activeTab);
    // if (leaderboard.length == 0) {
    //     leaderboard.push(cur);
    // } else if (data.xp >= leaderboard[leaderboard.length - 1][2] || leaderboard.length < 20) {
    //     console.log('adding')
    //     leaderboard.push(cur);
    // }
    if (activeTab == 'Overall') {
        leaderboard.push(cur);
    } else {
        leaderboard.push(curC);
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
        <div className='light-text'>Campaign Leaderboard only counts XP from Drift, Solend, Solarplex, and MarginFi trails</div>
        <div className='leaderboard-page'>
        <div className='leaderboard-tabs row'>
            <div className={`col ${activeTab == 'Overall' ? 'active' : ''}`} onClick={handleTabClick}>
                Overall
            </div>
            <div className={`col ${activeTab == 'Campaign' ? 'active' : ''}`} onClick={handleTabClick}>
                Campaign
            </div>
        </div>
        <div className='leaderboard-page-outer-1'>
        <div className='leaderboard-page-outer-2'>
        <div className='leaderboard-page-outer-3'>
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