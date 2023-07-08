/*****************************/
/*     ClaimRewardResult     */
/*****************************/
// when we attempt to claim a reward, here are the possible return values

export const enum ClaimRewardResult {
    SUCCESS = 'SUCCESS',
    SERVER_ERROR = 'SERVER_ERROR',
    INVITE_EXPIRED = 'INVITE_EXPIRED',
    ALREADY_CLAIMED = 'ALREADY_CLAIMED',
    INVITE_NOT_EXIST = 'INVITE_NOT_EXIST',
    INCORRECT_AMOUNT = 'INCORRECT_AMOUNT',
    INCORRECT_PARAMETER = 'INCORRECT_PARAMETER',
    NO_CLAIMS_REMAINING = 'NO_CLAIMS_REMAINING',
    EXPEDITION_NOT_EXIST = 'EXPEDITION_NOT_EXIST',
    EXPEDITION_NOT_COMPLETE = 'EXPEDITION_NOT_COMPLETE',
}