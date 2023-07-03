/*****************/
/*     Cross     */
/*****************/
// the animated 'X' when the user answers incorrectly

// @ts-ignore
import mojs from '@mojs/core';

class Cross extends mojs.CustomShape {
    getShape () {
        return "<path transform-origin: 50% 50% 0px; stroke-linecap='square' d='M3 3 L18 18 M18 3 L3 18'/>";
    }
}

export default Cross;