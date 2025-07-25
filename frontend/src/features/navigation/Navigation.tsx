import { useAppDispatch } from "../../app/hooks";
import type { RootState } from "../../app/store";
import { useSelector } from "react-redux";

import { setCategory } from "../questions/questionsSlice";
import type { QuestionCategory } from "../../api_types";

export function Navigation() {
  const prevPageCategory: QuestionCategory | null = useSelector(
    (state: RootState) => {
      const currentCategory = state.questions.currentPageCategory;
      if (currentCategory === null) {
        return null;
      }
      const categoryRank = state.questions.categoryIdRank[currentCategory.id];
      if (categoryRank <= 0) {
        return null;
      }
      return state.questions.questionCategories[categoryRank - 1];
    }
  );

  const nextPageCategory: QuestionCategory | null = useSelector(
    (state: RootState) => {
      const currentCategory = state.questions.currentPageCategory;
      if (currentCategory === null) {
        return null;
      }
      const categoryRank = state.questions.categoryIdRank[currentCategory.id];
      if (categoryRank >= state.questions.questionCategories.length - 1) {
        return null;
      }
      return state.questions.questionCategories[categoryRank + 1];
    }
  );

  const dispatch = useAppDispatch();

  return (
    <div className="text-xl font-semibold text-red-100 mb-4 leading-relaxed  mr-10 ml-10 flex justify-between">
      {prevPageCategory ? (
        <button
          className="left cursor-pointer hover:text-red-300"
          onClick={() => dispatch(setCategory(prevPageCategory))}
        >
          &lt;&lt;&lt; Prev
        </button>
      ) : (
        <div />
      )}
      {nextPageCategory ? (
        <button
          className="right cursor-pointer hover:text-red-300"
          onClick={() => dispatch(setCategory(nextPageCategory))}
        >
          Next &gt;&gt;&gt;
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}

export default Navigation;
