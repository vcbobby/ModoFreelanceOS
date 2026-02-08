import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthView } from '..';

// Mock Firebase functions
const signInWithEmail = vi.fn().mockResolvedValue({});
const createUserWithEmail = vi.fn().mockResolvedValue({});
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: (...args: any[]) => signInWithEmail(...args),
  createUserWithEmailAndPassword: (...args: any[]) => createUserWithEmail(...args),
  sendPasswordResetEmail: () => Promise.resolve(),
}));
vi.mock('@config/firebase', () => ({ auth: {}, db: {} }));

describe('AuthView form', () => {
  it('calls signInWithEmailAndPassword on submit', async () => {
    const onLogin = vi.fn();
    render(<AuthView onLoginSuccess={onLogin} onBack={() => {}} />);

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/Email/i);
    const passInput = screen.getByLabelText(/Password/i);

    // Fill and submit via form element
    await user.type(emailInput, 'a@b.com');
    await user.type(passInput, '123456');

    // submit using the primary submit button shown in login view
    await user.click(screen.getByRole('button', { name: /Entrar al Dashboard/i }));

    // Wait for the mocked call
    await waitFor(() => expect(signInWithEmail).toHaveBeenCalled());
  });
});

