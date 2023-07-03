/****************/
/*     Quiz     */
/****************/
// the quiz model that appears in the trail slides to test comprehension

export class Quiz {

    question: string;
    options: string[];
    correctOption: number;

    constructor(question: string, options: string[], correctOption: number) {
		this.question = question
		this.options = options
		this.correctOption = correctOption
	}
}