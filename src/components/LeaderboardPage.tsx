import React from 'react';
import { useSelector } from 'react-redux';
import { IState } from 'src/store/interfaces/state';
import Table from 'react-bootstrap/Table';

const LeaderboardPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
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
    const totColors = colors.length;
    const cur: [string, string, number, boolean] = [data.address, data.username, data.xp, false];
    let leaderboard = data.leaderboard.filter(x => x[0] != data.address);
    leaderboard.push(cur);
    leaderboard = leaderboard.sort((a, b) => a[2] != b[2] ? b[2] - a[2] : a[1] > b[1] ? 1 : -1 );
    // console.log(`leaderboard`);
    // console.log(leaderboard);
    const rows = [];
    for (let index = 0; index <= 10; index ++) {
        if (index >= leaderboard.length) {
            rows.push(
                <tr>
                    <td colSpan={3}/>
                </tr>
            )
        } else {
            const x = leaderboard[index];
            const className = x[0] == data.address ? 'highlight' : ''
            const username = x[0] == data.address && data.username ? data.username : x[1] ? x[1] : x[0];
            // const username = x[1];
            const l = username.length;
            // console.log(`colors[${index}] = ${colors[index]}`)
            // console.log(`data.image`);
            // console.log(data.image);

            // https://trails-avatars.s3.us-east-1.amazonaws.com/AoNVE2rKCE2YNA44V7NQt8N73JdPM7b6acZ2vzSpyPyi.png
            // https://trails-avatars.s3.us-east-1.amazonaws.com/AoNVE2rKCE2YNA44V7NQt8N73JdPM7b6acZ2vzSpyPyi

            const img = data.image && x[0] == data.address ? <img className='avatar' src={data.image} />
            : x[3] ? <img className='avatar' src={`https://trails-avatars.s3.us-east-1.amazonaws.com/${x[0]}.png`} />
            : <div style={{'backgroundColor': `#${colors[index % totColors]}`}} className='avatar'><span className='username-letter'>{username.slice(0, 1)}</span></div>
            rows.push(
                <tr className={className}>
                    <td className='bold'>{index + 1}</td>
                    <td className='bold align-left'>
                        {/* <div style={{'backgroundColor': `#${colors[index]}`}} className='avatar'>{username.slice(0, 1)}</div> */}
                        { img }
                        <span className='username'>{ l > 12 ? `${username.slice(0, 10)}...` : username}</span>
                    </td>
                    <td className='xp'>{x[2]} XP</td>
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
        <div className='leaderboard-page'>
        <div className='leaderboard-page-outer-1'>
        <div className='leaderboard-page-outer-2'>
        <div className='leaderboard-page-outer-3'>
            {/* <h1>Leaderboard</h1> */}
            <Table hover>
                <thead>
                    <th></th>
                    <th></th>
                    <th></th>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
        </div>
        </div>
        </div>
	);
}

export default LeaderboardPage;