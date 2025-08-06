interface Question {
  id: number;
  text: string;
  category_id: number;
}

interface QuestionCategory {
  id: number;
  name: string;
}

interface SubmitRequest {
  answers: {
    question_id: number;
    answer: number;
    if_forced?: boolean;
  }[];
  partner_id?: string;
}

interface SubmitResult {
  id: string;
}
export type { Question, QuestionCategory, SubmitResult };
