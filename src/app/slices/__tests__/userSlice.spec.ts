import userReducer, { setDisplayName, setUserState, updateCredits } from '@/app/slices/userSlice';

describe('userSlice', () => {
  it('sets user state', () => {
    const nextState = userReducer(undefined, setUserState({ isSubscribed: true, credits: 5 }));
    expect(nextState.userState.isSubscribed).toBe(true);
    expect(nextState.userState.credits).toBe(5);
  });

  it('updates credits', () => {
    const nextState = userReducer(undefined, updateCredits(7));
    expect(nextState.userState.credits).toBe(7);
  });

  it('sets display name', () => {
    const nextState = userReducer(undefined, setDisplayName('Ana'));
    expect(nextState.displayName).toBe('Ana');
  });
});
