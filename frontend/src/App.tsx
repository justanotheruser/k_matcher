import { useState, useEffect } from "react";
//import reactLogo from "./assets/react.svg";
//import viteLogo from "/vite.svg";
import "./App.css";

import Question from "./components/Question.tsx";
import Spinner from "./components/Spinner.tsx";

const BACKEND_BASE_URL = "http://matchyourkink.ru:8080";
const BACKEND_REQUEST_OPTIONS = {
  headers: {
    accept: "application/json",
  },
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionList, setQuestionList] = useState([]);

  const fetchQuestions = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const request_options = {
        ...BACKEND_REQUEST_OPTIONS,
        method: "GET",
      };
      const response = await fetch(
        `${BACKEND_BASE_URL}/questions`,
        request_options
      );
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      console.log(data);
      setQuestionList(data);
    } catch (err) {
      setErrorMessage(`Failed to fetch questions: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);
  // TODO: use strict typing
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
        <main className="flex-1 overflow-y-scroll scrollbar-webkit scrollbar-thin">
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
              <ul>
                {questionList.map((question: any) => (
                  <li key={question.id}>
                    <Question text={question.text} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
