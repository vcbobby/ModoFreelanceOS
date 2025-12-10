import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.modofreelanceos.app',
    appName: 'ModoFreelanceOS',
    webDir: 'dist',
    server: {
        url: 'https://freelanceos-app.vercel.app',
        cleartext: true,
        androidScheme: 'https',
    },
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            clientId:
                '878800083110-lndjbjiu0buaab5gmuiataiqckop9hvu.apps.googleusercontent.com',
            forceCodeForRefreshToken: true,
        },
    },
    android: {
        overrideUserAgent: 'Mozilla/5.0 Google',
    },
}

export default config
