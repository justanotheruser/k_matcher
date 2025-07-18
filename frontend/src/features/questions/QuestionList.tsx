import { useEffect } from "react";
import Question from "./Question";
import {
  selectCurrentPageQuestions,
  selectCurrentPageCategoryId,
  showQuestionsForCategoryId,
} from "./questionsSlice.tsx";
import { useAppDispatch, useAppSelector } from "../../app/hooks.tsx";

function QuestionList() {
  const dispatch = useAppDispatch();
  const currentPageCategoryId = useAppSelector(selectCurrentPageCategoryId);
  const currentPageQuestions = useAppSelector(selectCurrentPageQuestions);

  useEffect(() => {
    if (currentPageCategoryId === null) {
      return;
    }
    dispatch(showQuestionsForCategoryId(currentPageCategoryId));
  }, [currentPageCategoryId]);

  console.log("render QuestionList")
  if (currentPageQuestions.length == 0) {
    return <></>;
  }
  
  console.log(`questions: ${JSON.stringify(currentPageQuestions)}`);
  return (
    <>
      <ul>
        {currentPageQuestions.map((question: any) => (
          <li key={question.id}>
            <Question {...question} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default QuestionList;
