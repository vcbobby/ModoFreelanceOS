import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'

import { Analytics } from '@vercel/analytics/react'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = ReactDOM.createRoot(rootElement)
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <Analytics />
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
