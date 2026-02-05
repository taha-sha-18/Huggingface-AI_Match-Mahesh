# APK Build & Network Configuration Guide

## Overview

This document explains how the app handles network configuration for different build types (Expo Go vs. standalone APK) and how to test/debug network issues.

## The Problem

When building an APK, environment variables (like `EXPO_PUBLIC_BACKEND_URL`) are NOT automatically bundled into the build. This causes the app to fail when trying to connect to the backend because:

1. **Expo Go** (development): Metro bundler injects environment variables at runtime ✅
2. **Standalone APK** (production): Environment variables are not available at runtime ❌

## The Solution

We use `app.config.js` (dynamic configuration) instead of `app.json` (static configuration) to:

1. Read environment variables at **build time**
2. Embed them into `Constants.expoConfig.extra`
3. Provide a hardcoded fallback URL for production builds

### Configuration Files Changed

| File | Purpose |
|------|---------|
| `app.config.js` | Dynamic Expo config with embedded backend URL |
| `src/utils/api.ts` | API client with URL resolution logic |
| `app/debug.tsx` | Network debug screen for troubleshooting |

## How It Works

```javascript
// In src/utils/api.ts
const getBackendUrl = (): string => {
  // Priority 1: From app.config.js (works in production APKs)
  const configUrl = Constants.expoConfig?.extra?.backendUrl;
  if (configUrl) return configUrl;
  
  // Priority 2: From .env (works in Expo Go)
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl;
  
  // Priority 3: Hardcoded fallback (last resort)
  return 'https://embed-match.preview.emergentagent.com';
};
```

## Building a New APK

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into Expo: `eas login`

### Build Commands

```bash
# Development build (for testing)
eas build --platform android --profile development

# Preview build (for internal testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### Updating the Backend URL for Production

If deploying to a different backend, update `app.config.js`:

```javascript
// In app.config.js
const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  // UPDATE THIS URL for your production deployment
  return 'https://your-production-api.com';
};
```

## Testing the APK

### Pre-Flight Checklist

1. **Verify backend is reachable** from the device's network:
   ```bash
   curl https://embed-match.preview.emergentagent.com/api/health
   # Expected: {"status":"healthy","huggingface_configured":true}
   ```

2. **Check Android cleartext traffic** (if using HTTP):
   - `app.config.js` has `usesCleartextTraffic: true` for Android
   - Only needed for HTTP; HTTPS works by default

3. **Verify the correct URL is bundled**:
   - Install the APK
   - Open the app
   - Go to Login → "🔧 Network Debug" link
   - Check the "Backend URL" value

### Debug Screen

The app includes a built-in debug screen accessible from the login page:

1. Open the app
2. Go to the Login screen
3. Tap "🔧 Network Debug" at the bottom
4. The screen shows:
   - Current backend URL configuration
   - Whether running in Expo Go or standalone
   - Connectivity test results

### Using ADB Logcat

To capture logs from the APK:

```bash
# Connect device via USB
adb devices

# Capture all logs
adb logcat > logcat.txt

# Filter for app logs only
adb logcat | grep -E "(API|axios|fetch|network)"

# Filter for the app specifically
adb logcat | grep "com.aicommunity.matcher"
```

### Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Network request failed | Backend URL not set | Check app.config.js fallback URL |
| Cleartext HTTP not permitted | Using HTTP without cleartext enabled | Set `usesCleartextTraffic: true` or use HTTPS |
| Connection timeout | Backend unreachable | Verify backend URL and network |
| 401 Unauthorized | Token not sent | Check auth interceptor in api.ts |

## Version History

| Version | versionCode | Changes |
|---------|-------------|---------|
| 1.0.0 | 1 | Initial release |
| 1.0.1 | 2 | Fixed APK network configuration |

## Files Reference

```
frontend/
├── app.config.js          # Dynamic Expo configuration (replaces app.json)
├── src/
│   └── utils/
│       └── api.ts         # Axios client with URL resolution
├── app/
│   ├── debug.tsx          # Network debug screen
│   └── auth/
│       └── login.tsx      # Login with debug link
```

## Support

If you encounter network issues:

1. Use the debug screen to verify configuration
2. Check ADB logcat for detailed error messages
3. Verify the backend is running and accessible
4. Ensure the correct URL is configured in app.config.js
