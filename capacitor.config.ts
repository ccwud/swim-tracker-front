import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swimtracker.app',
  appName: 'Swim Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
