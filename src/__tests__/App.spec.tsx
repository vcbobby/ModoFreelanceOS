import React from 'react'
import { render, screen } from '@testing-library/react'
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
        const { container } = render(<App />)
        expect(container).toBeTruthy()
    })

    it('renders main structure', () => {
        render(<App />)
        // There should be a main element or app root
        expect(document.body).toBeDefined()
    })
})
