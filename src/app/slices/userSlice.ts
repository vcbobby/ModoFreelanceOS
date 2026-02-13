import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '@types';

interface UserSliceState {
  userState: UserState;
  displayName: string;
  phoneNumber?: string;
}

const initialState: UserSliceState = {
  userState: {
    isSubscribed: false,
    credits: 0,
    baseCredits: 0,
    purchasedCredits: 0,
  },
  displayName: '',
  phoneNumber: '',
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
    setPhoneNumber(state, action: PayloadAction<string>) {
      state.phoneNumber = action.payload;
    },
  },
});

export const { setUserState, updateCredits, setDisplayName, setPhoneNumber } = userSlice.actions;
export default userSlice.reducer;
