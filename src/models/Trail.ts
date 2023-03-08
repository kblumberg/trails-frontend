
export class Trail {

    id: number;
    trailheadId: number;
    programIds: string[];
    title: string;
    htmlDescription: string;

	constructor(
        id: number = 0
        , trailheadId: number = 0
        , programIds: string[] = []
        , title: string = ''
        , htmlDescription: string = ''
    ) {
        this.id = id;
        this.trailheadId = trailheadId;
        this.programIds = programIds;
        this.title = title;
        this.htmlDescription = htmlDescription;
    }

}