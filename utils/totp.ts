import { TOTP, Secret } from 'otpauth';
import * as SecureStore from 'expo-secure-store';

const TOTP_SECRET_KEY = 'mitugym_totp_secret';
const TOTP_ISSUER = 'MituGym';

/**
 * TOTP Configuration
 * - Algorithm: SHA1 (RFC 6238 standard)
 * - Digits: 6
 * - Period: 30 seconds
 * - Secret: 160-bit Base32-encoded
 */
export interface TOTPConfig {
  secret: string;
  memberId: string;
}

/**
 * Generate a TOTP code for the current time
 */
export function generateTOTPCode(secret: string): string {
  try {
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: 'member',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    });

    return totp.generate();
  } catch (error) {
    console.error('Error generating TOTP code:', error);
    throw error;
  }
}

/**
 * Get the time remaining until the next TOTP code refresh (in seconds)
 */
export function getTOTPTimeRemaining(): number {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  return timeStep - (now % timeStep);
}

/**
 * Store TOTP secret securely
 */
export async function storeTOTPSecret(secret: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOTP_SECRET_KEY, secret);
  } catch (error) {
    console.error('Error storing TOTP secret:', error);
    throw error;
  }
}

/**
 * Retrieve TOTP secret from secure storage
 */
export async function getTOTPSecret(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOTP_SECRET_KEY);
  } catch (error) {
    console.error('Error retrieving TOTP secret:', error);
    return null;
  }
}

/**
 * Remove TOTP secret from secure storage
 */
export async function removeTOTPSecret(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOTP_SECRET_KEY);
  } catch (error) {
    console.error('Error removing TOTP secret:', error);
    throw error;
  }
}

/**
 * Setup TOTP for a member by fetching the secret from the API
 * Tries multiple connection strategies for different environments
 */
export async function setupTOTP(memberId: string, apiKey: string, apiUrl: string): Promise<string> {
  // Clear any cached secret first to ensure we get the latest from database
  try {
    await removeTOTPSecret();
  } catch (error) {
    // Ignore errors when removing (might not exist)
  }

  // Try different URLs based on platform
  const urlsToTry = [
    apiUrl, // Original URL from env
    apiUrl.replace('172.21.192.1', 'localhost'), // Try localhost
    apiUrl.replace('172.21.192.1', '10.0.2.2'), // Android emulator
  ];

  let lastError: Error | null = null;

  for (const url of urlsToTry) {
    try {
      // Create abort controller for timeout (10 seconds per attempt)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${url}/api/member/totp-setup/${memberId}?api_key=${apiKey}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup TOTP');
      }

      const data = await response.json();
      const secret = data.data?.totp_secret || data.totp_secret;

      if (!secret) {
        throw new Error('No TOTP secret returned from API');
      }

      // Store the fresh secret securely
      await storeTOTPSecret(secret);

      return secret;
    } catch (error: any) {
      lastError = error;
      // Try next URL
      continue;
    }
  }

  // All attempts failed
  console.error('❌ All connection attempts failed. Tried:', urlsToTry);
  throw lastError || new Error('Failed to setup TOTP: All connection attempts failed');
}

/**
 * Generate QR code content in the format: member_id:totp_code
 */
export function generateQRContent(memberId: string, totpCode: string): string {
  return `${memberId}:${totpCode}`;
}

/**
 * Format a TOTP code with spaces for better readability
 * Example: "123456" -> "123 456"
 */
export function formatTOTPCode(code: string): string {
  if (code.length === 6) {
    return `${code.substring(0, 3)} ${code.substring(3)}`;
  }
  return code;
}

