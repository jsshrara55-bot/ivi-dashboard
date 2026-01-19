import { describe, it, expect } from 'vitest';
import { calculateProjectedIvi, generateMonthlyProjections } from './db';

describe('IVI Scenarios', () => {
  describe('calculateProjectedIvi', () => {
    it('should calculate projected IVI with no adjustments', () => {
      const result = calculateProjectedIvi(50, 50, 50, 0, 0, 0);
      
      expect(result.projectedH).toBe(50);
      expect(result.projectedE).toBe(50);
      expect(result.projectedU).toBe(50);
      expect(result.projectedIvi).toBe(50);
      expect(result.riskCategory).toBe('Medium');
    });

    it('should calculate projected IVI with positive adjustments', () => {
      const result = calculateProjectedIvi(50, 50, 50, 20, 20, 20);
      
      expect(result.projectedH).toBe(60);
      expect(result.projectedE).toBe(60);
      expect(result.projectedU).toBe(60);
      expect(result.projectedIvi).toBe(60);
      expect(result.riskCategory).toBe('Medium');
    });

    it('should calculate projected IVI with negative adjustments', () => {
      const result = calculateProjectedIvi(50, 50, 50, -20, -20, -20);
      
      expect(result.projectedH).toBe(40);
      expect(result.projectedE).toBe(40);
      expect(result.projectedU).toBe(40);
      expect(result.projectedIvi).toBe(40);
      expect(result.riskCategory).toBe('Medium');
    });

    it('should return Low risk for IVI >= 70', () => {
      const result = calculateProjectedIvi(80, 80, 80, 0, 0, 0);
      
      expect(result.projectedIvi).toBe(80);
      expect(result.riskCategory).toBe('Low');
    });

    it('should return High risk for IVI < 35', () => {
      const result = calculateProjectedIvi(20, 20, 20, 0, 0, 0);
      
      expect(result.projectedIvi).toBe(20);
      expect(result.riskCategory).toBe('High');
    });

    it('should clamp values to 0-100 range', () => {
      // Test upper bound
      const resultHigh = calculateProjectedIvi(90, 90, 90, 50, 50, 50);
      expect(resultHigh.projectedH).toBe(100);
      expect(resultHigh.projectedE).toBe(100);
      expect(resultHigh.projectedU).toBe(100);
      
      // Test lower bound
      const resultLow = calculateProjectedIvi(10, 10, 10, -90, -90, -90);
      expect(resultLow.projectedH).toBe(1);
      expect(resultLow.projectedE).toBe(1);
      expect(resultLow.projectedU).toBe(1);
    });

    it('should apply IVI formula correctly (0.4*H + 0.3*E + 0.3*U)', () => {
      const result = calculateProjectedIvi(100, 50, 50, 0, 0, 0);
      
      // IVI = 0.4*100 + 0.3*50 + 0.3*50 = 40 + 15 + 15 = 70
      expect(result.projectedIvi).toBe(70);
      expect(result.riskCategory).toBe('Low');
    });

    it('should handle mixed adjustments', () => {
      const result = calculateProjectedIvi(50, 50, 50, 10, -10, 20);
      
      expect(result.projectedH).toBe(55);
      expect(result.projectedE).toBe(45);
      expect(result.projectedU).toBe(60);
      // IVI = 0.4*55 + 0.3*45 + 0.3*60 = 22 + 13.5 + 18 = 53.5
      expect(result.projectedIvi).toBe(53.5);
    });
  });

  describe('generateMonthlyProjections', () => {
    it('should generate correct number of projections', () => {
      const projections = generateMonthlyProjections(50, 70, 12);
      
      // Should have 13 entries (month 0 through month 12)
      expect(projections.length).toBe(13);
    });

    it('should start with base IVI', () => {
      const projections = generateMonthlyProjections(50, 70, 12);
      
      // First month should be close to base (with small variance)
      expect(projections[0].month).toBe(0);
      expect(projections[0].ivi).toBeGreaterThanOrEqual(48);
      expect(projections[0].ivi).toBeLessThanOrEqual(52);
    });

    it('should end near target IVI', () => {
      const projections = generateMonthlyProjections(50, 70, 12);
      
      // Last month should be close to target (with small variance)
      const lastProjection = projections[projections.length - 1];
      expect(lastProjection.month).toBe(12);
      expect(lastProjection.ivi).toBeGreaterThanOrEqual(68);
      expect(lastProjection.ivi).toBeLessThanOrEqual(72);
    });

    it('should have valid date strings', () => {
      const projections = generateMonthlyProjections(50, 70, 6);
      
      projections.forEach(p => {
        expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should clamp IVI values to 0-100', () => {
      // Test with extreme values
      const projectionsHigh = generateMonthlyProjections(95, 110, 6);
      projectionsHigh.forEach(p => {
        expect(p.ivi).toBeLessThanOrEqual(100);
      });
      
      const projectionsLow = generateMonthlyProjections(5, -10, 6);
      projectionsLow.forEach(p => {
        expect(p.ivi).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle short time horizons', () => {
      const projections = generateMonthlyProjections(50, 60, 3);
      
      expect(projections.length).toBe(4); // 0, 1, 2, 3
    });

    it('should handle long time horizons', () => {
      const projections = generateMonthlyProjections(40, 80, 36);
      
      expect(projections.length).toBe(37);
    });
  });
});
