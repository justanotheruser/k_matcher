interface Question {
  id: number;
  text: string;
  category_id: number;
}

interface QuestionCategory {
  id: number;
  name: string;
}

interface SubmitResult {
  id: string;
}
export type { Question, QuestionCategory, SubmitResult };
