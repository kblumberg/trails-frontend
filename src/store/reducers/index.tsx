import { combineReducers } from 'redux';
import { IState } from '../interfaces/state';
import { SET_HIKES, SET_TRAILS, SET_TRAILHEADS, SET_ADDRESS, SET_LEADERBOARD, SET_IMAGE, SET_USER_XP, SET_SLIDE_MOVEMENTS, SET_USER_XPS, SET_USER_DATE, SET_USERNAME, SET_TOKEN } from '../types/types';

export const INITIAL_STATE: IState = {
    address: ''
    , token: ''
    , username: ''
    , userDate: 0
    , xp: 0
    , xps: []
    , slideMovements: []
    , image: ''
    , leaderboard: []
    , hikes: []
    , trails: []
    , trailheads: []
};

const reducer = (state: IState = INITIAL_STATE, action: any): IState => {
    
    switch (action.type) {
        case SET_TOKEN:
            return {
                ...state,
                token: action.data
            }
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
        case SET_USER_XP:
            return {
                ...state,
                xp: action.data
            }
        case SET_USER_XPS:
            return {
                ...state,
                xps: action.data
            }
        case SET_SLIDE_MOVEMENTS:
            return {
                ...state,
                slideMovements: action.data
            }
        case SET_USER_DATE:
            return {
                ...state,
                userDate: action.data
            }
        case SET_USERNAME:
            return {
                ...state,
                username: action.data
            }
        default: return state;
    }
}

const rootReducer = combineReducers({
    data: reducer,
})
export default rootReducer;