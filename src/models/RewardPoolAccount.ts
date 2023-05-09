// RewardPoolAccount model
import {Schema, model, Model} from 'mongoose';

export interface IRewardPoolAccount {
    poolAuthority: string;
    txId: string;
    trailheadId: number;
};

const schema = new Schema<IRewardPoolAccount>({
    poolAuthority: { type: String, required: true },
    txId: { type: String, required: true },
    trailheadId: { type: Number, required: true },
});

const RewardPoolAccount: Model<IRewardPoolAccount, {}, {}> = model<IRewardPoolAccount>('IRewardPoolAccount', schema, 'rewardPoolAccount');

export default RewardPoolAccount;
