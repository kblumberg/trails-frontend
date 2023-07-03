/*************************/
/*     SlideMovement     */
/*************************/
// when a user moves from slide to slide, we save that data

export class SlideMovement {

    timestamp: number;
    address: string;
    trailheadId: number;
    step: number;
    slide: number;
    isForward: boolean;

	constructor(
        timestamp: number = 0
        , address: string = ''
        , trailheadId: number = 0
        , step: number = 0
        , slide: number = 0
        , isForward: boolean = false
    ) {
        this.timestamp = timestamp;
        this.address = address;
        this.trailheadId = trailheadId;
        this.step = step;
        this.slide = slide;
        this.isForward = isForward;
    }

}