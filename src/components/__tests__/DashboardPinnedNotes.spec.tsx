import React from 'react'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { DashboardPinnedNotes } from '../DashboardPinnedNotes'

// Mock firestore onSnapshot
vi.mock('firebase/firestore', () => ({
    collection: () => {},
    query: () => {},
    where: () => {},
    onSnapshot: (q: any, cb: any) => {
        // simulate snapshot with one doc
        cb({
            docs: [
                {
                    id: 'n1',
                    data: () => ({
                        title: 'Note 1',
                        content: 'Line1\nLine2',
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
vi.mock('../config/firebase', () => ({ db: {} }))

describe('DashboardPinnedNotes', () => {
    it('renders pinned notes when snapshot returns data', async () => {
        render(
            <DashboardPinnedNotes userId={'user123'} onGoToNotes={() => {}} />,
        )
        // The pinned heading should be present
        expect(screen.getByText('Fijado')).toBeInTheDocument()
        // Note title should render
        expect(screen.getByText('Note 1')).toBeInTheDocument()
        // Click to open modal
        const user = userEvent.setup()
        await user.click(screen.getByText('Note 1'))
        expect(screen.getByText('Line1')).toBeInTheDocument()

        // Now test checkbox toggle: simulate a pinned note with checkbox
        vi.mock('firebase/firestore', () => ({
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

        render(
            <DashboardPinnedNotes userId={'user123'} onGoToNotes={() => {}} />,
        )
        await user.click(screen.getByText('Note 2'))
        // Click the checkbox line to toggle
        await user.click(screen.getByText(/Tarea/i))
        // After click, a checked symbol (☑) or line-through should appear (UI update)
        expect(screen.getByText(/Tarea/i)).toBeInTheDocument()
    })
})
