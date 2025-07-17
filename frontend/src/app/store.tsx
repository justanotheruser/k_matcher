import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { createAsyncThunk, configureStore } from "@reduxjs/toolkit"

import questionsReducer from "../features/questions/questionsSlice"

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
  },
})

// Infer the type of `store`
export type AppStore = typeof store
export type RootState = ReturnType<AppStore["getState"]>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
  // extra: { s: string; n: number } // This is extra data prop, can leave it out if you are not passing extra data
}>()