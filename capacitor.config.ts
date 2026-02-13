import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modofreelanceos.app',
  appName: 'ModoFreelanceOS',
  webDir: 'dist',
  // NOTE: server.url is commented out for production builds
  // Only use server.url for development/testing with live reload
  // For production, the app loads from local bundled assets
  // server: {
  //     url: 'https://app.modofreelanceos.com',
  //     cleartext: true,
  //     androidScheme: 'https',
  // },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '878800083110-lndjbjiu0buaab5gmuiataiqckop9hvu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  android: {
    overrideUserAgent: 'Mozilla/5.0 Google',
  },
};

export default config;
