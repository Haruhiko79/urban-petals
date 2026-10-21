import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urbanpetals.app',
  appName: 'Urban Petals',
  webDir: 'www',
  plugins: {
    SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover', style: 'LIGHT' },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#e7e0d1',
      showSpinner: false
    }
  }
};

export default config;
