/*********************/
/*     Trailhead     */
/*********************/
// there is a 1<>1 relationship between projects and trailheads

export class Trailhead {

    id: number;
    name: string;
    hidden: boolean;
    tags: string[];

	constructor(
        id: number = 0
        , name: string = ''
        , hidden: boolean = false
        , tags: string[] = []
    ) {
        this.id = id;
        this.name = name;
        this.hidden = hidden;
        this.tags = tags;
    }

}