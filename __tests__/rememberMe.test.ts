import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '../utils/secureStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Remember Me Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('SecureStorage', () => {
    it('should store remember me data correctly', async () => {
      const email = 'test@example.com';
      const sessionToken = 'mock-session-token';

      await SecureStorage.storeRememberMeData(email, sessionToken);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@mitugym_remember_me',
        expect.stringContaining(email.toLowerCase()),
      );
    });

    it('should validate email format when storing', async () => {
      const invalidEmail = 'invalid-email';
      const sessionToken = 'mock-session-token';

      await expect(
        SecureStorage.storeRememberMeData(invalidEmail, sessionToken),
      ).rejects.toThrow('Invalid email format');
    });

    it('should normalize email to lowercase', async () => {
      const email = 'TEST@EXAMPLE.COM';
      const sessionToken = 'mock-session-token';

      await SecureStorage.storeRememberMeData(email, sessionToken);

      const storedDataCall = mockAsyncStorage.setItem.mock.calls[0];
      expect(storedDataCall).toBeDefined();
      const storedData = JSON.parse(storedDataCall![1]);

      expect(storedData.email).toBe('test@example.com');
    });

    it('should return null for expired data', async () => {
      const pastTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      const expiredData = {
        email: 'test@example.com',
        sessionToken: 'token',
        timestamp: pastTimestamp,
        expiresAt: pastTimestamp + (30 * 24 * 60 * 60 * 1000), // Expired
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(expiredData));

      const result = await SecureStorage.getRememberMeData();
      expect(result).toBeNull();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should return valid data when not expired', async () => {
      const currentTimestamp = Date.now();
      const validData = {
        email: 'test@example.com',
        sessionToken: 'valid-token',
        timestamp: currentTimestamp,
        expiresAt: currentTimestamp + (30 * 24 * 60 * 60 * 1000), // Future expiry
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(validData));

      const result = await SecureStorage.getRememberMeData();
      expect(result).toEqual(validData);
    });

    it('should clear corrupted data', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid-json');

      const result = await SecureStorage.getRememberMeData();
      expect(result).toBeNull();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should validate required fields in stored data', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing sessionToken, timestamp, expiresAt
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(incompleteData));

      const result = await SecureStorage.getRememberMeData();
      expect(result).toBeNull();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should refresh remember me data expiry', async () => {
      const currentTimestamp = Date.now();
      const existingData = {
        email: 'test@example.com',
        sessionToken: 'token',
        timestamp: currentTimestamp - 1000,
        expiresAt: currentTimestamp + 1000,
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingData));

      await SecureStorage.refreshRememberMeData();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@mitugym_remember_me',
        expect.stringContaining('test@example.com'),
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(
        SecureStorage.storeRememberMeData('test@example.com', 'token'),
      ).rejects.toThrow('Storage error');
    });
  });
});
