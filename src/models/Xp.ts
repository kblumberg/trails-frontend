import { VerifyTransactionResult } from "src/enums/VerifyTransactionResult";

export class Xp {

    timestamp: number;
    address: string;
    trailheadId: number;
    step: number;
    slide: number | null;
    trailId: string;
    slideId: string;
    xp: number;

	constructor(
        address: string = ''
        , trailheadId: number = 0
        , step: number = 0
        , slide: number = 0
        , trailId: string = ''
        , slideId: string = ''
        , timestamp: number = 0
        , xp: number = 0
    ) {
        this.address = address;
        this.trailheadId = trailheadId;
        this.step = step;
        this.slide = slide;
        this.trailId = trailId;
        this.slideId = slideId;
        this.timestamp = timestamp;
        this.xp = xp;
    }

}