
import React, { useEffect, useMemo, useState } from 'react';


import 'bootstrap/dist/css/bootstrap.css';
import MainPage from '../components/MainPage';
import ExpeditionsPage from '../components/ExpeditionsPage';
import SettingsPage from '../components/SettingsPage';
import LeaderboardPage from '../components/LeaderboardPage';
import LeftBar from '../components/LeftBar';

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import ProgramPage from '../components/ProgramPage';
import RightPanel from '../components/RightPanel';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AWS_KEY, AWS_SECRET, BACKEND_URL, CONFIG, NETWORK } from '../constants/constants';
import * as actions from '../store/actions/actions';
import { IState } from '../store/interfaces/state';

import AWS from 'aws-sdk'
import XpCard from '../components/XpCard';
import AboutPage from '../components/AboutPage';
import { Xp } from '../models/Xp';
import { isMobile } from '../utils/utils';
import FrontierPage from '../components/FrontierPage';
import { Trail } from '../models/Trail';
import { Trailhead } from '../models/Trailhead';

import 'react-tooltip/dist/react-tooltip.css';


const MainPanel = (props: any) => {
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
                {/* <div className='main'> */}
                    {/* <div className='row'> */}
                        {
                            isMobile ? rightPanel : null
                        }
                        <div className={`col middle-col`}>
                            {
                                data.address == '' ? <MainPage />
                                :
                                <Routes>
                                    <Route path='/' element={<MainPage />} />
                                    <Route path='/expeditions' element={<ExpeditionsPage />} />
                                    <Route path='/settings' element={<SettingsPage />} />
                                    <Route path='/leaderboard' element={<LeaderboardPage />} />
                                    <Route path='/frontier' element={<FrontierPage />} />
                                    <Route path='/about' element={<AboutPage />} />
                                    <Route path='/:program' element={<ProgramPage />} />
                                    <Route path="*" element={<MainPage />} />
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

export default MainPanel;
