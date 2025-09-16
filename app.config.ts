import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'MITUGYM',
  slug: 'mitugym-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'mitugym',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0b0f0e',
  },
  assetBundlePatterns: [
    '**/*',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mitugym.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0b0f0e',
    },
    package: 'com.mitugym.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
