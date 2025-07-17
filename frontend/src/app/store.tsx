import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { configureStore } from "@reduxjs/toolkit"

import navigationReducer from "../features/navigation/navigationSlice"
import questionsReducer from "../features/questions/questionsSlice"

/*import { composeWithDevTools } from "redux-devtools-extension";

const composeEnhancers = composeWithDevTools({ 
    questionsSlice.actions, 
    trace: true, 
    traceLimit: 25 
}); */

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