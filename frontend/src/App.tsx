import { useState, useEffect } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
import "./App.css";

import QuestionList from "./features/questions/QuestionList";
import Spinner from "./components/Spinner.tsx";
import { useAppDispatch, useAppSelector } from "./app/hooks.tsx";
import {
  fetchQuestionCategories,
  showQuestionsForCategoryId,
  selectIsLoading,
  selectErrorMessage,
  selectCurrentPageQuestions,
  selectCurrentPageCategoryId,
} from "./features/questions/questionsSlice.tsx";
import Navigation from "./features/navigation/Navigation";

function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const errorMessage = useAppSelector(selectErrorMessage);
  const currentPageCategoryId = useAppSelector(selectCurrentPageCategoryId);
  const currentPageQuestions = useAppSelector(selectCurrentPageQuestions);

  useEffect(() => {
    dispatch(fetchQuestionCategories());
  }, []);

  useEffect(() => {
    if (currentPageCategoryId === null) {
      return;
    }
    dispatch(showQuestionsForCategoryId(currentPageCategoryId));
  }, [currentPageCategoryId]);

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
            <div className="min-h-screen">
              <Spinner />
            </div>
          ) : errorMessage ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-300 text-lg">{errorMessage}</p>
            </div>
          ) : (
            <>
              <QuestionList questions={currentPageQuestions} />
              <Navigation />
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
