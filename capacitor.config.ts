import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aniverse.app',
  appName: 'AniVerse',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
