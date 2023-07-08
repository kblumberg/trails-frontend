/***************************/
/*     Trailheads Page     */
/***************************/
// Show all the trails a user can hike

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IState } from 'src/store/interfaces/state';
import { cleanProjectName } from 'src/utils/utils';


const TrailheadsPage = () => {

	// react hooks
	const data: IState = useSelector((state: any) => state.data);

	const programs = data.trailheads.map(x => x.name);

	const divs: any[] = [];
	for (let i = 0; i < programs.length; i++) {

		const trailheadId = data.trailheads[i].id;

		// if there are no trails, then don't show
		const trails = data.trails.filter(x => x.trailheadId === trailheadId);
		if (trails.length === 0) {
			continue;
		}
		const name = cleanProjectName(programs[i]);
		const img = require(`../assets/projects/${programs[i].toLowerCase().replaceAll(' ', '')}.png`);

		// might add this soon TM (a 'recommended trail')
		// const letters = 'RECOMMENDED'.split('').map((l, ind) => {
		// 	const r = 60 - (ind * 12);
		// 	const b = (-(8 * (ind > 4 ? 10 - ind : ind))) - 80;
		// 	return(<span style={{'position': 'absolute', 'bottom': `${(b)-20}px`, 'left': `${12*ind}px`, 'transform': `rotate(${r}deg)`}}>{l}</span>)
		// })

		// special bg for psyfi logo
		const imgClass = programs[i].toLowerCase() === 'psyfi' ? 'white-bg': '';
		const cur = 
			<div key={i} className='col-6 col-md-6 col-lg-4 col-xl-3'>
				<div className={`outer-ring`} >
					{/* <span style={{'position':'absolute','left':'10px'}}>{ i === 0 ? 
					<>
					{letters}
					</> : <></>}</span> */}
					<div className='inner-ring'>
						<Link to={`/${programs[i].replace(/ /g,'')}`}>
							<div className='card'>
								<div className={`img ${imgClass}`}>
									<img className='icon' alt='logo' src={String(img)}></img>
									<div className='project-name'>{name}</div>
								</div>
							</div>
						</Link>
					</div>
				</div>
			</div>
		divs.push(cur);
	}

	// if they do not have their wallet connect, then they should do it!
	const curState = data.address ? 1 : 2;
	return (
        <>
			{
				curState === 1 ? 
					<div className='row cards'>
						{divs}
					</div> 
				: <div>Connect your wallet to resume your journey!</div>
			}
		</>
	);
}

export default TrailheadsPage;