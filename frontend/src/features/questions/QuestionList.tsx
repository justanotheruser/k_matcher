import Question from "./Question";
import type { Question as QuestionDB } from "../../api_types";

interface QuestionListProps {
  questions: QuestionDB[];
}
function QuestionList({ questions }: QuestionListProps) {
  if (questions.length == 0) {
    return <></>;
  }
  console.log(`questions: ${JSON.stringify(questions)}`);
  return (
    <>
      <ul>
        {questions.map((question: any) => (
          <li key={question.id}>
            <Question {...question} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default QuestionList;
