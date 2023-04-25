import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { isMobile } from 'src/utils/utils';

const home = require('../assets/trailhead.png');
const shield = require('../assets/leaderboard.png');
const settings = require('../assets/tent.png');
const compass = require('../assets/compass.png');
const about = require('../assets/flashlight.png');
const trails = require('../assets/trails.png');
const frontier = require('../assets/frontier-icon.png');


const LeftBar = (props: any) => {
	return (
        <div className='left-bar'>
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
                        <img className='left-bar-logo' alt='logo' src={String(shield)} />{isMobile ? '' : 'Leaderboard'}
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
            </div>
        </div>
	);
}

export default LeftBar;