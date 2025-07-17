import { useAppDispatch } from "../../app/hooks";
import type { RootState } from "../../app/store";
import { useSelector } from "react-redux";

import {
  showQuestionsForCategoryId,
} from "../questions/questionsSlice.tsx";

export function Navigation() {
  const prevPageCategoryId: number | null = useSelector((state: RootState) => {
    let currentCategoryId = state.questions.currentPageCategoryId;
    if (currentCategoryId === null) {
      return null;
    }
    const categoryRank = state.questions.categoryIdRank[currentCategoryId];
    if (categoryRank <= 0) {
      return null;
    }
    return state.questions.questionCategories[categoryRank-1].id
  });
  const nextPageCategoryId: number | null = useSelector((state: RootState) => {
    let currentCategoryId = state.questions.currentPageCategoryId;
    if (currentCategoryId === null) {
      return null;
    }
    const categoryRank = state.questions.categoryIdRank[currentCategoryId];
    if (categoryRank >= state.questions.questionCategories.length - 1) {
      return null;
    }
    return state.questions.questionCategories[categoryRank+1].id;
  });
  const dispatch = useAppDispatch();

  return (
    <div className="text-xl font-semibold text-red-100 mb-4 leading-relaxed  mr-10 ml-10 flex justify-between">
      {prevPageCategoryId ? (
        <a className="left" onClick={() => dispatch(showQuestionsForCategoryId(prevPageCategoryId))}>
          &lt;&lt;&lt; Prev
        </a>
      ) : (
        <div />
      )}
      {nextPageCategoryId ? (
        <a className="right" onClick={() => dispatch(showQuestionsForCategoryId(nextPageCategoryId))}>
          Next &gt;&gt;&gt;
        </a>
      ) : (
        <div />
      )}
    </div>
  );
}

export default Navigation;
