import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { SecureStorage } from './secureStorage';

export type BiometricType = 'FINGERPRINT' | 'FACIAL_RECOGNITION' | 'IRIS' | 'UNKNOWN';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

/**
 * Check if biometric authentication is available on the device
 * Returns true if device has hardware AND user has enrolled biometrics
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      console.log('BiometricAuth: Device does not have biometric hardware');
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log('BiometricAuth: No biometrics enrolled on device');
      return false;
    }

    console.log('BiometricAuth: Biometric authentication is available');
    return true;
  } catch (error) {
    console.error('BiometricAuth: Error checking availability:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available on the device
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'FACIAL_RECOGNITION';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'FINGERPRINT';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'IRIS';
    }

    return 'UNKNOWN';
  } catch (error) {
    console.error('BiometricAuth: Error getting biometric type:', error);
    return 'UNKNOWN';
  }
}

/**
 * Get a user-friendly name for the biometric type
 * Returns 'Face ID', 'Fingerprint', 'Iris', or 'Biometric'
 */
export async function getBiometricTypeName(): Promise<string> {
  const type = await getBiometricType();

  switch (type) {
    case 'FACIAL_RECOGNITION':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'FINGERPRINT':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'IRIS':
      return 'Iris';
    default:
      return 'Biometric';
  }
}

/**
 * Authenticate user with biometrics
 * @param promptMessage - Custom message to show in the biometric prompt
 * @returns BiometricAuthResult with success status and error if failed
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to continue',
): Promise<BiometricAuthResult> {
  try {
    // Check if biometric is available first
    const available = await isBiometricAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    // Get biometric type for result
    const biometricType = await getBiometricType();

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false, // Allow device passcode as fallback on iOS
    });

    if (result.success) {
      console.log('BiometricAuth: Authentication successful');
      return {
        success: true,
        biometricType,
      };
    }

    // Handle different error types
    let errorMessage = 'Authentication failed';
    if (result.error === 'user_cancel') {
      errorMessage = 'Authentication cancelled by user';
    } else if (result.error === 'system_cancel') {
      errorMessage = 'Authentication cancelled by system';
    } else if (result.error === 'lockout') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (result.error === 'not_enrolled') {
      errorMessage = 'No biometrics enrolled on device';
    }

    console.log('BiometricAuth: Authentication failed:', result.error);
    return {
      success: false,
      error: errorMessage,
      biometricType,
    };
  } catch (error: any) {
    console.error('BiometricAuth: Error during authentication:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Check if biometric authentication should be prompted
 * Takes into account if it's enabled, available, and not recently failed
 */
export async function shouldPromptBiometric(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    const enabled = await SecureStorage.isBiometricEnabled(userId);
    if (!enabled) {
      return false;
    }

    const available = await isBiometricAvailable();
    if (!available) {
      return false;
    }

    const hasCredentials = await SecureStorage.hasBiometricCredentials(userId);
    if (!hasCredentials) {
      return false;
    }

    // Check if authentication failed recently (within last 5 minutes) for this user
    const lastFailed = await SecureStorage.getLastBiometricFailTime(userId);
    if (lastFailed) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (lastFailed > fiveMinutesAgo) {
        console.log('BiometricAuth: Skipping auto-prompt due to recent failure');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('BiometricAuth: Error checking if should prompt:', error);
    return false;
  }
}

/**
 * Record a failed biometric authentication attempt for a specific user
 */
export async function recordBiometricFailure(userId: string): Promise<void> {
  try {
    if (!userId) {
      return;
    }
    await SecureStorage.setLastBiometricFailTime(userId, Date.now());
  } catch (error) {
    console.error('BiometricAuth: Error recording failure:', error);
  }
}

/**
 * Clear the last biometric failure timestamp for a specific user
 */
export async function clearBiometricFailure(userId: string): Promise<void> {
  try {
    if (!userId) {
      return;
    }
    await SecureStorage.clearLastBiometricFailTime(userId);
  } catch (error) {
    console.error('BiometricAuth: Error clearing failure:', error);
  }
}
