import { createFirebaseAdapters } from '@/services/firebase/firebaseAdapter';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => () => {}),
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'docRef'),
  getDoc: vi.fn(async () => ({
    exists: () => true,
    data: () => ({ displayName: 'Test' }),
  })),
  setDoc: vi.fn(async () => undefined),
  updateDoc: vi.fn(async () => undefined),
}));

vi.mock('@config/firebase', () => ({ auth: {}, db: {} }));

describe('firebaseAdapter', () => {
  it('reads user document', async () => {
    const adapters = createFirebaseAdapters({
      auth: {} as Auth,
      db: {} as Firestore,
    });

    const result = await adapters.users.getUserDoc('uid');
    expect(result.exists).toBe(true);
  });
});
