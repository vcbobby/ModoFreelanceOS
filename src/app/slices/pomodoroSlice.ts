import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PomodoroMode = 'work' | 'short' | 'long';

interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  mode: PomodoroMode;
}

const getModeDuration = (mode: PomodoroMode) => {
  if (mode === 'work') return 25 * 60;
  if (mode === 'short') return 5 * 60;
  return 15 * 60;
};

const initialState: PomodoroState = {
  mode: 'work',
  timeLeft: getModeDuration('work'),
  isActive: false,
};

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    toggleTimer(state) {
      state.isActive = !state.isActive;
    },
    switchMode(state, action: PayloadAction<PomodoroMode>) {
      state.mode = action.payload;
      state.isActive = false;
      state.timeLeft = getModeDuration(action.payload);
    },
    resetTimer(state) {
      state.isActive = false;
      state.timeLeft = getModeDuration(state.mode);
    },
    tick(state) {
      if (state.isActive && state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
    stopTimer(state) {
      state.isActive = false;
    },
    resumeTimer(state, action: PayloadAction<{ timeLeft: number; mode: PomodoroMode }>) {
      state.timeLeft = action.payload.timeLeft;
      state.mode = action.payload.mode;
      state.isActive = true;
    },
  },
});

export const { toggleTimer, switchMode, resetTimer, tick, stopTimer, resumeTimer } = pomodoroSlice.actions;
export default pomodoroSlice.reducer;
