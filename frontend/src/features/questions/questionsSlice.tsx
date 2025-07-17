import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "../../app/store";
import type { Question as QuestionDB } from "../../api_types";

const GradeAnswerEnum = {
  Never: "Never",
  NoDesire: "No desire",
  Maybe: "Maybe",
  Yes: "Yes",
  Need: "Need",
} as const;
export type GradeAnswer =
  (typeof GradeAnswerEnum)[keyof typeof GradeAnswerEnum];

export interface Answer {
  grade: GradeAnswer;
  if_forced: boolean;
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
  currentPageCategoryId: number | null;
  currentPageQuestions: QuestionDB[];
}

export const initialState: QuestionnaireState = {
  isLoading: false,
  errorMessage: "",
  questionCategories: [],
  categoryIdRank: [],
  questionsByCategoryId: {},
  currentPageCategoryId: null,
  currentPageQuestions: [],
};

export interface QuestionAnswerAction {
  id: number;
  category_id: number;
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
        state.currentPageCategoryId = state.questionCategories[0].id;
        // сопоставляем каждому id его порядковый номер
        state.categoryIdRank = state.questionCategories
          .map((value, index) => ({ id: value.id, index }))
          .reduce((acc: { [key: number]: number }, current) => {
            acc[current.id] = current.index;
            return acc;
          }, {});
      }
    },
    answerSelected: (state, action: PayloadAction<QuestionAnswerAction>) => {
      console.log(`answerSelected, action=${JSON.stringify(action.payload)}`);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionsByCategoryId.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(fetchQuestionsByCategoryId.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = "failed to fetch questions";
      })
      .addCase(fetchQuestionsByCategoryId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = "";
        state.currentPageCategoryId = action.payload.categoryId;
        state.currentPageQuestions = action.payload.questions;
      });
  },
});

export const {
  loadingStarted,
  loadingFinished,
  errorHappened,
  resetErrorMessage,
  categoriesLoaded,
  answerSelected,
} = questionsSlice.actions;
export default questionsSlice.reducer;
export const selectIsLoading = (state: RootState) => state.questions.isLoading;
export const selectErrorMessage = (state: RootState) =>
  state.questions.errorMessage;
export const selectCurrentPageCategoryId = (state: RootState) =>
  state.questions.currentPageCategoryId;
export const selectCurrentPageQuestions = (state: RootState) =>
  state.questions.currentPageQuestions;

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const BACKEND_REQUEST_OPTIONS = {
  headers: {
    accept: "application/json",
  },
};

export const fetchQuestionCategories = (): AppThunk => {
  return async (dispatch) => {
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

export const fetchQuestionsByCategoryId = createAsyncThunk(
  "questions/fetchQuestionsByCategryId",
  async (categoryId: number) => {
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
    const questions = await response.json();
    return { categoryId, questions };
  }
);
