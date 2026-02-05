import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

const TestComponent = () => {
    const { theme, toggleTheme } = useTheme()
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <button onClick={toggleTheme}>Toggle</button>
        </div>
    )
}

describe('ThemeProvider', () => {
    it('toggles theme and updates documentElement class', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        const themeSpan = screen.getByTestId('theme')
        expect(themeSpan.textContent).toMatch(/light|dark/)

        // Toggle
        const btn = screen.getByText('Toggle')
        btn.click()
        // Document class should reflect theme toggle
        expect(
            document.documentElement.classList.contains('dark'),
        ).toBeDefined()
    })
})
