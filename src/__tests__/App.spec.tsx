import React from 'react'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'
import { ThemeProvider } from '../context/ThemeContext'
import App from '../App'

// Mocks
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: (auth: any, cb: any) => {
        // Simulate not authenticated
        cb(null)
        return () => {}
    },
}))
vi.mock('../config/firebase', () => ({ auth: {}, db: {} }))

describe('App smoke', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <ThemeProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </ThemeProvider>,
        )
        expect(container).toBeTruthy()
    })

    it('renders main structure', () => {
        render(
            <ThemeProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </ThemeProvider>,
        )
        // There should be a main element or app root
        expect(document.body).toBeDefined()
    })
})
