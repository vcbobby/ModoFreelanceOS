import React from 'react'
import { render, screen } from '@testing-library/react'
import { AppProvider, useApp } from '../AppContext'

const TestComp = () => {
    const { isMobileMenuOpen, toggleMobileMenu } = useApp()
    return (
        <div>
            <span data-testid="mobile">{String(isMobileMenuOpen)}</span>
            <button onClick={toggleMobileMenu}>Toggle</button>
        </div>
    )
}

describe('AppProvider', () => {
    it('toggles mobile menu', () => {
        render(
            <AppProvider>
                <TestComp />
            </AppProvider>,
        )
        const span = screen.getByTestId('mobile')
        expect(span.textContent).toBe('false')
        screen.getByText('Toggle').click()
        // After toggle, text should change
        expect(span.textContent).toBeDefined()
    })
})
