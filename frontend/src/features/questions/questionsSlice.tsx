import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "../../app/store";
import type { Question as QuestionDB } from "../../api_types";

export const GradeAnswerEnum = {
  Never: "Never",
  NoDesire: "No desire",
  Maybe: "Maybe",
  Yes: "Yes",
  Need: "Need",
} as const;
export type GradeAnswer =
  (typeof GradeAnswerEnum)[keyof typeof GradeAnswerEnum];
export const GRADE_ANSWERS = [
  GradeAnswerEnum.Never,
  GradeAnswerEnum.NoDesire,
  GradeAnswerEnum.Maybe,
  GradeAnswerEnum.Yes,
  GradeAnswerEnum.Need,
];

export interface Answer {
  grade: GradeAnswer;
  ifForced: boolean;
}
export interface Question {
  id: number;
  text: string;
  answer: Answer | null;
}

export interface QuestionCategory {
  id: number;
  name: string;
}

type QuestionCategoryList = QuestionCategory[];

export interface QuestionnaireState {
  isLoading: boolean;
  errorMessage: string;
  questionCategories: QuestionCategoryList;
  categoryIdRank: { [key: number]: number };
  questionsByCategoryId: {
    [key: number]: Question[];
  };
  questionsById: { [key: number]: Question };
  currentPageCategoryId: number | null;
  isInitialized: boolean;
}

export const initialState: QuestionnaireState = {
  isLoading: false,
  errorMessage: "",
  questionCategories: [],
  categoryIdRank: {},
  questionsByCategoryId: {},
  questionsById: {},
  currentPageCategoryId: null,
  isInitialized: false,
};

export interface QuestionAnswerAction {
  questionId: number;
  answer: Answer;
}

export const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    loadingStarted: (state) => {
      state.errorMessage = "";
      state.isLoading = true;
    },
    loadingFinished: (state) => {
      state.isLoading = false;
    },
    errorHappened: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    resetErrorMessage: (state) => {
      state.errorMessage = "";
    },
    categoriesLoaded: (state, action: PayloadAction<QuestionCategoryList>) => {
      console.log(`categories: ${JSON.stringify(action.payload)}`);
      state.questionCategories = action.payload;
      if (state.questionCategories.length > 0) {
        // Map each id to its index
        state.categoryIdRank = state.questionCategories
          .map((value, index) => ({ id: value.id, index }))
          .reduce((acc: { [key: number]: number }, current) => {
            acc[current.id] = current.index;
            return acc;
          }, {});
      }
      state.isInitialized = true;
    },
    questionsLoaded: (state, action: PayloadAction<{categoryId: number, questions: Question[]}>) => {
      const {categoryId, questions} = action.payload;
      console.log("questionsLoaded for category:", categoryId, "questions count:", questions.length);
      
      state.questionsByCategoryId[categoryId] = questions;
      questions.forEach((q) => {
        state.questionsById[q.id] = q;
      });
    },
    answerSelected: (state, action: PayloadAction<QuestionAnswerAction>) => {
      console.log(`answerSelected, action=${JSON.stringify(action.payload)}`);
      let {questionId, answer} = action.payload;
      localStorage.setItem(questionId.toString() + "-grade", answer.grade.valueOf());
      if (state.questionsById[questionId]) {
        state.questionsById[questionId].answer = answer;
      }
    },
    setCategoryId: (state, action: PayloadAction<number>) => {
      state.currentPageCategoryId = action.payload;
    },
  },
});

export const {
  loadingStarted,
  loadingFinished,
  errorHappened,
  resetErrorMessage,
  categoriesLoaded,
  questionsLoaded,
  answerSelected,
  setCategoryId,
} = questionsSlice.actions;

export default questionsSlice.reducer;

// Selectors
export const selectIsLoading = (state: RootState) => state.questions.isLoading;
export const selectErrorMessage = (state: RootState) =>
  state.questions.errorMessage;
export const selectCurrentPageCategoryId = (state: RootState) =>
  state.questions.currentPageCategoryId;
export const selectCurrentPageQuestions = (state: RootState) => {
  const categoryId = state.questions.currentPageCategoryId;
  console.log("selectCurrentPageQuestions called", {
    categoryId,
    availableCategories: Object.keys(state.questions.questionsByCategoryId),
    questionsForCategory: categoryId ? state.questions.questionsByCategoryId[categoryId]?.length : 0
  });
  
  if (categoryId === null) return [];
  return state.questions.questionsByCategoryId[categoryId] || [];
};
export const selectIsInitialized = (state: RootState) => state.questions.isInitialized;

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const BACKEND_REQUEST_OPTIONS = {
  headers: {
    accept: "application/json",
  },
};

export const fetchQuestionCategories = (): AppThunk => {
  return async (dispatch, getState) => {
    if (getState().questions.questionCategories.length > 0) {
      console.log("categories already fetched")
      return;
    }
    try {
      dispatch(resetErrorMessage());
      dispatch(loadingStarted());
      const request_options = {
        ...BACKEND_REQUEST_OPTIONS,
        method: "GET",
      };
      const response = await fetch(
        `${BACKEND_BASE_URL}/question_categories`,
        request_options
      );
      if (!response.ok) {
        throw new Error("Failed to fetch question categories");
      }
      const data = await response.json();
      console.log(data);
      dispatch(categoriesLoaded(data));
    } catch (err) {
      dispatch(errorHappened(`Failed to fetch question categories: ${err}`));
    } finally {
      dispatch(loadingFinished());
    }
  };
};

export const showQuestionsForCategoryId = (categoryId: number): AppThunk => {
  return async (dispatch, getState) => {
    const state = getState();
    
    // If questions are already loaded, do nothing
    if (categoryId in state.questions.questionsByCategoryId) {
      console.log(`Already loaded for ${categoryId}`);
      return;
    }
    
    try {
      dispatch(loadingStarted());
      const questionsDB: QuestionDB[] = await _fetchQuestionsByCategoryId(categoryId);
      const questions: Question[] = [];
      
      questionsDB.forEach((q) => {
        let question: Question = { id: q.id, text: q.text, answer: null };
        let gradeStr = localStorage.getItem(q.id.toString() + "-grade");
        if (gradeStr) {
          const grade = gradeStr as unknown as GradeAnswer;
          question.answer = { grade, ifForced: false };
        }
        questions.push(question);
      });

      console.log(`result=${JSON.stringify(questions)}`);
      dispatch(questionsLoaded({ categoryId, questions }));
    } catch (error) {
      dispatch(errorHappened(`Failed to fetch questions: ${error}`));
    } finally {
      dispatch(loadingFinished());
    }
  };
};

const _fetchQuestionsByCategoryId = async (categoryId: number) => {
  const request_options = {
    ...BACKEND_REQUEST_OPTIONS,
    method: "GET",
  };
  const response = await fetch(
    `${BACKEND_BASE_URL}/questions?category_id=${categoryId}`,
    request_options
  );
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return await response.json();
};
