/*****************************/
/*     RewardPoolAccount     */
/*****************************/
// a RewardPoolAccount is the primary data structure for the rewards

import {Schema, model, Model} from 'mongoose';

export interface IRewardPoolAccount {
    escrowAccount: string;
    vaultAccount: string;
    poolAuthority: string;
    txId: string;
    trailheadId: number;
};

const schema = new Schema<IRewardPoolAccount>({
    escrowAccount: { type: String, required: true },
    vaultAccount: { type: String, required: true },
    poolAuthority: { type: String, required: true },
    txId: { type: String, required: true },
    trailheadId: { type: Number, required: true },
});

const RewardPoolAccount: Model<IRewardPoolAccount, {}, {}> = model<IRewardPoolAccount>('IRewardPoolAccount', schema, 'rewardPoolAccount');

export default RewardPoolAccount;
