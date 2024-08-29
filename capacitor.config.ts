import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leparks.visitor',
  appName: 'visitor-frontend',
  webDir: 'dist/apps/visitor-frontend', // added by Mic
  bundledWebRuntime: false, // added by Mic
};

export default config;
