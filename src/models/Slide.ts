/*****************/
/*     Slide     */
/*****************/
// each trail has a list of slides

import { Quiz } from './Quiz';

export class Slide {

    id: string;
    title: string;
    extension: string;
    alignment: string;
    colSize: string | null;
    maxHeight: string | null;
    textFirst: boolean | null;
    alignImage: string | null;
    imgHeight: string | null;
    imgWidth: string | null;
    programIds: string[];
    htmlDescription: string;
    xp: number;
    quiz: Quiz | null;

	constructor(
        id: string = ''
        , title: string = ''
        , extension: string = ''
        , alignment: string = ''
        , colSize: string | null = null
        , maxHeight: string | null = null
        , alignImage: string | null = null
        , imgHeight: string | null = null
        , imgWidth: string | null = null
        , textFirst: boolean | null = null
        , programIds: string[] = []
        , htmlDescription: string = ''
        , xp: number = 0
        , quiz: Quiz | null = null
    ) {
        this.id = id;
        this.title = title;
        this.extension = extension;
        this.alignment = alignment;
        this.colSize = colSize;
        this.maxHeight = maxHeight;
        this.alignImage = alignImage;
        this.imgHeight = imgHeight;
        this.imgWidth = imgWidth;
        this.textFirst = textFirst;
        this.programIds = programIds;
        this.htmlDescription = htmlDescription;
        this.xp = xp;
        this.quiz = quiz;
    }

}