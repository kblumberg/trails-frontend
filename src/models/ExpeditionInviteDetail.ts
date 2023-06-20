
export class ExpeditionInviteDetail {
    id: string;
    expeditionId: string;
    trailheadId: number;
    trailId: string;
    slideId: string;
    title: string;
    startTimestamp: number;
    endTimestamp: number;
    mint: string;
    amount: number;
    maxNumClaims: number;
    currentClaims: number;
    distributionAuthority: string;
    vaultAccount: string;
    escrowAccount: string;
    recipient: string;
    claimTimestamp: number;
    payoutTimestamp: number;
    payoutTxId: string;
    submissionTxId: string;

	constructor(
        id: string = ''
        , expeditionId: string = ''
        , trailheadId: number = 0
        , trailId: string = ''
        , slideId: string = ''
        , title: string = ''
        , startTimestamp: number = 0
        , endTimestamp: number = 0
        , mint: string = ''
        , amount: number = 0
        , maxNumClaims: number = 0
        , currentClaims: number = 0
        , distributionAuthority: string = ''
        , vaultAccount: string = ''
        , escrowAccount: string = ''
        , recipient: string = ''
        , claimTimestamp: number = 0
        , payoutTimestamp: number = 0
        , payoutTxId: string = ''
        , submissionTxId: string = ''
    ) {
        this.id = id;
        this.expeditionId = expeditionId;
        this.trailheadId = trailheadId;
        this.trailId = trailId;
        this.slideId = slideId;
        this.title = title;
        this.startTimestamp = startTimestamp;
        this.endTimestamp = endTimestamp;
        this.mint = mint;
        this.amount = amount;
        this.maxNumClaims = maxNumClaims;
        this.currentClaims = currentClaims;
        this.distributionAuthority = distributionAuthority;
        this.vaultAccount = vaultAccount;
        this.escrowAccount = escrowAccount;
        this.recipient = recipient;
        this.claimTimestamp = claimTimestamp;
        this.payoutTimestamp = payoutTimestamp;
        this.payoutTxId = payoutTxId;
        this.submissionTxId = submissionTxId;
    }

}