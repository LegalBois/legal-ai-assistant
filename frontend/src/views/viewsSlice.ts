import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TRootState } from '@/store';
import { TView, TViewState } from '@/views';

const initialState: TViewState = {
  currentView: 'chat',
};

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<TView>) => {
      state.currentView = action.payload;
    },
  },
});

export const { setView } = viewsSlice.actions;

export const selectCurrentView = (state: TRootState) => state.views.currentView;

export default viewsSlice.reducer;
