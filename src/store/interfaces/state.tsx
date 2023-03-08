import { Hike } from 'src/models/Hike';
import { Trailhead } from 'src/models/Trailhead';
import { Trail } from 'src/models/Trail';

export interface IState{
    image: string;
    address: string;
    leaderboard: any;
    hikes: Hike[];
    trails: Trail[];
    trailheads: Trailhead[];
}

