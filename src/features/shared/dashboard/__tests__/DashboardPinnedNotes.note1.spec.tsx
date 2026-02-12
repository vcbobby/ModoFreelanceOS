import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardPinnedNotes } from '..';

// Mock firestore onSnapshot to return a single note
vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: () => {},
  query: () => {},
  where: () => {},
  onSnapshot: (_q: unknown, cb: (snap: { docs: Array<{ id: string; data: () => unknown }> }) => void) => {
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
    });
    return () => {};
  },
  doc: () => {},
  updateDoc: () => Promise.resolve(),
}));
vi.mock('@config/firebase', () => ({ db: {} }));

describe('DashboardPinnedNotes - simple', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('renders pinned note title and content preview', () => {
    render(<DashboardPinnedNotes userId={'user123'} onGoToNotes={() => {}} />);
    expect(screen.getByText('Fijado')).toBeInTheDocument();
    expect(screen.getByText('Note 1')).toBeInTheDocument();
  });
});
