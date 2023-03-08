import { combineReducers } from 'redux';
import { IState } from '../interfaces/state';
import { SET_HIKES, SET_TRAILS, SET_TRAILHEADS, SET_ADDRESS, SET_LEADERBOARD, SET_IMAGE } from '../types/types';

export const INITIAL_STATE: IState = {
    address: '',
    image: '',
    leaderboard: {},
    hikes: [],
    trails: [],
    trailheads: [],
};

const reducer = (state: IState = INITIAL_STATE, action: any): IState => {
    
    switch (action.type) {
        case SET_ADDRESS:
            return {
                ...state,
                address: action.data
            }
        case SET_IMAGE:
            return {
                ...state,
                image: action.data
            }
        case SET_HIKES:
            return {
                ...state,
                hikes: action.data
            }
        case SET_TRAILS:
            return {
                ...state,
                trails: action.data
            }
        case SET_TRAILHEADS:
            return {
                ...state,
                trailheads: action.data
            }
        case SET_LEADERBOARD:
            return {
                ...state,
                leaderboard: action.data
            }
        default: return state;
    }
}

const rootReducer = combineReducers({
    data: reducer,
})
export default rootReducer;