import { Hike } from "src/models/Hike";
import { SlideMovement } from "src/models/SlideMovement";
import { Trail } from "src/models/Trail";
import { Trailhead } from "src/models/Trailhead";
import { Xp } from "src/models/Xp";
import * as types from "../types/types";

export const setToken = (token: string) => {
    return {
        type: types.SET_TOKEN,
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
