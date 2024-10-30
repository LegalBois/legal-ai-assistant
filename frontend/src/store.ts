import { configureStore } from '@reduxjs/toolkit';
import viewsReducer from './views/viewsSlice';

export const store = configureStore({
  reducer: {
    views: viewsReducer,
  },
});

export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;
