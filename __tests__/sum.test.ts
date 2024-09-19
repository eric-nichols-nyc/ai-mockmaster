function sum(a: number, b: number): number {
  return a + b;
}

describe('sum function', () => {
  it('should add two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(5, 5)).toBe(10);
  });
});
