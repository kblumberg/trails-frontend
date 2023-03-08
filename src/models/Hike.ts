import { VerifyTransactionResult } from "src/enums/VerifyTransactionResult";

export class Hike {

    address: string;
    trailheadId: number;
    trailId: number;
    timestamp: number;
    txId: string;
    result: VerifyTransactionResult;

	constructor(
        address: string = ''
        , trailheadId: number = 0
        , trailId: number = 0
        , timestamp: number = 0
        , txId: string = ''
        , result: VerifyTransactionResult = VerifyTransactionResult.WRONG_TX
    ) {
        this.address = address;
        this.trailheadId = trailheadId;
        this.trailId = trailId;
        this.timestamp = timestamp;
        this.txId = txId;
        this.result = result;
    }

}