import { describe, it, expect } from 'vitest';
import { calculateETA, calculateThroughput, calculateAverage, calculateMax, calculateMin } from '../../utils/calculations';

describe('calculations', () => {
  describe('calculateETA', () => {
    it('should calculate ETA correctly', () => {
      const eta = calculateETA(50, 10);
      expect(eta).toBeGreaterThan(0);
      expect(eta).toBeLessThan(20);
    });

    it('should return 0 for completed progress', () => {
      expect(calculateETA(100, 10)).toBe(0);
    });
  });

  describe('calculateThroughput', () => {
    it('should calculate throughput correctly', () => {
      expect(calculateThroughput(1000, 10)).toBe(100);
      expect(calculateThroughput(0, 10)).toBe(0);
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([])).toBe(0);
    });
  });

  describe('calculateMax', () => {
    it('should find maximum value', () => {
      expect(calculateMax([1, 5, 3, 9, 2])).toBe(9);
      expect(calculateMax([])).toBe(0);
    });
  });

  describe('calculateMin', () => {
    it('should find minimum value', () => {
      expect(calculateMin([5, 1, 9, 3, 2])).toBe(1);
      expect(calculateMin([])).toBe(0);
    });
  });
});
