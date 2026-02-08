// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, ConfirmationModal } from '..';

describe('UI components', () => {
  it('Button shows children and handles loading state', () => {
    render(<Button isLoading>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeDisabled();
    // loader has class animate-spin
    const loader = btn.querySelector('.animate-spin');
    expect(loader).toBeTruthy();
  });

  it('ConfirmationModal shows title and message and handles buttons', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Eliminar"
        message="¿Estás seguro?"
        confirmText="Sí"
        cancelText="No"
        isDanger
      />
    );

    expect(screen.getByText('Eliminar')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /no/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole('button', { name: /sí/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    // confirm also calls onClose
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
