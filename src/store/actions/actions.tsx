import { Xp } from 'src/models/Xp';
import { Hike } from 'src/models/Hike';
import * as types from '../types/types';
import { Trail } from 'src/models/Trail';
import { Trailhead } from 'src/models/Trailhead';
import { SlideMovement } from 'src/models/SlideMovement';
import { IRewardPoolAccount } from 'src/models/RewardPoolAccount';
import { ExpeditionInviteDetail } from 'src/models/ExpeditionInviteDetail';

export const setIsAdmin = (isAdmin: boolean) => {
    return {
        type: types.SET_IS_ADMIN,
        data: isAdmin
    };
};

export const setExpeditionInvites = (expeditionInvites: ExpeditionInviteDetail[]) => {
    return {
        type: types.SET_EXPEDITION_INVITES,
        data: expeditionInvites
    };
};

export const setRewardPoolAccount = (rewardPoolAccount: IRewardPoolAccount) => {
    return {
        type: types.SET_REWARD_POOL_ACCOUNT,
        data: rewardPoolAccount
    };
};

export const setToken = (token: string) => {
    return {
        type: types.SET_TOKEN,
        data: token
    };
};

export const setMadTrailScorecard = (token: string) => {
    return {
        type: types.SET_MAD_TRAIL_SCORECARD,
        data: token
    };
};

export const setQuizDisabledUntil = (quizDisabledUntil: number) => {
    return {
        type: types.SET_QUIZ_DISABLED_UNTIL,
        data: quizDisabledUntil
    };
};

export const setAddress = (address: string) => {
    return {
        type: types.SET_ADDRESS,
        data: address
    };
};

export const setUsername = (username: string) => {
    return {
        type: types.SET_USERNAME,
        data: username
    };
};

export const setUserDate = (timestamp: number) => {
    return {
        type: types.SET_USER_DATE,
        data: timestamp
    };
};

export const setSlideMovements = (slideMovements: SlideMovement[]) => {
    return {
        type: types.SET_SLIDE_MOVEMENTS,
        data: slideMovements
    };
};

export const setUserXp = (xp: number) => {
    return {
        type: types.SET_USER_XP,
        data: xp
    };
};

export const setUserXps = (xps: Xp[]) => {
    return {
        type: types.SET_USER_XPS,
        data: xps
    };
};

export const setTrails = (trails: Trail[]) => {
    return {
        type: types.SET_TRAILS,
        data: trails
    };
};

export const setTrailheads = (trailheads: Trailhead[]) => {
    return {
        type: types.SET_TRAILHEADS,
        data: trailheads
    };
};

export const setHikes = (hikes: Hike[]) => {
    return {
        type: types.SET_HIKES,
        data: hikes
    };
};


export const setLeaderboard = (leaderboard: any) => {
    return {
        type: types.SET_LEADERBOARD,
        data: leaderboard
    };
};


export const setImage = (image: string) => {
    return {
        type: types.SET_IMAGE,
        data: image
    };
};
