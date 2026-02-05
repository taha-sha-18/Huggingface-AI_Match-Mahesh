// Dynamic Expo configuration
// This file ensures environment variables are properly bundled into production builds

const IS_DEV = process.env.APP_VARIANT === 'development';

// Get the backend URL from environment or use production default
const getBackendUrl = () => {
  // Priority order:
  // 1. EXPO_PUBLIC_BACKEND_URL from .env (development)
  // 2. Production URL (for built APKs)
  
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  
  // Production fallback - this is the deployed backend URL
  // IMPORTANT: Update this URL when deploying to production
  return 'https://embed-match.preview.emergentagent.com';
};

export default {
  expo: {
    name: 'AI Community Matcher',
    slug: 'frontend',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'aicommunity',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    
    // Extra configuration available at runtime via Constants.expoConfig.extra
    extra: {
      backendUrl: getBackendUrl(),
      // Add EAS configuration
      eas: {
        projectId: 'ai-community-matcher'
      }
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.aicommunity.matcher'
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#000'
      },
      edgeToEdgeEnabled: true,
      package: 'com.aicommunity.matcher',
      versionCode: 2,
      // CRITICAL: Allow cleartext (HTTP) traffic for development
      // Set to false for production with HTTPS only
      usesCleartextTraffic: true,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ]
    },
    
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#000'
        }
      ]
    ],
    
    experiments: {
      typedRoutes: true
    }
  }
};
