import { VerifyTransactionResult } from "src/enums/VerifyTransactionResult";

export class Xp {

    timestamp: number;
    address: string;
    trailheadId: number;
    step: number;
    slide: number | null;
    xp: number;

	constructor(
        address: string = ''
        , trailheadId: number = 0
        , step: number = 0
        , slide: number = 0
        , timestamp: number = 0
        , xp: number = 0
    ) {
        this.address = address;
        this.trailheadId = trailheadId;
        this.step = step;
        this.slide = slide;
        this.timestamp = timestamp;
        this.xp = xp;
    }

}