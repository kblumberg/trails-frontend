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
    const rows = data.leaderboard.sort((a: any[], b: any[]) => a[1] != b[1] ? b[1] - a[1] : a[0] > b[0] ? 1 : -1 ).map((x: any, index: number) => {
        const className = x[0] == data.address ? 'highlight' : ''
        const l = x[0].length;
        console.log(`colors[${index}] = ${colors[index]}`)
        return(
            <tr className={className}>
                <td className='bold'>{index + 1}</td>
                <td className='bold align-left'>
                    <div style={{'backgroundColor': `#${colors[index]}`}} className='avatar'>{x[0].slice(0, 1)}</div>
                    <span className='username'>{x[0].slice(0, 10)}...</span>
                </td>
                <td className='xp'>{x[1] * 5} XP</td>
            </tr>
        )
    })

	return (
        <div className='leaderboard-page'>
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
	);
}

export default LeaderboardPage;