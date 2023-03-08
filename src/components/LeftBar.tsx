import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const home = require('../assets/home.png');
const shield = require('../assets/shield.png');
const settings = require('../assets/settings.png');
const market = require('../assets/market.png');


const LeftBar = (props: any) => {
	return (
        <div className='left-bar'>
            <div className='left-bar-header'>
                Trails
            </div>
            <div className='left-bar-list'>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(home)} />Trailhead
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/expeditions'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(market)} />Expeditions
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/leaderboard'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(shield)} />Leaderboard
                    </div>
                </NavLink>
                <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to ='/settings'>
                    <div className='left-bar-item'>
                        <img className='left-bar-logo' alt='logo' src={String(settings)} />Settings
                    </div>
                </NavLink>
            </div>
        </div>
	);
}

export default LeftBar;