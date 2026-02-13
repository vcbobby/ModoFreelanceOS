import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '@/app/hooks/useAgendaNotifications';

interface NotificationsState {
  items: AppNotification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = action.payload;
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { setNotifications, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
