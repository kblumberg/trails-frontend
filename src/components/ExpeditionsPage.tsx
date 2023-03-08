import React from 'react';
import { useParams } from "react-router-dom"

const rocket = require('../assets/rocket.png');

const ExpeditionsPage = (props: any) => {
    // const { program } = useParams();
    // console.log('program');
    // console.log(program);
	return (
        <div className='expeditions-page'>
            <div>
                <img className='rocket' src={String(rocket)} />
            </div>
            <div className='launching-soon'>
                LAUNCHING SOON
            </div>
            <div>
                This page is under construction
            </div>
        </div>
	);
}

export default ExpeditionsPage;