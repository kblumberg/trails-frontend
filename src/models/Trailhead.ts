
export class Trailhead {

    id: number;
    name: string;
    tags: string[];

	constructor(
        id: number = 0
        , name: string = ''
        , tags: string[] = []
    ) {
        this.id = id;
        this.name = name;
        this.tags = tags;
    }

}