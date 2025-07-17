import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";

import QuestionButton from "./QuestionButton";
import type { Question as QuestionData, GradeAnswer } from "./questionsSlice";
import { GradeAnswerEnum, GRADE_ANSWERS, answerSelected } from "./questionsSlice";



function Question(props: QuestionData) {
  const [gradeAnswer, setGradeAnswer] = useState<GradeAnswer | null>(() => props.answer ? props.answer.grade : null);
  const dispatch = useAppDispatch();

  return (
    <div className="bg-gray-800 border border-red-900/30 rounded-lg p-6 mb-6 shadow-lg hover:shadow-red-900/50 transition-all duration-300 marg">
      <h3 className="text-xl font-semibold text-red-100 mb-4 leading-relaxed">
        {props.text}
      </h3>
      <div className="space-y-3">
        <div className="flex">
          {GRADE_ANSWERS.map((answer) => (
            <QuestionButton
              key={answer.valueOf()}
              text={answer.valueOf()}
              questionId={props.id}
              isSelected={
                gradeAnswer ? gradeAnswer === answer.valueOf() : false
              }
              onSelected={() => {
                setGradeAnswer(answer);
                dispatch(
                  answerSelected({
                    questionId: props.id,
                    answer: {
                      grade: answer,
                      ifForced: false,
                    },
                  })
                );
              }}
            />
          ))}
          <div className="flex items-center mb-4">
            <input
              id={props.id.toString() + "-if-forced"}
              type="checkbox"
              value=""
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="ms-2 text-sm font-medium text-white dark:text-gray-300">
              If forced
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Question;
