import pomodoroReducer, {
  resetTimer,
  switchMode,
  toggleTimer,
  tick,
} from '@/app/slices/pomodoroSlice';

describe('pomodoroSlice', () => {
  it('toggles active state', () => {
    const nextState = pomodoroReducer(undefined, toggleTimer());
    expect(nextState.isActive).toBe(true);
  });

  it('switches mode and resets time', () => {
    const nextState = pomodoroReducer(undefined, switchMode('short'));
    expect(nextState.mode).toBe('short');
    expect(nextState.timeLeft).toBe(5 * 60);
    expect(nextState.isActive).toBe(false);
  });

  it('ticks down when active', () => {
    const activeState = pomodoroReducer(undefined, toggleTimer());
    const nextState = pomodoroReducer(activeState, tick());
    expect(nextState.timeLeft).toBe(activeState.timeLeft - 1);
  });

  it('resets current mode timer', () => {
    const shortState = pomodoroReducer(undefined, switchMode('short'));
    const nextState = pomodoroReducer(shortState, resetTimer());
    expect(nextState.timeLeft).toBe(5 * 60);
    expect(nextState.isActive).toBe(false);
  });
});
