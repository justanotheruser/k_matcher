import { useAppDispatch } from "../../app/hooks";
import type { RootState } from "../../app/store";
import { useSelector } from "react-redux";

import {
  setCategoryId,
} from "../questions/questionsSlice";

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
        <button 
          className="left cursor-pointer hover:text-red-300" 
          onClick={() => dispatch(setCategoryId(prevPageCategoryId))}
        >
          &lt;&lt;&lt; Prev
        </button>
      ) : (
        <div />
      )}
      {nextPageCategoryId ? (
        <button 
          className="right cursor-pointer hover:text-red-300" 
          onClick={() => dispatch(setCategoryId(nextPageCategoryId))}
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