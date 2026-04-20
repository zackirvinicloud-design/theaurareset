import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.gutbrain.journal',
  appName: 'Gut Brain Journal',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
};

export default config;
