import { VerifyTransactionResult } from "src/enums/VerifyTransactionResult";

export class Hike {

    address: string;
    trailheadId: number;
    step: number;
    slide: number;
    timestamp: number;
    txId: string;
    result: VerifyTransactionResult;

	constructor(
        address: string = ''
        , trailheadId: number = 0
        , step: number = 0
        , slide: number = 0
        , timestamp: number = 0
        , txId: string = ''
        , result: VerifyTransactionResult = VerifyTransactionResult.WRONG_TX
    ) {
        this.address = address;
        this.trailheadId = trailheadId;
        this.step = step;
        this.slide = slide;
        this.timestamp = timestamp;
        this.txId = txId;
        this.result = result;
    }

}