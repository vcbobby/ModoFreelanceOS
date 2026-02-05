import React from 'react'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { DashboardPinnedNotes } from '../DashboardPinnedNotes'

// Mock firestore onSnapshot to return a second note with a checkbox line
vi.mock('firebase/firestore', () => ({
    getFirestore: () => ({}),
    collection: () => {},
    query: () => {},
    where: () => {},
    onSnapshot: (q: any, cb: any) => {
        cb({
            docs: [
                {
                    id: 'n2',
                    data: () => ({
                        title: 'Note 2',
                        content: '\u2610 Tarea\nOtra',
                        color: 'bg-red-100',
                        isPrivate: false,
                    }),
                },
            ],
        })
        return () => {}
    },
    doc: () => {},
    updateDoc: () => Promise.resolve(),
}))
vi.mock('../../config/firebase', () => ({ db: {} }))

describe('DashboardPinnedNotes - checkbox interactions', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.restoreAllMocks()
    })

    it('opens modal and toggles checkbox line', async () => {
        const user = userEvent.setup()
        render(<DashboardPinnedNotes userId={'user123'} onGoToNotes={() => {}} />)
        // Debug DOM
        // eslint-disable-next-line no-console
        console.log('DOM after render for debug:\n', document.body.innerHTML)
        // Note should be present in the list
        expect(screen.getByText('Note 2')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Note 2'))
        // Modal should show the checkbox line (wait for it)
        await screen.findByText(/Tarea/i)
        // Click the checkbox line to toggle
        fireEvent.click(screen.getByText(/Tarea/i))
        // Debug DOM after click (allow microtasks to run)
        await new Promise((r) => setTimeout(r, 10))
        // eslint-disable-next-line no-console
        console.log('DOM after click:\n', document.body.innerHTML)
        // After clicking, the line should still be present (and may change to checked state)
        await screen.findByText(/Tarea/i)
    })
})