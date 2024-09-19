import { calculateScore } from '@/lib/utils';

describe('calculateScore', () => {
  it('should return 0 for an empty string', () => {
    expect(calculateScore('')).toBe(0);
  });

  it('should return 0 for a string with only whitespace', () => {
    expect(calculateScore('   ')).toBe(0);
  });

  it('should calculate the score correctly for a non-empty string', () => {
    expect(calculateScore('Hello, world!')).toBe(13);
  });

  it('should handle strings with special characters', () => {
    expect(calculateScore('Hello, world! 123 @#$')).toBe(20);
  });
});
