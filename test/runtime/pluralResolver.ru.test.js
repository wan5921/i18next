import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import PluralResolver from '../../src/PluralResolver';
import LanguageUtils from '../../src/LanguageUtils';

describe('PluralResolver - Russian (ru)', () => {
  /** @type {PluralResolver} */
  let pr;

  beforeAll(() => {
    const lu = new LanguageUtils({ fallbackLng: 'en' });
    pr = new PluralResolver(lu, { prepend: '_' });
  });

  beforeEach(() => {
    pr.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSuffix() for Russian locale', () => {
    it('returns "one" suffix when count is 1', () => {
      const suffix = pr.getSuffix('ru', 1);
      expect(suffix).toBe('_one');
    });

    it('returns "few" suffix when count is 2', () => {
      const suffix = pr.getSuffix('ru', 2);
      expect(suffix).toBe('_few');
    });

    it('returns "many" suffix when count is 5', () => {
      const suffix = pr.getSuffix('ru', 5);
      expect(suffix).toBe('_many');
    });
  });

  describe('vi.spyOn monitoring getSuffix call count', () => {
    it('tracks getSuffix call count for multiple invocations', () => {
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      pr.getSuffix('ru', 1);
      pr.getSuffix('ru', 2);
      pr.getSuffix('ru', 5);

      expect(getSuffixSpy).toHaveBeenCalledTimes(3);
      expect(getSuffixSpy).toHaveBeenNthCalledWith(1, 'ru', 1, {});
      expect(getSuffixSpy).toHaveBeenNthCalledWith(2, 'ru', 2, {});
      expect(getSuffixSpy).toHaveBeenNthCalledWith(3, 'ru', 5, {});
    });

    it('tracks getSuffix call count with options parameter', () => {
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      pr.getSuffix('ru', 1, { ordinal: true });
      pr.getSuffix('ru', 2, { ordinal: true });

      expect(getSuffixSpy).toHaveBeenCalledTimes(2);
      expect(getSuffixSpy).toHaveBeenCalledWith('ru', 1, { ordinal: true });
      expect(getSuffixSpy).toHaveBeenCalledWith('ru', 2, { ordinal: true });
    });
  });

  describe('options.postProcess scenarios', () => {
    it('handles empty postProcess option', () => {
      const options = { postProcess: undefined };
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      const suffix = pr.getSuffix('ru', 1, options);

      expect(suffix).toBe('_one');
      expect(getSuffixSpy).toHaveBeenCalledTimes(1);
    });

    it('handles empty string postProcess option', () => {
      const options = { postProcess: '' };
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      const suffix = pr.getSuffix('ru', 2, options);

      expect(suffix).toBe('_few');
      expect(getSuffixSpy).toHaveBeenCalledTimes(1);
    });

    it('handles conflicting postProcess option (string vs array)', () => {
      const optionsWithString = { postProcess: 'formatter1' };
      const optionsWithArray = { postProcess: ['formatter2', 'formatter3'] };
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      const suffix1 = pr.getSuffix('ru', 1, optionsWithString);
      const suffix2 = pr.getSuffix('ru', 5, optionsWithArray);

      expect(suffix1).toBe('_one');
      expect(suffix2).toBe('_many');
      expect(getSuffixSpy).toHaveBeenCalledTimes(2);
    });

    it('handles postProcess with ordinal conflict', () => {
      const options = { postProcess: 'interval', ordinal: true };
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      const suffix = pr.getSuffix('ru', 2, options);

      expect(suffix).toBe('_ordinal_few');
      expect(getSuffixSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('rule mapping for "few" and "many" branches', () => {
    it('covers "few" branch for count values 2-4', () => {
      const fewCounts = [2, 3, 4, 22, 23, 24, 102, 103, 104];
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      fewCounts.forEach((count) => {
        const suffix = pr.getSuffix('ru', count);
        expect(suffix).toBe('_few');
      });

      expect(getSuffixSpy).toHaveBeenCalledTimes(fewCounts.length);
    });

    it('covers "many" branch for count values 0, 5-20, 25-30', () => {
      const manyCounts = [0, 5, 6, 7, 8, 9, 10, 11, 20, 25, 30, 100, 1000];
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      manyCounts.forEach((count) => {
        const suffix = pr.getSuffix('ru', count);
        expect(suffix).toBe('_many');
      });

      expect(getSuffixSpy).toHaveBeenCalledTimes(manyCounts.length);
    });

    it('covers "one" branch for count values ending in 1 (except 11)', () => {
      const oneCounts = [1, 21, 31, 41, 51, 101];
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      oneCounts.forEach((count) => {
        const suffix = pr.getSuffix('ru', count);
        expect(suffix).toBe('_one');
      });

      expect(getSuffixSpy).toHaveBeenCalledTimes(oneCounts.length);
    });

    it('verifies getRule returns correct plural categories for Russian', () => {
      const rule = pr.getRule('ru');
      const categories = rule.resolvedOptions().pluralCategories;

      expect(categories).toContain('one');
      expect(categories).toContain('few');
      expect(categories).toContain('many');
    });

    it('selects "few" category via rule.select()', () => {
      const rule = pr.getRule('ru');
      expect(rule.select(2)).toBe('few');
      expect(rule.select(3)).toBe('few');
      expect(rule.select(4)).toBe('few');
    });

    it('selects "many" category via rule.select()', () => {
      const rule = pr.getRule('ru');
      expect(rule.select(0)).toBe('many');
      expect(rule.select(5)).toBe('many');
      expect(rule.select(10)).toBe('many');
      expect(rule.select(11)).toBe('many');
    });
  });
});
