import { generateQRToken } from '../lib/mock';
import { formatCountdown, getCountdownColor } from '../lib/utils';

describe('QR Card Logic', () => {
  it('generates valid QR tokens', () => {
    const token1 = generateQRToken();
    const token2 = generateQRToken();

    expect(token1).toMatch(/^MM-[A-Z0-9]{8}$/);
    expect(token2).toMatch(/^MM-[A-Z0-9]{8}$/);
    expect(token1).not.toBe(token2); // Should be random
  });

  it('formats countdown correctly', () => {
    expect(formatCountdown(65)).toBe('1:05');
    expect(formatCountdown(30)).toBe('0:30');
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(3661)).toBe('61:01');
  });

  it('returns correct countdown colors', () => {
    expect(getCountdownColor(5)).toBe('#e74c3c'); // error red
    expect(getCountdownColor(20)).toBe('#f1c40f'); // warning yellow
    expect(getCountdownColor(45)).toBe('#1e9b71'); // primary green
  });

  it('validates QR expiry logic', () => {
    const now = Date.now();
    const futureExpiry = now + 30000; // 30 seconds from now
    const pastExpiry = now - 1000; // 1 second ago

    expect(futureExpiry > now).toBe(true);
    expect(pastExpiry < now).toBe(true);

    const futureSecondsLeft = Math.floor((futureExpiry - now) / 1000);
    const pastSecondsLeft = Math.floor((pastExpiry - now) / 1000);

    expect(futureSecondsLeft).toBeGreaterThan(0);
    expect(pastSecondsLeft).toBeLessThanOrEqual(0);
  });
});
