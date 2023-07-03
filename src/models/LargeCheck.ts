/**********************/
/*     LargeCheck     */
/**********************/
// the large check mark animation when a user completes a trail

// @ts-ignore
import mojs from '@mojs/core';

class LargeCheck extends mojs.CustomShape {
    getShape () {
        return "<path stroke-width='10px' stroke-linecap='square' d='M20.9057 41.7057 l18.0299 18.0299 M90.9785 15.7036 L41.751 62.61'/>";
    }
}

export default LargeCheck;
