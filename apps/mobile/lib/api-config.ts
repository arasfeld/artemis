import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API Configuration for Artemis Mobile App
 *
 * This module provides the API base URL for connecting to the NestJS backend.
 *
 * For local development with Expo Go:
 * - Set EXPO_PUBLIC_API_URL in your .env file to your tunnel URL
 * - Example: EXPO_PUBLIC_API_URL=https://artemis-dev.loca.lt
 *
 * For simulators/emulators (without tunnel):
 * - iOS Simulator: Uses http://localhost:4000
 * - Android Emulator: Uses http://10.0.2.2:4000 (Android's localhost alias)
 *
 * For production/EAS builds:
 * - Set EXPO_PUBLIC_API_URL in your build configuration
 */

const API_PORT = 4000;

/**
 * Determines if we're running in Expo Go on a physical device
 * Physical devices cannot access localhost - they need a tunnel URL
 */
function isExpoGoOnDevice(): boolean {
  // Check if we're in Expo Go (not a standalone build)
  const isExpoGo = Constants.appOwnership === 'expo';

  // In Expo Go, check if we're NOT on a simulator
  // Constants.isDevice is true for physical devices, false for simulators
  const isPhysicalDevice = Constants.isDevice;

  return isExpoGo && isPhysicalDevice;
}

/**
 * Gets the appropriate API host for the current environment
 */
function getApiHost(): string {
  // First, check for explicit API URL from environment
  // EXPO_PUBLIC_ prefix makes it available to the client bundle
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Warn if on physical device without tunnel URL
  if (isExpoGoOnDevice()) {
    console.warn(
      '[API Config] Running on physical device without EXPO_PUBLIC_API_URL set.\n' +
        'The app will not be able to connect to your local server.\n' +
        'Please start the tunnel: pnpm dev:tunnel\n' +
        'Then set EXPO_PUBLIC_API_URL in apps/mobile/.env',
    );
  }

  // Platform-specific localhost for simulators/emulators
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return `http://10.0.2.2:${API_PORT}`;
  }

  // iOS Simulator and web can use localhost directly
  return `http://localhost:${API_PORT}`;
}

/**
 * The base URL for API requests
 * Automatically configured based on environment and platform
 */
export const API_BASE_URL = getApiHost();

/**
 * Check if the current API URL is a tunnel URL (HTTPS external)
 * Useful for debugging and conditional behavior
 */
export function isTunnelUrl(): boolean {
  return API_BASE_URL.startsWith('https://') && !API_BASE_URL.includes('localhost');
}

/**
 * Log the current API configuration (for debugging)
 */
export function logApiConfig(): void {
  console.log('[API Config]', {
    API_BASE_URL,
    isTunnel: isTunnelUrl(),
    platform: Platform.OS,
    isExpoGo: Constants.appOwnership === 'expo',
    isDevice: Constants.isDevice,
  });
}
