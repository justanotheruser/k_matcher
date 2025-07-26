import { useEffect } from "react";
import Question from "./Question";
import {
  selectCurrentPageQuestions,
  selectCurrentPageCategory,
  selectIsInitialized,
  selectIsLoading,
  showQuestionsForCategoryId,
} from "./questionsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function QuestionList() {
  const dispatch = useAppDispatch();
  const currentPageCategory = useAppSelector(selectCurrentPageCategory);
  const currentPageQuestions = useAppSelector(selectCurrentPageQuestions);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    console.log("QuestionList useEffect triggered", {
      currentPageCategory: currentPageCategory,
      isInitialized,
      isLoading,
      questionsLength: currentPageQuestions.length,
    });

    // Only fetch questions if we have a category ID and the app is initialized
    if (currentPageCategory !== null && isInitialized) {
      console.log(
        "Dispatching showQuestionsForCategoryId for category:",
        currentPageCategory.id
      );
      dispatch(showQuestionsForCategoryId(currentPageCategory.id));
    }
  }, [currentPageCategory, isInitialized]);

  console.log("QuestionList render", {
    isInitialized,
    currentPageCategoryId: currentPageCategory,
    questionsLength: currentPageQuestions.length,
    isLoading,
  });

  if (!isInitialized || currentPageCategory === null) {
    console.log("QuestionList: Not initialized or no category ID");
    return <></>;
  }

  console.log(`questions: ${JSON.stringify(currentPageQuestions)}`);
  return (
    <>
      <div className="text-2xl font-bold text-white underline decoration-2 mb-4 leading-relaxed">
        {currentPageCategory.name}
      </div>
      <ul>
        {currentPageQuestions.map((question) => (
          <li key={question.id}>
            <Question
              questionId={question.id}
              text={question.text}
              answer={question.answer}
              categoryId={currentPageCategory.id}
            />{" "}
          </li>
        ))}{" "}
      </ul>
    </>
  );
}

export default QuestionList;
