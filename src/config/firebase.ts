// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE (La que copiaste de la consola)
const firebaseConfig = {
    apiKey: 'AIzaSyBiutbiDvvAhdZJd_-aKUeGrtRWAie4lkk',
    authDomain: 'modofreelanceos.firebaseapp.com',
    projectId: 'modofreelanceos',
    storageBucket: 'modofreelanceos.firebasestorage.app',
    messagingSenderId: '878800083110',
    appId: '1:878800083110:web:d39ce238fc0185772d3c67',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
