import { useEffect, useState, type JSX } from "react";
import { useParams, Navigate } from "react-router-dom";
import type { SubmitResult, Question } from "../../api_types";
import Spinner from "../../components/Spinner";
import Questionnaire from "../questions/Questionnaire";
import { numberToAnswerGrade, GradeAnswerEnum } from "../../common_types";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export default function ResultView() {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldShow404, setShouldShow404] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        setShouldShow404(false);

        const [resultResponse, questionsResponse] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/results/${resultId}`),
          fetch(`${BACKEND_BASE_URL}/questions`),
        ]);

        if (!resultResponse.ok) {
          if (resultResponse.status === 404 || resultResponse.status === 422) {
            setShouldShow404(true);
          } else {
            setError("Failed to load result");
          }
          return;
        }

        if (!questionsResponse.ok) {
          setError("Failed to load questions");
          return;
        }

        const [resultData, questionsData] = await Promise.all([
          resultResponse.json(),
          questionsResponse.json(),
        ]);

        setResult(resultData);
        setQuestions(questionsData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const getQuestionText = (questionId: number): string => {
    const question = questions.find((q) => q.id === questionId);
    return question ? question.text : `Question ${questionId}`;
  };

  // Redirect to 404 if result not found
  if (shouldShow404) {
    return <Navigate to="/not_found" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Handle other errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return <Navigate to="/not_found" replace />;
  }

  // Check if results are ready (matching_result exists)
  if (!result.matching_result || result.matching_result.length === 0) {
    return <Questionnaire />;
  }
  //sort result.matching_result by min_answer ascending
  result.matching_result.sort((a, b) => b.min_answer - a.min_answer);

  // Display matching results as table
  // Center each table header
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-8">
          Matching Results
        </h1>

        <div className="bg-gray-800/50 border border-gray-600 rounded-lg overflow-hidden">
          <div className="overflow-y-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-gray-800">
                <tr className="bg-gray-700/50">
                  <th className="text-center px-6 py-4 text-gray-300 font-semibold">
                    Question
                  </th>
                  <th className="text-center px-6 py-4 text-gray-300 font-semibold">
                    Answers A
                  </th>
                  <th className="text-center px-6 py-4 text-gray-300 font-semibold">
                    Answers B
                  </th>
                  <th className="text-center px-6 py-4 text-gray-300 font-semibold">
                    Min answer
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.matching_result.map((matchGroup, groupIndex) =>
                  matchGroup.matches.map((match, matchIndex) => (
                    <tr
                      key={`${groupIndex}-${matchIndex}`}
                      className={`border-t border-gray-600 ${
                        (groupIndex + matchIndex) % 2 === 0
                          ? "bg-gray-800/30"
                          : "bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-300">
                        {getQuestionText(match.question_id)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {getAnswerText(match.answer_a.answer)}
                        {match.answer_a.if_forced && (
                          <span className="ml-2 text-xs text-yellow-400">
                            (forced)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {getAnswerText(match.answer_b.answer)}
                        {match.answer_b.if_forced && (
                          <span className="ml-2 text-xs text-yellow-400">
                            (forced)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getMatchScore(matchGroup.min_answer)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAnswerText(answer: number): string {
  return answer in numberToAnswerGrade
    ? numberToAnswerGrade[answer as keyof typeof numberToAnswerGrade]
    : "N/A";
}

function getMatchScore(min_answer: number): JSX.Element {
  const displayText = getAnswerText(min_answer);
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(
        displayText
      )}`}
    >
      {displayText}
    </span>
  );
}

function getMatchScoreColor(grade: string): string {
  switch (grade) {
    case GradeAnswerEnum.Need:
      return "bg-green-500/20 text-green-300 border border-green-500 font-bold";
    case GradeAnswerEnum.Yes:
      return "bg-green-500/20 text-green-300 border border-green-500";
    case GradeAnswerEnum.Maybe:
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500";
    case GradeAnswerEnum.NoDesire:
      return "bg-orange-500/20 text-orange-300 border border-orange-500";
    default:
      return "bg-red-500/20 text-red-300 border border-red-500";
  }
}
