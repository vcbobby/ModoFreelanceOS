import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppView } from '@types';

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface UiState {
  currentView: AppView;
  isMobileMenuOpen: boolean;
  isPricingOpen: boolean;
  autoOpenAgenda: boolean;
  isNotifOpen: boolean;
  showSuccessMsg: boolean;
  isEditingName: boolean;
  alertModal: AlertModalState;
}

const initialState: UiState = {
  currentView: AppView.DASHBOARD,
  isMobileMenuOpen: false,
  isPricingOpen: false,
  autoOpenAgenda: false,
  isNotifOpen: false,
  showSuccessMsg: false,
  isEditingName: false,
  alertModal: {
    isOpen: false,
    title: '',
    message: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<AppView>) {
      state.currentView = action.payload;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.isMobileMenuOpen = action.payload;
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setPricingOpen(state, action: PayloadAction<boolean>) {
      state.isPricingOpen = action.payload;
    },
    setAutoOpenAgenda(state, action: PayloadAction<boolean>) {
      state.autoOpenAgenda = action.payload;
    },
    setNotifOpen(state, action: PayloadAction<boolean>) {
      state.isNotifOpen = action.payload;
    },
    setShowSuccessMsg(state, action: PayloadAction<boolean>) {
      state.showSuccessMsg = action.payload;
    },
    setIsEditingName(state, action: PayloadAction<boolean>) {
      state.isEditingName = action.payload;
    },
    setAlertModal(state, action: PayloadAction<AlertModalState>) {
      state.alertModal = action.payload;
    },
    closeAlertModal(state) {
      state.alertModal.isOpen = false;
    },
  },
});

export const {
  setCurrentView,
  setMobileMenuOpen,
  toggleMobileMenu,
  setPricingOpen,
  setAutoOpenAgenda,
  setNotifOpen,
  setShowSuccessMsg,
  setIsEditingName,
  setAlertModal,
  closeAlertModal,
} = uiSlice.actions;

export default uiSlice.reducer;
