/******************/
/*     XpCard     */
/******************/
// the little xp display in the top right of the screen

import { useSelector } from 'react-redux';
import AnimatedNumber from 'react-animated-number';
import React, { useEffect, useState } from 'react';
import { IState } from 'src/store/interfaces/state';

const XpCard = () => {
    // react hooks
	const data: IState = useSelector((state: any) => state.data);

    const [number, setNumber] = useState(0);
    const [colorClass, setColorClass] = useState('base');
    const [address, setAddress] = useState(data.address);

    const xp = data.xp ? data.xp : 0;

    useEffect(() => {
        // if the user address or xp changes, update our xp number
        if (xp && address !== '') {
            setColorClass('changing')
            setTimeout(function () {
                setColorClass('base');
            }, 1000);
        }
        const newAddress = data.address;
        if (newAddress !== address) {
            setAddress(newAddress);
        }
      }, [xp, address]);

    return(
        <div onClick={() => {
            const n = number;
            setNumber(n + 15);
            setColorClass('changing')
            setTimeout(function () {
                setColorClass('base');
            }, 1000);
        }}>
            <div className={`xp-card ${colorClass}`}>
                <div>
                    {/* when the xp changes, it is animated over 0.7s */}
                    <AnimatedNumber
                        component="span"
                        value={isNaN(data.xp) ? 0 :data.xp}
                        style={{
                            transition: '0.8s ease-out',
                        }}
                        duration={700}
                        formatValue={(n: number) => Math.round(n).toLocaleString()}/>
                        <span className='small-text'> XP</span>
                </div>
            </div>
        </div>
    )
}

export default XpCard;