/*********************/
/*     Main Page     */
/*********************/
// intro page that holds all other components

import React from 'react';
import LeftBar from './LeftBar';
import AboutPage from './AboutPage';
import AdminPage from './AdminPage';
import RightPanel from './RightPanel';
import ProgramPage from './ProgramPage';
import ProfilePage from './ProfilePage';
import { isMobile } from '../utils/utils';
import FrontierPage from './FrontierPage';
import { useSelector } from 'react-redux';
import TrailheadsPage from './TrailheadsPage';
import ExpeditionsPage from './ExpeditionsPage';
import LeaderboardPage from './LeaderboardPage';
import { IState } from '../store/interfaces/state';
import { Route, Routes, useLocation } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-tooltip/dist/react-tooltip.css';


const MainPage = (props: any) => {
	const data: IState = useSelector((state: any) => state.data);
	const rightPanel = <div className='col-12 col-md-4 right-col' style={{'paddingRight': '0'}}><RightPanel /></div>
    const location = useLocation();

    const img = require(`../assets/bg/madtrail-2.png`);

	return (
        <div className='row'>
            <div className={`col-3 col-sm-2 col-md-4 col-lg-3 col-xl-2 ${location.pathname == '/MadWars' ? 'black-bg' : ''}`} style={{'paddingLeft': '0'}}>
                <LeftBar />
            </div>
            <div className={`col-9 col-sm-10 col-md-8 col-lg-9 col-xl-10 ${location.pathname == '/MadWars' ? 'mad-trail' : ''}`} style={{'paddingLeft': '0'}}>
                <div className='row' style={{'paddingTop': '55px', 'maxWidth': '1100px', 'margin': '0 auto'}}>
                    {
                        isMobile ? rightPanel : null
                    }
                    <div className={`col middle-col`}>
                        {
                            data.address == '' ? <TrailheadsPage />
                            :
                            <Routes>
                                <Route path='/' element={<TrailheadsPage />} />
                                <Route path='/expeditions' element={<ExpeditionsPage />} />
                                <Route path='/settings' element={<ProfilePage />} />
                                <Route path='/leaderboard' element={<LeaderboardPage />} />
                                <Route path='/frontier' element={<FrontierPage />} />
                                <Route path='/admin' element={<AdminPage />} />
                                <Route path='/about' element={<AboutPage />} />
                                <Route path='/:program' element={<ProgramPage />} />
                                <Route path='*' element={<TrailheadsPage />} />
                            </Routes>
                        }
                    </div>
                    {
                        isMobile ? null
                        : rightPanel
                    }
                </div>
            </div>
        </div>
	);
}

export default MainPage;
