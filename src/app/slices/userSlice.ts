import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '@types';

interface UserSliceState {
  userState: UserState;
  displayName: string;
}

const initialState: UserSliceState = {
  userState: {
    isSubscribed: false,
    credits: 0,
  },
  displayName: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserState(state, action: PayloadAction<UserState>) {
      state.userState = action.payload;
    },
    updateCredits(state, action: PayloadAction<number>) {
      state.userState.credits = action.payload;
    },
    setDisplayName(state, action: PayloadAction<string>) {
      state.displayName = action.payload;
    },
  },
});

export const { setUserState, updateCredits, setDisplayName } = userSlice.actions;
export default userSlice.reducer;
