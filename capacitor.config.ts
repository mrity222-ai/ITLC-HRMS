import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itlc.hrms',
  appName: 'ITLC HRMS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
