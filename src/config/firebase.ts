// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Lee la configuración de Firebase desde variables de entorno Vite.
// Estas variables deben definirse en un archivo .env local y no subirse al repo.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey) {
    console.warn(
        'VITE_FIREBASE_API_KEY no configurada. Firebase puede fallar si no se establecen las variables de entorno.',
    )
}

const app = initializeApp(firebaseConfig as any)
export const auth = getAuth(app)
export const db = getFirestore(app)
