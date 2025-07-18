import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk, AppDispatch, RootState } from "../../app/store";
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
  currentPageQuestions: Question[];
}

export const initialState: QuestionnaireState = {
  isLoading: false,
  errorMessage: "",
  questionCategories: [],
  categoryIdRank: [],
  questionsByCategoryId: {},
  questionsById: {},
  currentPageCategoryId: null,
  currentPageQuestions: [],
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
      let {questionId, answer} = action.payload;
      localStorage.setItem(questionId.toString() + "-grade", answer.grade.valueOf());
      state.questionsById[questionId].answer = answer;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showQuestionsForCategoryId.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(showQuestionsForCategoryId.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = "failed to fetch questions";
      })
      .addCase(showQuestionsForCategoryId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = "";
        let {categoryId, questions} = action.payload;
        if (state.currentPageCategoryId == categoryId) {
          return;
        }
        state.currentPageCategoryId = categoryId;
        state.currentPageQuestions = questions;
        if (categoryId in state.questionsByCategoryId) {
          return;
        }
        state.questionsByCategoryId[categoryId] = questions;
        questions.forEach((q) => {
          state.questionsById[q.id] = q;
        });
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

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
  // extra: { s: string; n: number } // This is extra data prop, can leave it out if you are not passing extra data
}>();

export const showQuestionsForCategoryId = createAppAsyncThunk(
  "questions/showQuestionsForCategoryId",
  async (categoryId: number, { getState }) => {
    const rootState: RootState = getState();
    if (categoryId in rootState.questions.questionsByCategoryId) {
      console.log(`Already loaded for ${categoryId}`);
      return {
        categoryId,
        questions: rootState.questions.questionsByCategoryId[categoryId],
      };
    }
    const questionsDB: QuestionDB[] = await _fetchQuestionsByCategoryId(
      categoryId
    );
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
    return { categoryId, questions };
  }
);

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
