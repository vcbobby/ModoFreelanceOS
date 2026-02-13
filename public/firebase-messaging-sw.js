// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (Debes copiarla de tu consola de Firebase)
// Estos valores son públicos.
const firebaseConfig = {
    apiKey: "AIzaSyBiutbiDvvAhdZJd_-aKUeGrtRWAie4lkk",
    authDomain: "modofreelanceos.firebaseapp.com",
    projectId: "modofreelanceos",
    storageBucket: "modofreelanceos.firebasestorage.app",
    messagingSenderId: "878800083110",
    appId: "1:878800083110:web:d39ce238fc0185772d3c67"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handler para notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
