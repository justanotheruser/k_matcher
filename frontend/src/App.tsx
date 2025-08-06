import { useEffect } from "react";
import "./App.css";

import QuestionList from "./features/questions/QuestionList";
import Spinner from "./components/Spinner";
import SubmissionResult from "./components/SubmissionResult";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  fetchQuestionCategories,
  selectIsLoading,
  selectErrorMessage,
  selectIsInitialized,
  selectSubmissionResult,
  setCategory,
} from "./features/questions/questionsSlice";
import Navigation from "./features/navigation/Navigation";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const errorMessage = useAppSelector(selectErrorMessage);
  const isInitialized = useAppSelector(selectIsInitialized);
  const questionCategories = useSelector(
    (state: RootState) => state.questions.questionCategories
  );
  const currentPageCategory = useSelector(
    (state: RootState) => state.questions.currentPageCategory
  );
  const submissionResult = useAppSelector(selectSubmissionResult);

  useEffect(() => {
    console.log("App useEffect: fetching categories");
    dispatch(fetchQuestionCategories());
  }, []);

  // Set initial category when categories are loaded
  useEffect(() => {
    if (
      isInitialized &&
      questionCategories.length > 0 &&
      currentPageCategory === null
    ) {
      console.log("Setting initial category:", questionCategories[0].id);
      dispatch(setCategory(questionCategories[0]));
    }
  }, [isInitialized, questionCategories]);

  console.log("App render", {
    isLoading,
    errorMessage,
    isInitialized,
    categoriesCount: questionCategories.length,
  });

  return (
    <>
      <div className="container flex flex-col h-screen overflow-hidden">
        <header className="text-center mb-12 w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
            Discover Your Desires
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Answer these questions honestly to find your perfect match and
            explore your preferences
          </p>
        </header>
        <main className="flex-1 overflow-y-scroll scrollbar-webkit scrollbar-thin pl-10 pr-10">
          {isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <Spinner />
            </div>
          ) : errorMessage ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-300 text-lg">{errorMessage}</p>
            </div>
          ) : submissionResult ? (
            <SubmissionResult />
          ) : (
            <>
              <QuestionList />
              <Navigation />
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
