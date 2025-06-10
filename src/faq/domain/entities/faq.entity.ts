export class FaqEntity {
    readonly id: string;
    readonly question: string;
    readonly answer: string;
    readonly embedding: number[];
  
    constructor(props: { id: string; question: string; answer: string; embedding: number[]; }) {
      this.id = props.id;
      this.question = props.question;
      this.answer = props.answer;
      this.embedding = props.embedding;
    }
  }  