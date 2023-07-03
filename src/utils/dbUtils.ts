import axios from 'axios';
import { Dispatch } from 'redux';
import { Xp } from 'src/models/Xp';
import { Hike } from 'src/models/Hike';
import { IState } from 'src/store/interfaces/state';
import { BACKEND_URL } from 'src/constants/constants';
import { SlideMovement } from 'src/models/SlideMovement';
import { setHikes, setSlideMovements, setUserXp, setUserXps } from 'src/store/actions/actions';
import { VerifyTransactionResult } from 'src/enums/VerifyTransactionResult';


export const saveUserXp = async (address: string, trailheadId: number, step: number, slide: number, trailId: string, slideId: string, xp: number, dispatch: Dispatch, data: IState) => {
    const fields = {
        'address': address
        , 'trailheadId': trailheadId
        , 'step': step
        , 'slide': slide
        , 'trailId': trailId
        , 'slideId': slideId
        , 'xp': xp
        , 'token': data.token
    };

    const newXp = new Xp(address, trailheadId, step, slide, trailId, slideId, Date.now(), xp);
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/user/saveUserXp2',
        data: fields
    });
    if (response.status == 200) {
        const xps = data.xps;
        xps.push(newXp);
        dispatch(setUserXps(xps));
        const newUserXp = data.xp + xp;
        dispatch(setUserXp(newUserXp));
    }
    return(response);
}



export const saveHike = async (address: string, trailheadId: number, step: number, slide: number, trailId: string, slideId: string, txId: string, xp: number, expeditionInviteId: string, data: IState, dispatch: Dispatch) => {
    const fields = {
        'address': address
        , 'trailheadId': trailheadId
        , 'step': step
        , 'slide': slide
        , 'trailId': trailId
        , 'slideId': slideId
        , 'txId': txId
        , 'expeditionInviteId': expeditionInviteId
        , 'token': data.token
    };
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/hikes/saveHike2',
        data: fields
    });
    console.log(`saveHike`);
    console.log(response);
    if (response.data == VerifyTransactionResult.VERIFIED) {
        const newXp = xp + data.xp;
        dispatch(setUserXp(newXp));
        const newXp1 = new Xp(address, trailheadId, step, slide, trailId, slideId, Date.now(), xp);
        const xps = data.xps;
        xps.push(newXp1);
        dispatch(setUserXps(xps));
    }
    const val = response.data;
    const hike = new Hike(data.address, trailheadId, step, slide, Date.now(), txId, val, trailId, slideId, expeditionInviteId);
    const hikes = data.hikes;
    hikes.push(hike);
    dispatch(setHikes(hikes));

    return(response);
}


export const saveSlideMovement = async (address: string, trailheadId: number, step: number, slide: number, isForward: boolean, dispatch: Dispatch, data: IState) => {
    let response = await axios({
        method: 'post',
        url: BACKEND_URL+'/api/slideMovement/saveSlideMovement',
        data: {
            'address': address
            , 'trailheadId': trailheadId
            , 'isForward': isForward
            , 'step': step
            , 'slide': slide
            , 'token': data.token
        }
    });
    const slideMovement = new SlideMovement(Date.now(), address, trailheadId, step, slide, isForward);
    const slideMovements = data.slideMovements
    slideMovements.push(slideMovement);
    dispatch(setSlideMovements(slideMovements))
    return(response);
}