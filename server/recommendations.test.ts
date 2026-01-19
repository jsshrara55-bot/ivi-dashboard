import { describe, it, expect } from 'vitest';

// Import the recommendation functions from the client-side module
// We'll test the logic directly since it's pure functions
import { 
  generateRecommendations, 
  calculateTotalImpact, 
  getImplementationRoadmap,
  healthRecommendations,
  experienceRecommendations,
  utilizationRecommendations
} from '../client/src/lib/scenarioRecommendations';

describe('Scenario Recommendations', () => {
  describe('generateRecommendations', () => {
    it('should return empty array when all adjustments are zero', () => {
      const result = generateRecommendations(0, 0, 0);
      expect(result).toEqual([]);
    });

    it('should return empty array when all adjustments are negative', () => {
      const result = generateRecommendations(-10, -10, -10);
      expect(result).toEqual([]);
    });

    it('should return health recommendations for positive H adjustment', () => {
      const result = generateRecommendations(10, 0, 0);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.category === 'H')).toBe(true);
    });

    it('should return experience recommendations for positive E adjustment', () => {
      const result = generateRecommendations(0, 10, 0);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.category === 'E')).toBe(true);
    });

    it('should return utilization recommendations for positive U adjustment', () => {
      const result = generateRecommendations(0, 0, 10);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.category === 'U')).toBe(true);
    });

    it('should return mixed recommendations for all positive adjustments', () => {
      const result = generateRecommendations(20, 20, 20);
      
      expect(result.length).toBeGreaterThan(0);
      
      const categories = new Set(result.map(r => r.category));
      expect(categories.has('H')).toBe(true);
      expect(categories.has('E')).toBe(true);
      expect(categories.has('U')).toBe(true);
    });

    it('should filter recommendations based on required adjustment threshold', () => {
      // Small adjustment should only return recommendations with low threshold
      const smallResult = generateRecommendations(3, 0, 0);
      const largeResult = generateRecommendations(15, 0, 0);
      
      expect(largeResult.length).toBeGreaterThanOrEqual(smallResult.length);
    });

    it('should sort recommendations by priority and impact', () => {
      const result = generateRecommendations(20, 20, 20);
      
      // Check that high priority comes before medium
      const priorities = result.map(r => r.priority);
      const firstMediumIndex = priorities.indexOf('medium');
      const firstLowIndex = priorities.indexOf('low');
      
      if (firstMediumIndex !== -1) {
        const highPriorityAfterMedium = priorities.slice(firstMediumIndex).includes('high');
        expect(highPriorityAfterMedium).toBe(false);
      }
      
      if (firstLowIndex !== -1) {
        const mediumOrHighAfterLow = priorities.slice(firstLowIndex).some(p => p === 'high' || p === 'medium');
        expect(mediumOrHighAfterLow).toBe(false);
      }
    });
  });

  describe('calculateTotalImpact', () => {
    it('should return zeros for empty recommendations', () => {
      const result = calculateTotalImpact([]);
      
      expect(result.hImpact).toBe(0);
      expect(result.eImpact).toBe(0);
      expect(result.uImpact).toBe(0);
      expect(result.totalImpact).toBe(0);
    });

    it('should calculate H impact correctly', () => {
      const recommendations = generateRecommendations(20, 0, 0);
      const result = calculateTotalImpact(recommendations);
      
      expect(result.hImpact).toBeGreaterThan(0);
      expect(result.eImpact).toBe(0);
      expect(result.uImpact).toBe(0);
    });

    it('should calculate E impact correctly', () => {
      const recommendations = generateRecommendations(0, 20, 0);
      const result = calculateTotalImpact(recommendations);
      
      expect(result.hImpact).toBe(0);
      expect(result.eImpact).toBeGreaterThan(0);
      expect(result.uImpact).toBe(0);
    });

    it('should calculate U impact correctly', () => {
      const recommendations = generateRecommendations(0, 0, 20);
      const result = calculateTotalImpact(recommendations);
      
      expect(result.hImpact).toBe(0);
      expect(result.eImpact).toBe(0);
      expect(result.uImpact).toBeGreaterThan(0);
    });

    it('should apply IVI formula correctly (0.4*H + 0.3*E + 0.3*U)', () => {
      const recommendations = generateRecommendations(20, 20, 20);
      const result = calculateTotalImpact(recommendations);
      
      const expectedTotal = 0.4 * result.hImpact + 0.3 * result.eImpact + 0.3 * result.uImpact;
      expect(result.totalImpact).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('getImplementationRoadmap', () => {
    it('should return empty array for no recommendations', () => {
      const result = getImplementationRoadmap([], false);
      expect(result).toEqual([]);
    });

    it('should group recommendations into phases', () => {
      const recommendations = generateRecommendations(20, 20, 20);
      const result = getImplementationRoadmap(recommendations, false);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(phase => {
        expect(phase).toHaveProperty('phase');
        expect(phase).toHaveProperty('timeline');
        expect(phase).toHaveProperty('actions');
        expect(Array.isArray(phase.actions)).toBe(true);
      });
    });

    it('should return RTL labels when isRTL is true', () => {
      const recommendations = generateRecommendations(20, 20, 20);
      const result = getImplementationRoadmap(recommendations, true);
      
      if (result.length > 0) {
        // Check that phase names contain Arabic text
        expect(result[0].phase).toContain('المرحلة');
      }
    });

    it('should return English labels when isRTL is false', () => {
      const recommendations = generateRecommendations(20, 20, 20);
      const result = getImplementationRoadmap(recommendations, false);
      
      if (result.length > 0) {
        expect(result[0].phase).toContain('Phase');
      }
    });
  });

  describe('Recommendation Data Integrity', () => {
    it('should have valid health recommendations', () => {
      healthRecommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.title.en).toBeDefined();
        expect(rec.title.ar).toBeDefined();
        expect(rec.description.en).toBeDefined();
        expect(rec.description.ar).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.estimatedImpact).toBeGreaterThan(0);
        expect(rec.category).toBe('H');
        expect(rec.kpis.length).toBeGreaterThan(0);
      });
    });

    it('should have valid experience recommendations', () => {
      experienceRecommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.title.en).toBeDefined();
        expect(rec.title.ar).toBeDefined();
        expect(rec.description.en).toBeDefined();
        expect(rec.description.ar).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.estimatedImpact).toBeGreaterThan(0);
        expect(rec.category).toBe('E');
        expect(rec.kpis.length).toBeGreaterThan(0);
      });
    });

    it('should have valid utilization recommendations', () => {
      utilizationRecommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.title.en).toBeDefined();
        expect(rec.title.ar).toBeDefined();
        expect(rec.description.en).toBeDefined();
        expect(rec.description.ar).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.estimatedImpact).toBeGreaterThan(0);
        expect(rec.category).toBe('U');
        expect(rec.kpis.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs across all recommendations', () => {
      const allRecs = [...healthRecommendations, ...experienceRecommendations, ...utilizationRecommendations];
      const ids = allRecs.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
