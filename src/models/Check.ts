/*****************/
/*     Check     */
/*****************/
// the animated check mark when the user answers correctly

// @ts-ignore
import mojs from '@mojs/core';

class Check extends mojs.CustomShape {
    getShape () {
        return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3.699 9.699l4.193 4.193M19.995 3.652L8.677 14.342'/>";
    }
}

export default Check;