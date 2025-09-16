import { mockClasses } from '../lib/mock';
import { getLevelColor, getSpotsLeftText } from '../lib/utils';

describe('Class Utilities', () => {
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

  it('mock classes data is valid', () => {
    expect(mockClasses).toBeDefined();
    expect(mockClasses.length).toBeGreaterThan(0);

    const firstClass = mockClasses[0];
    expect(firstClass?.id).toBeDefined();
    expect(firstClass?.title).toBeDefined();
    expect(firstClass?.trainer).toBeDefined();
    expect(firstClass?.level).toMatch(/^(Beginner|Intermediate|Advanced)$/);
  });

  it('class has valid spots configuration', () => {
    const classWithSpots = mockClasses.find(cls => cls.spotsLeft > 0);
    expect(classWithSpots).toBeDefined();
    expect(classWithSpots?.spotsLeft).toBeLessThanOrEqual(classWithSpots?.spots || 0);
  });
});
