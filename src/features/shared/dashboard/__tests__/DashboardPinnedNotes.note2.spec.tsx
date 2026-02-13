import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { DashboardPinnedNotes } from '..';

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: () => {},
  query: () => {},
  where: () => {},
  onSnapshot: (_q: unknown, cb: (snap: { docs: Array<{ id: string; data: () => unknown }> }) => void) => {
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
    });
    return () => {};
  },
  doc: () => {},
  updateDoc: () => Promise.resolve(),
}));
vi.mock('@config/firebase', () => ({ db: {} }));

describe('DashboardPinnedNotes - checkbox interactions', () => {
  it('renders checkbox line in preview', async () => {
    await act(async () => {
      render(<DashboardPinnedNotes userId={'user123'} onGoToNotes={() => {}} />);
    });

    expect(await screen.findByText(/Tarea/i)).toBeInTheDocument();
  });
});
