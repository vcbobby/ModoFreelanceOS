import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  it('toggles theme and updates documentElement class', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('theme');
    expect(themeSpan.textContent).toMatch(/light|dark/);

    // Toggle
    const btn = screen.getByText('Toggle');
    const initialDark = document.documentElement.classList.contains('dark');
    const user = userEvent.setup();
    await user.click(btn);

    // Document class should reflect theme toggle
    const nextDark = document.documentElement.classList.contains('dark');
    expect(nextDark).toBe(!initialDark);
  });
});
