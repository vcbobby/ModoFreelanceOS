import React from 'react'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'
import { ThemeProvider } from '../context/ThemeContext'
import App from '../App'

describe('App with providers', () => {
    it('renders app inside providers without crashing', () => {
        const { container } = render(
            <ThemeProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </ThemeProvider>,
        )

        expect(container).toBeTruthy()
    })
})
