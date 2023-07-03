/***********************************/
/*     VerifyTransactionResult     */
/***********************************/
// when we verify a transaction on the backend, here are the possible return values

export const enum VerifyTransactionResult {
    VERIFIED = 'VERIFIED',
    WRONG_TX = 'WRONG_TX',
    DUPLICATE = 'DUPLICATE',
    TIME_LIMIT = 'TIME_LIMIT',
    STALE_TX = 'STALE_TX',
    WRONG_ADDRESS = 'WRONG_ADDRESS',
    INVALID_TOKEN = 'INVALID_TOKEN',
    INVALID_INVITE = 'INVALID_INVITE',
    INVITE_EXPIRED = 'INVITE_EXPIRED',
}
