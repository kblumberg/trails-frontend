import { Hike } from "src/models/Hike";
import { Trail } from "src/models/Trail";
import { Trailhead } from "src/models/Trailhead";
import * as types from "../types/types";

export const setAddress = (address: string) => {
    return {
        type: types.SET_ADDRESS,
        data: address
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
