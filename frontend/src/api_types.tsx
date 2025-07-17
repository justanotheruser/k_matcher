interface Question {
  id: number;
  text: string;
  category_id: number;
}

interface QuestionCategory {
  id: number;
  name: string;
}
export type { Question, QuestionCategory };
