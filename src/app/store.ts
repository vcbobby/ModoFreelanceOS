import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/app/slices/authSlice';
import userReducer from '@/app/slices/userSlice';
import uiReducer from '@/app/slices/uiSlice';
import notificationsReducer from '@/app/slices/notificationsSlice';
import pomodoroReducer from '@/app/slices/pomodoroSlice';
import { backendApi } from '@/services/backend/backendApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    pomodoro: pomodoroReducer,
    [backendApi.reducerPath]: backendApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backendApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
