
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