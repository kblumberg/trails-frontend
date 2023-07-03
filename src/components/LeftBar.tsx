/********************/
/*     Left Bar     */
/********************/
// A simple nav bar on the left side of the page

import React from 'react';
import { isMobile } from 'src/utils/utils';
import { useSelector } from 'react-redux';
import { IState } from 'src/store/interfaces/state';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_ADDRESS } from 'src/constants/constants';

const admin = require('../assets/icons/admin.png');
const settings = require('../assets/icons/tent.png');
const home = require('../assets/icons/trailhead.png');
const compass = require('../assets/icons/compass.png');
const about = require('../assets/icons/flashlight.png');
const docs = require('../assets/logos/docs-icon-2.png');
const twitter = require('../assets/logos/twitter-logo.png');
const frontier = require('../assets/icons/frontier-icon.png');
const leaderboard = require('../assets/icons/leaderboard.png');
const telegram = require('../assets/logos/telegram-icon-2.png');
const flipside = require('../assets/logos/flipside-gradient.png');


const LeftBar = () => {
    // react hooks
    const location = useLocation();
	const data: IState = useSelector((state: any) => state.data);

	return (
        <div className={`left-bar ${location.pathname == '/MadWars' ? 'black-bg' : ''}`}>
            {
                isMobile ? null :
                <div className='left-bar-header'>
                    Trails
                </div>
            }
            <div className='left-bar-list'>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(home)} />{isMobile ? '' : 'Trailhead'}
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/expeditions'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(compass)} />{isMobile ? '' : 'Expeditions'}
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/frontier'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(frontier)} />{isMobile ? '' : 'Frontier'}
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/leaderboard'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(leaderboard)} />{isMobile ? '' : 'Leaderboard'}
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/settings'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(settings)} />{isMobile ? '' : 'Settings'}
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/about'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(about)} />{isMobile ? '' : 'About Us'}
                    </div>
                </NavLink>
                {
                    data.isAdmin || data.address == ADMIN_ADDRESS ? 
                    <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/admin'>
                        <div className='left-bar-item'>
                            <img className='left-bar-logo' alt='logo' src={String(admin)} />{isMobile ? '' : 'Admin'}
                        </div>
                    </NavLink>
                    : null
                }
                
            </div>
            <div className='left-bar-socials'>
                <div className='flipside' style={{'paddingBottom': '10px'}}>
                    <div className=''>Powered by</div>
                    <div className=''><a target={'_blank'} href='http://flipsidecrypto.xyz/'><img src={String(flipside)} /></a></div>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-4'><a target={'_blank'} href='https://twitter.com/TrailsProtocol'><img src={String(twitter)} /></a></div>
                    <div className='col-12 col-md-4'><a target={'_blank'} href='https://t.me/trailsprotocol'><img src={String(telegram)} /></a></div>
                    <div className='col-12 col-md-4'><a target={'_blank'} href='https://trails-protocol.gitbook.io/'><img src={String(docs)} /></a></div>
                </div>
            </div>
        </div>
	);
}

export default LeftBar;