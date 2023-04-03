import { Hike } from 'src/models/Hike';
import { Trailhead } from 'src/models/Trailhead';
import { Trail } from 'src/models/Trail';
import { SlideMovement } from 'src/models/SlideMovement';
import { Xp } from 'src/models/Xp';

export interface IState{
    userDate: number;
    xp: number;
    username: string;
    xps: Xp[];
    slideMovements: SlideMovement[];
    image: string;
    address: string;
    leaderboard: [string, string, number, boolean][];
    hikes: Hike[];
    trails: Trail[];
    trailheads: Trailhead[];
}

