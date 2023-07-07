/*************************/
/*     Frontier Page     */
/*************************/
// simple page to display the active Trails campaign

import React from 'react';

const frontier = require('../assets/assets/frontier.png');

const FrontierPage = (props: any) => {
	return (
        <div className='frontier-page'>
            <img src={String(frontier)} />
            <div className='frontier-bullets'>
            {/* <ul> */}
            <div>
            <span>⛏️</span>The Frontier Program is designed to reward early Trails adopters
            </div>
            <div>
                <span>🗻</span>The first 100 users to complete the Mad Trail earn 0.5 $SOL
            </div>
            <div>
                <span>💪</span>Users in the top 20 on the Mad Trail Leaderboard on July 6th at 5pm UTC earn 1 $SOL
            </div>
            <div>
                <span>🐦</span>You must be following <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> and <a target={'_blank'} href='https://twitter.com/ZetaMarkets'>@ZetaMarkets</a> to earn the prize
            </div>
            <div>
                <span>💰</span>DM us at<a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a> with your address to receive your prize
            </div>
            </div>
        </div>
	);
}

export default FrontierPage;