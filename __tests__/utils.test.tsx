import {
  formatCountdown,
  getCountdownColor,
  isToday,
  isTomorrow,
  formatRelativeDate,
  formatTime12Hour,
  getMembershipStatusColor,
  getDaysLeftText,
  getVisitsLeftText,
  getLevelColor,
  getSpotsLeftText,
  isValidEmail,
  isValidPhone,
  formatPrice,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('formatCountdown', () => {
    it('formats seconds to MM:SS format', () => {
      expect(formatCountdown(65)).toBe('1:05');
      expect(formatCountdown(30)).toBe('0:30');
      expect(formatCountdown(0)).toBe('0:00');
      expect(formatCountdown(3661)).toBe('61:01');
    });
  });

  describe('getCountdownColor', () => {
    it('returns correct colors based on time remaining', () => {
      expect(getCountdownColor(5)).toBe('#e74c3c'); // error red
      expect(getCountdownColor(20)).toBe('#f1c40f'); // warning yellow
      expect(getCountdownColor(45)).toBe('#1e9b71'); // primary green
    });
  });

  describe('Date functions', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    it('correctly identifies today', () => {
      expect(isToday(today.toISOString())).toBe(true);
      expect(isToday(tomorrow.toISOString())).toBe(false);
    });

    it('correctly identifies tomorrow', () => {
      expect(isTomorrow(tomorrow.toISOString())).toBe(true);
      expect(isTomorrow(today.toISOString())).toBe(false);
    });

    it('formats relative dates correctly', () => {
      expect(formatRelativeDate(today.toISOString())).toBe('Today');
      expect(formatRelativeDate(tomorrow.toISOString())).toBe('Tomorrow');
    });
  });

  describe('formatTime12Hour', () => {
    it('formats time to 12-hour format', () => {
      const date = new Date('2024-09-17T14:30:00Z');
      const formatted = formatTime12Hour(date.toISOString());
      // Note: This will depend on the user's locale, but should contain time info
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Membership functions', () => {
    it('returns correct membership status colors', () => {
      expect(getMembershipStatusColor('active')).toBe('#2ecc71');
      expect(getMembershipStatusColor('expired')).toBe('#e74c3c');
    });

    it('formats days left text correctly', () => {
      expect(getDaysLeftText(5)).toBe('5 days left');
      expect(getDaysLeftText(1)).toBe('1 day left');
      expect(getDaysLeftText(0)).toBe('Expired');
      expect(getDaysLeftText(undefined)).toBe('Expired');
    });

    it('formats visits left text correctly', () => {
      expect(getVisitsLeftText(5)).toBe('5 visits left');
      expect(getVisitsLeftText(1)).toBe('1 visit left');
      expect(getVisitsLeftText(0)).toBe('No visits left');
      expect(getVisitsLeftText(undefined)).toBe('No visits left');
    });
  });

  describe('Class functions', () => {
    it('returns correct level colors', () => {
      expect(getLevelColor('Beginner')).toBe('#2ecc71');
      expect(getLevelColor('Intermediate')).toBe('#f1c40f');
      expect(getLevelColor('Advanced')).toBe('#e74c3c');
    });

    it('formats spots left text correctly', () => {
      expect(getSpotsLeftText(0)).toBe('Full');
      expect(getSpotsLeftText(1)).toBe('1 spot left');
      expect(getSpotsLeftText(3)).toBe('3 spots left');
      expect(getSpotsLeftText(10)).toBe('10 available');
    });
  });

  describe('Validation functions', () => {
    it('validates email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('validates phone numbers correctly', () => {
      expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
      expect(isValidPhone('555-123-4567')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('formats prices correctly', () => {
      expect(formatPrice(49.99)).toBe('$49.99');
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(0)).toBe('$0.00');
    });
  });
});
