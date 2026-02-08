import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegalModal } from '..';

describe('LegalModal', () => {
  it('renders content and closes on button click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <LegalModal isOpen={true} onClose={onClose} title="Privacidad" content={'Hola\nContenido'} />
    );

    expect(screen.getByText('Privacidad')).toBeInTheDocument();
    expect(screen.getByText('Hola')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Entendido/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
