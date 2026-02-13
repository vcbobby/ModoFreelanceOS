import { Auth, User, onAuthStateChanged, signOut } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@config/firebase';

export interface FirebaseUserDocument {
  email?: string | null;
  displayName?: string;
  phoneNumber?: string;
  fcmTokens?: string[];
  credits?: number;
  isSubscribed?: boolean;
  subscriptionEnd?: number | null;
  lastReset?: number;
  createdAt?: string;
  signupPlatform?: string;
}

export interface FirebaseAdapters {
  auth: {
    onAuthStateChanged: (
      callback: (user: User | null) => void
    ) => () => void;
    signOut: () => Promise<void>;
  };
  users: {
    getUserDoc: (uid: string) => Promise<{ exists: boolean; data?: FirebaseUserDocument }>;
    setUserDoc: (uid: string, data: FirebaseUserDocument) => Promise<void>;
    updateUserDoc: (uid: string, data: Partial<FirebaseUserDocument>) => Promise<void>;
  };
}

export const createFirebaseAdapters = (deps: { auth: Auth; db: Firestore }): FirebaseAdapters => {
  return {
    auth: {
      onAuthStateChanged: (callback) => onAuthStateChanged(deps.auth, callback),
      signOut: () => signOut(deps.auth),
    },
    users: {
      getUserDoc: async (uid) => {
        const docRef = doc(deps.db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return {
          exists: docSnap.exists(),
          data: docSnap.exists() ? (docSnap.data() as FirebaseUserDocument) : undefined,
        };
      },
      setUserDoc: async (uid, data) => {
        const docRef = doc(deps.db, 'users', uid);
        await setDoc(docRef, data);
      },
      updateUserDoc: async (uid, data) => {
        const docRef = doc(deps.db, 'users', uid);
        await updateDoc(docRef, data);
      },
    },
  };
};

export const firebaseAdapters = createFirebaseAdapters({ auth, db });
