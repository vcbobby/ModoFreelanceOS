import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationModal } from '../ui/NotificationModal'

describe('NotificationModal', () => {
    it('renders empty state and handles navigation click', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        const onNavigate = vi.fn()
        const notifications = [
            {
                id: '1',
                type: 'agenda',
                title: 'Test',
                message: 'msg',
                route: 'NOTES',
                severity: 'normal',
            },
        ]
        render(
            <NotificationModal
                isOpen={true}
                onClose={onClose}
                notifications={notifications as any}
                onNavigate={onNavigate}
            />,
        )

        expect(screen.getByText('Notificaciones (1)')).toBeInTheDocument()
        // click the notification
        await user.click(screen.getByText('Test'))
        expect(onNavigate).toHaveBeenCalled()
        // close via X
        await user.click(screen.getByRole('button', { name: /X/i }))
    })
})
