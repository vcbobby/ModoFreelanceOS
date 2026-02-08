import React from 'react';
import { render, screen } from '@testing-library/react';
// Using fireEvent instead of user-event to avoid extra dependency
import userEvent from '@testing-library/user-event';
import { SupportWidget } from '../SupportWidget';

describe('SupportWidget', () => {
  it('opens widget and switches tabs', async () => {
    const user = userEvent.setup();
    render(<SupportWidget />);

    // Widget is closed at start; click floating button
    const floating = screen.getByRole('button');
    await user.click(floating);

    // Now the help center should render a tab button 'Preguntas'
    expect(screen.getByText('Preguntas')).toBeInTheDocument();

    // Switch to Support tab and click first option (mock window.open)
    await user.click(screen.getByText('Soporte'));
    const originalOpen = window.open;
    window.open = vi.fn() as any;
    await user.click(screen.getByText('Reportar un error técnico'));
    expect(window.open).toHaveBeenCalled();
    window.open = originalOpen;
  });
});
