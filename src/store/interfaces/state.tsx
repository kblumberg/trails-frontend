import { Xp } from 'src/models/Xp';
import { Hike } from 'src/models/Hike';
import { Trail } from 'src/models/Trail';
import { Trailhead } from 'src/models/Trailhead';
import { SlideMovement } from 'src/models/SlideMovement';
import { MadTrailScorecard } from 'src/models/MadTrailScorecard';
import { IRewardPoolAccount } from 'src/models/RewardPoolAccount';
import { ExpeditionInviteDetail } from 'src/models/ExpeditionInviteDetail';

export interface IState{
    xps: Xp[];
    xp: number;
    token: string;
    image: string;
    hikes: Hike[];
    trails: Trail[];
    address: string;
    isAdmin: boolean;
    userDate: number;
    username: string;
    trailheads: Trailhead[];
    quizDisabledUntil: number;
    slideMovements: SlideMovement[];
    madTrailScorecard: MadTrailScorecard;
    expeditionInvites: ExpeditionInviteDetail[];
    rewardPoolAccount: IRewardPoolAccount | null;
    leaderboard: [string, string, string, number, boolean][];
}

