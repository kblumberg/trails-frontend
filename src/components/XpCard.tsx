import { Connection, GetVersionedTransactionConfig, Message, PublicKey, Transaction } from '@solana/web3.js';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useParams } from "react-router-dom"
import { BACKEND_URL, CONFIG, NETWORK } from 'src/constants/constants';
import ProgressBar from 'react-bootstrap/ProgressBar';
import useSound from 'use-sound';
// @ts-ignore
import mojs from '@mojs/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { IState } from 'src/store/interfaces/state';
import { useDispatch, useSelector } from 'react-redux';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';
import axios from 'axios';


import AnimatedNumber from 'react-animated-number'

// import { useEffect, useRef, useState } from "react";
// import { usePrevious } from "../hooks";


// function usePrevious(value: any) {
//     const ref = useRef();
  
//     useEffect(() => {
//       ref.current = value;
//     });
  
//     return ref.current;
// }

// function formatForDisplay(number: number) {
//     return (Math.max(number, 0)).toFixed(2).split('').reverse();
// }

// function DecimalColumn() {
//     return (
//         <div>
//             <span>.</span>
//         </div>
//     );
// }

// // const NumberColumn = (digit: number, delta: number) => {
// function NumberColumn (digit: number, delta: string) {
//   const [position, setPosition] = useState(0);
//   const [animationClass, setAnimationClass] = useState(null);
//   const previousDigit = usePrevious(digit);
//   const columnContainer = useRef();

//   const setColumnToNumber = (number: number) => {
//     // @ts-ignore
//     const ht = columnContainer.current.clientHeight;
//     setPosition((ht ? ht : 0) * number);
//   };

//   useEffect(() => setAnimationClass(previousDigit !== digit ? delta : ""), [
//     digit,
//     delta
//   ]);

//   useEffect(() => setColumnToNumber(digit), [digit]);

//   return (
//     <div className="ticker-column-container" ref={columnContainer}>
//       <motion.div
//         animate={{ y: position }}
//         className={`ticker-column ${animationClass}`}
//         onAnimationComplete={() => setAnimationClass("")}
//       >
//         {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
//           <div key={num} className="ticker-digit">
//             <span>{num}</span>
//           </div>
//         ))}
//       </motion.div>
//       <span className="number-placeholder">0</span>
//     </div>
//   );
// }

// const AnimatingNumber = (value: any) => {
//     const numArray = formatForDisplay(value);
//     const previousNumber = usePrevious(value);

//     let delta: any = null;
//     if (value > previousNumber) delta = 'increase';
//     if (value < previousNumber) delta = 'decrease';

//     return (
//         <motion.div layout className="ticker-view">
//         {numArray.map((number, index) =>
//             number === "." ? (
//             <DecimalColumn key={index} />
//             ) : (
//             <NumberColumn key={index} digit={number} delta={delta} />
//             )
//         )}
//         </motion.div>
//     );
// }


const XpCard = (props: any) => {
    // console.log('props');
    // console.log(props);

    const [number, setNumber] = useState(0);
    const [colorClass, setColorClass] = useState('base');
    
	const data: IState = useSelector((state: any) => state.data);
    const [address, setAddress] = useState(data.address);
    const xp = data.xp ? data.xp : 0;
    // console.log(`XpCard data ${data.address}`);
    // console.log(data);


    useEffect(() => {
        // console.log(`XpCard xp is now ${xp}`)
        // setNumber(xp);
        // console.log(`address is ${address}`)
        if (xp && address != '') {
            console.log(`setColorClass to changing`)
            setColorClass('changing')
            setTimeout(function () {
                setColorClass('base');
            }, 1000);
        }
        const newAddress = data.address;
        if (newAddress != address) {
            console.log(`setting address to ${newAddress}`)
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
                {/* 15 */}
                    <AnimatedNumber
                        component="span"
                        value={isNaN(data.xp) ? 0 :data.xp}
                        style={{
                            transition: '0.8s ease-out',
                            // color: color,
                            // fontSize: 48,
                            // transitionProperty:
                            //     'background-color, opacity'
                        }}
                        // frameStyle={(perc: any) => (
                        //     perc === 100 ? {} : {backgroundColor: '#ffeb3b'}
                        // )}
                        duration={700}
                        formatValue={(n: number) => Math.round(n).toLocaleString()}/>
                        <span className='small-text'> XP</span>
                </div>
        </div>
{/* 
      <AnimatedNumber
        value={counter}
        style={
          {
            fontSize: 200
          }
        }
        formatValue={n => n.toFixed(0)}
        frameStyle={percentage => percentage > 20 && percentage < 80 ? { opacity: 0.5 } : {}}
      /> */}
        </div>
    )
}

export default XpCard;