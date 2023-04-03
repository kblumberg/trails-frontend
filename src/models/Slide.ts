
export class Slide {

    title: string;
    extension: string;
    alignment: string;
    programIds: string[];
    htmlDescription: string;
    xp: number;

	constructor(
        title: string = ''
        , extension: string = ''
        , alignment: string = ''
        , programIds: string[] = []
        , htmlDescription: string = ''
        , xp: number = 0
    ) {
        this.title = title;
        this.extension = extension;
        this.alignment = alignment;
        this.programIds = programIds;
        this.htmlDescription = htmlDescription;
        this.xp = xp;
    }

}