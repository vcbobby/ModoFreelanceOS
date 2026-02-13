import uiReducer, {
  setCurrentView,
  toggleMobileMenu,
  setPricingOpen,
} from '@/app/slices/uiSlice';
import { AppView } from '@types';

describe('uiSlice', () => {
  it('sets current view', () => {
    const nextState = uiReducer(undefined, setCurrentView(AppView.NOTES));
    expect(nextState.currentView).toBe(AppView.NOTES);
  });

  it('toggles mobile menu', () => {
    const nextState = uiReducer(undefined, toggleMobileMenu());
    expect(nextState.isMobileMenuOpen).toBe(true);
  });

  it('sets pricing modal state', () => {
    const nextState = uiReducer(undefined, setPricingOpen(true));
    expect(nextState.isPricingOpen).toBe(true);
  });
});
