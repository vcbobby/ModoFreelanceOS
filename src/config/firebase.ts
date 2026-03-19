// src/firebase.ts
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// Lee la configuración de Firebase desde variables de entorno Vite.
// Estas variables deben definirse en un archivo .env local y no subirse al repo.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn(
    'VITE_FIREBASE_API_KEY no configurada. Firebase puede fallar si no se establecen las variables de entorno.'
  );
}

const app = initializeApp(firebaseConfig as FirebaseOptions);
export const auth = getAuth(app);

// Forzar la persistencia local solo en entornos de escritorio (Electron)
// Para Android (Capacitor) dejamos que Firebase use su comportamiento por defecto (que es IndexedDB)
if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/')) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error al configurar la persistencia de sesión:', error);
  });
}

export const db = getFirestore(app);
export const messaging = getMessaging(app);
