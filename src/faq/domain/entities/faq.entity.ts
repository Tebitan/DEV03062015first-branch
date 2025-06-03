export class FaqEntity {
    readonly id: string;
    readonly question: string;
    readonly answer: string;
  
    constructor(props: { id: string; question: string; answer: string }) {
      this.id = props.id;
      this.question = props.question;
      this.answer = props.answer;
    }
  }  