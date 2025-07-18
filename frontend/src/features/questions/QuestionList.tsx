import { useEffect } from "react";
import Question from "./Question";
import {
  selectCurrentPageQuestions,
  selectCurrentPageCategoryId,
  selectIsInitialized,
  selectIsLoading,
  showQuestionsForCategoryId,
} from "./questionsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function QuestionList() {
  const dispatch = useAppDispatch();
  const currentPageCategoryId = useAppSelector(selectCurrentPageCategoryId);
  const currentPageQuestions = useAppSelector(selectCurrentPageQuestions);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    console.log("QuestionList useEffect triggered", {
      currentPageCategoryId,
      isInitialized,
      isLoading,
      questionsLength: currentPageQuestions.length,
    });

    // Only fetch questions if we have a category ID and the app is initialized
    if (currentPageCategoryId !== null && isInitialized) {
      console.log(
        "Dispatching showQuestionsForCategoryId for category:",
        currentPageCategoryId
      );
      dispatch(showQuestionsForCategoryId(currentPageCategoryId));
    }
  }, [currentPageCategoryId, isInitialized]);

  console.log("QuestionList render", {
    isInitialized,
    currentPageCategoryId,
    questionsLength: currentPageQuestions.length,
    isLoading,
  });

  if (!isInitialized || currentPageCategoryId === null) {
    console.log("QuestionList: Not initialized or no category ID");
    return <></>;
  }

  if (currentPageQuestions.length === 0) {
    console.log("QuestionList: No questions available");
    return <></>;
  }

  console.log(`questions: ${JSON.stringify(currentPageQuestions)}`);
  return (
    <>
      {" "}
      <ul>
        {currentPageQuestions.map((question) => (
          <li key={question.id}>
            <Question
              questionId={question.id}
              text={question.text}
              answer={question.answer}
              categoryId={currentPageCategoryId}
            />{" "}
          </li>
        ))}{" "}
      </ul>
    </>
  );
}

export default QuestionList;
