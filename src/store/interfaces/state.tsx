import { Hike } from 'src/models/Hike';
import { Trailhead } from 'src/models/Trailhead';
import { Trail } from 'src/models/Trail';
import { SlideMovement } from 'src/models/SlideMovement';
import { Xp } from 'src/models/Xp';
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
    rewardPoolAccount: IRewardPoolAccount | null;
    quizDisabledUntil: number;
    slideMovements: SlideMovement[];
    expeditionInvites: ExpeditionInviteDetail[];
    leaderboard: [string, string, string, number, boolean][];
}

