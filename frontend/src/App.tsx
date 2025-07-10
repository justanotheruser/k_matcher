import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import Spinner from "./components/Spinner.tsx";

const BACKEND_BASE_URL = "http://localhost:8000";
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
      setQuestionList(data)
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
    <main>
      <section className="questions">
        {isLoading ? (
          <Spinner />
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : (
          <>Questions:
          <ul>
            {questionList.map((question: any) => (
              <li key={question.id}>
                <p>{question.text}</p>
              </li>
            ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
