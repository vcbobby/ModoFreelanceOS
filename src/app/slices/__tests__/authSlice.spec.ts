import authReducer, { clearAuth, setLoading, setUser } from '@/app/slices/authSlice';

describe('authSlice', () => {
  it('sets user', () => {
    const nextState = authReducer(undefined, setUser({ uid: '1', email: 'test@example.com' }));
    expect(nextState.user?.uid).toBe('1');
  });

  it('sets loading state', () => {
    const nextState = authReducer(undefined, setLoading(false));
    expect(nextState.loading).toBe(false);
  });

  it('clears auth', () => {
    const withUser = authReducer(undefined, setUser({ uid: '1' }));
    const cleared = authReducer(withUser, clearAuth());
    expect(cleared.user).toBeNull();
    expect(cleared.loading).toBe(false);
  });
});
