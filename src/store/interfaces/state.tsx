import { Hike } from 'src/models/Hike';
import { Trailhead } from 'src/models/Trailhead';
import { Trail } from 'src/models/Trail';
import { SlideMovement } from 'src/models/SlideMovement';
import { Xp } from 'src/models/Xp';

export interface IState{
    xps: Xp[];
    xp: number;
    token: string;
    image: string;
    hikes: Hike[];
    trails: Trail[];
    address: string;
    userDate: number;
    username: string;
    trailheads: Trailhead[];
    quizDisabledUntil: number;
    slideMovements: SlideMovement[];
    leaderboard: [string, string, string, number, boolean][];
}

