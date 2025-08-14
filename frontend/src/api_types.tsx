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

interface Answer {
  answer: number;
  if_forced: boolean;
}

interface SubmitResult {
  id: string;
  matching_result?: {
    min_answer: number;
    matches: {
      question_id: number;
      answer_a: Answer;
      answer_b: Answer;
    }[];
  }[];
}

export type { Question, QuestionCategory, SubmitRequest, SubmitResult };
