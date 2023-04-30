import { Slide } from "./Slide";

export class Trail {

    step: number;
    trailheadId: number;
    programIds: string[];
    icon: string;
    title: string;
    hidden: boolean;
    slides: Slide[];
    xp: number;

	constructor(
        step: number = 0
        , trailheadId: number = 0
        , programIds: string[] = []
        , icon: string = ''
        , title: string = ''
        , hidden: boolean = false
        , slides: Slide[] = []
        , xp: number = 0
    ) {
        this.step = step;
        this.trailheadId = trailheadId;
        this.programIds = programIds;
        this.icon = icon;
        this.title = title;
        this.hidden = hidden;
        this.slides = slides;
        this.xp = xp;
    }

}