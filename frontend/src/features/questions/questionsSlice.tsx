import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk, RootState } from "../../app/store";
import type {
  Question as QuestionDB,
  SubmitRequest,
  SubmitResult,
} from "../../api_types";
import { type GradeAnswer, answerGradeToNumber } from "../../common_types";

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
  currentPageCategory: QuestionCategory | null;
  isInitialized: boolean;
  isSubmitting: boolean;
  submissionResult: SubmitResult | null;
  submissionErrorMessage: string | null;
  submissionSuccess: boolean | null;
  showSubmitButton: boolean;
}

export const initialState: QuestionnaireState = {
  isLoading: false,
  errorMessage: "",
  questionCategories: [],
  categoryIdRank: {},
  questionsByCategoryId: {},
  questionsById: {},
  currentPageCategory: null,
  isInitialized: false,
  isSubmitting: false,
  submissionResult: null,
  submissionSuccess: null,
  submissionErrorMessage: null,
  showSubmitButton: false,
};

export interface QuestionAnswerAction {
  questionId: number;
  categoryId: number;
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
    questionsLoaded: (
      state,
      action: PayloadAction<{ categoryId: number; questions: Question[] }>
    ) => {
      const { categoryId, questions } = action.payload;
      console.log(
        "questionsLoaded for category:",
        categoryId,
        "questions count:",
        questions.length
      );

      state.questionsByCategoryId[categoryId] = questions;
      questions.forEach((q) => {
        state.questionsById[q.id] = q;
      });
    },
    answerSelected: (state, action: PayloadAction<QuestionAnswerAction>) => {
      console.log(`answerSelected, action=${JSON.stringify(action.payload)}`);
      const { questionId, categoryId, answer } = action.payload;
      localStorage.setItem(
        questionId.toString() + "-grade",
        answer.grade.valueOf()
      );
      if (state.questionsById[questionId]) {
        state.questionsById[questionId].answer = answer;
        const question = state.questionsByCategoryId[categoryId].find(
          (q) => q.id == questionId
        );
        if (question) {
          question.answer = answer;
        }
      }

      // Check if all questions have answers
      const allQuestions = Object.values(state.questionsById);
      const allQuestionsAnswered =
        allQuestions.length > 0 && allQuestions.every((q) => q.answer !== null);

      state.showSubmitButton = allQuestionsAnswered;
    },
    setCategory: (state, action: PayloadAction<QuestionCategory>) => {
      state.currentPageCategory = action.payload;
    },
    submitStarted: (state) => {
      state.isSubmitting = true;
      state.submissionResult = null;
    },
    submitFinished: (state) => {
      state.isSubmitting = false;
    },
    submitSuccess: (state, action: PayloadAction<SubmitResult>) => {
      state.submissionResult = action.payload;
      state.submissionErrorMessage = null;
      state.submissionSuccess = true;
      state.showSubmitButton = false;
    },
    submitError: (state, action: PayloadAction<string>) => {
      state.submissionResult = null;
      state.submissionErrorMessage = action.payload;
      state.submissionSuccess = false;
      state.showSubmitButton = false;
    },
    setShowSubmitButton: (state, action: PayloadAction<boolean>) => {
      state.showSubmitButton = action.payload;
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
  setCategory,
  submitStarted,
  submitFinished,
  submitSuccess,
  submitError,
  setShowSubmitButton,
} = questionsSlice.actions;

export default questionsSlice.reducer;

const EMPTY_QUESTIONS_ARRAY: Question[] = [];

// Selectors
export const selectIsLoading = (state: RootState) => state.questions.isLoading;
export const selectErrorMessage = (state: RootState) =>
  state.questions.errorMessage;
export const selectCurrentPageCategory = (state: RootState) =>
  state.questions.currentPageCategory;
export const selectCurrentPageQuestions = (state: RootState) => {
  const currentCategory = state.questions.currentPageCategory;
  const categoryId = currentCategory ? currentCategory.id : null;
  console.log("selectCurrentPageQuestions called", {
    categoryId,
    availableCategories: Object.keys(state.questions.questionsByCategoryId),
    questionsForCategory: categoryId
      ? state.questions.questionsByCategoryId[categoryId]?.length
      : 0,
  });

  if (categoryId === null) return EMPTY_QUESTIONS_ARRAY;
  return (
    state.questions.questionsByCategoryId[categoryId] || EMPTY_QUESTIONS_ARRAY
  );
};
export const selectIsInitialized = (state: RootState) =>
  state.questions.isInitialized;
export const selectIsSubmitting = (state: RootState) =>
  state.questions.isSubmitting;
export const selectSubmissionResult = (state: RootState) =>
  state.questions.submissionResult;
export const selectSubmissionSuccess = (state: RootState) =>
  state.questions.submissionSuccess;
export const selectSubmissionErrorMessage = (state: RootState) =>
  state.questions.submissionErrorMessage;
export const selectShowSubmitButton = (state: RootState) =>
  state.questions.showSubmitButton;
export const selectAllQuestionsAnswered = (state: RootState) => {
  const allQuestions = Object.values(state.questions.questionsById);
  return (
    allQuestions.length > 0 && allQuestions.every((q) => q.answer !== null)
  );
};

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const BACKEND_REQUEST_OPTIONS = {
  headers: {
    accept: "application/json",
  },
};

export const fetchQuestionCategories = (): AppThunk => {
  return async (dispatch, getState) => {
    if (getState().questions.questionCategories.length > 0) {
      console.log("categories already fetched");
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
      const questionsDB: QuestionDB[] = await _fetchQuestionsByCategoryId(
        categoryId
      );
      const questions: Question[] = [];

      questionsDB.forEach((q) => {
        const question: Question = { id: q.id, text: q.text, answer: null };
        const gradeStr = localStorage.getItem(q.id.toString() + "-grade");
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

export const submitAnswers = (): AppThunk => {
  return async (dispatch, getState) => {
    const state = getState();
    const allQuestions = Object.values(state.questions.questionsById);

    const answers = allQuestions
      .filter((q) => q.answer !== null)
      .map((q) => {
        const answer = q.answer!;

        const result: {
          question_id: number;
          answer: number;
          if_forced?: boolean;
        } = {
          question_id: q.id,
          answer: answerGradeToNumber[answer.grade],
        };

        if (answer.ifForced) {
          result.if_forced = true;
        }

        return result;
      });

    const requestBody: SubmitRequest = { answers };
    if (location.pathname !== "/") {
      requestBody.partner_id = location.pathname.slice(1);
    }

    try {
      dispatch(submitStarted());

      const request_options = {
        ...BACKEND_REQUEST_OPTIONS,
        method: "POST",
        headers: {
          ...BACKEND_REQUEST_OPTIONS.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetch(
        `${BACKEND_BASE_URL}/results`,
        request_options
      );

      if (response.ok) {
        const data: SubmitResult = await response.json();
        // If there are matching results, redirect to the results page
        if (data.matching_result && data.matching_result.length > 0) {
          window.location.href = `/${data.id}`;
        }
        dispatch(submitSuccess(data));
      } else if (response.status === 400) {
        dispatch(submitError("Something went wrong"));
      } else if (response.status === 500) {
        dispatch(submitError("Something went wrong"));
      } else {
        dispatch(submitError("Something went wrong"));
      }
    } catch {
      dispatch(submitError("Something went wrong"));
    } finally {
      dispatch(submitFinished());
    }
  };
};
