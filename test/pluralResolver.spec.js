import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import PluralResolver from '../src/PluralResolver.js';
import LanguageUtils from '../src/LanguageUtils.js';

describe('PluralResolver', () => {
  describe('getSuffix() - Russian (ru) locale', () => {
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

    it('returns _one for count 1 in Russian', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count % 10 === 1 && count % 100 !== 11) return 'one';
            if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14))
              return 'few';
            return 'many';
          }),
        };
      });

      expect(pr.getSuffix('ru', 1)).toBe('_one');
    });

    it('returns _few for count 2 in Russian', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count % 10 === 1 && count % 100 !== 11) return 'one';
            if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14))
              return 'few';
            return 'many';
          }),
        };
      });

      expect(pr.getSuffix('ru', 2)).toBe('_few');
    });

    it('returns _many for count 5 in Russian', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count % 10 === 1 && count % 100 !== 11) return 'one';
            if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14))
              return 'few';
            return 'many';
          }),
        };
      });

      expect(pr.getSuffix('ru', 5)).toBe('_many');
    });
  });

  describe('getSuffix() - few and many branch coverage', () => {
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

    it('covers the few branch in rule mapping for count 2', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      const result = pr.getSuffix('ru', 2);
      expect(result).toBe('_few');
    });

    it('covers the many branch in rule mapping for count 5', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      const result = pr.getSuffix('ru', 5);
      expect(result).toBe('_many');
    });

    it('verifies all Russian plural categories are covered via getSuffixes', () => {
      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          resolvedOptions: () => ({
            pluralCategories: ['one', 'few', 'many', 'other'],
          }),
          select: vi.fn(),
        };
      });

      const suffixes = pr.getSuffixes('ru');
      expect(suffixes).toStrictEqual(['_one', '_few', '_many', '_other']);
    });
  });

  describe('getSuffix() - vi.spyOn call count monitoring', () => {
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

    it('tracks getSuffix call count with vi.spyOn', () => {
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      pr.getSuffix('ru', 1);
      pr.getSuffix('ru', 2);
      pr.getSuffix('ru', 5);

      expect(getSuffixSpy).toHaveBeenCalledTimes(3);
      expect(getSuffixSpy).toHaveBeenCalledWith('ru', 1);
      expect(getSuffixSpy).toHaveBeenCalledWith('ru', 2);
      expect(getSuffixSpy).toHaveBeenCalledWith('ru', 5);
    });

    it('verifies getSuffix is called once per translation lookup', () => {
      const getSuffixSpy = vi.spyOn(pr, 'getSuffix');

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn(() => 'few'),
        };
      });

      const result = pr.getSuffix('ru', 2);

      expect(getSuffixSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('_few');
    });
  });

  describe('options.postProcess scenarios', () => {
    let pr;
    let lu;

    beforeAll(() => {
      lu = new LanguageUtils({ fallbackLng: 'en' });
    });

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('works correctly when postProcess is empty/false (default)', () => {
      pr = new PluralResolver(lu, { prepend: '_', postProcess: false });

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      expect(pr.getSuffix('ru', 1)).toBe('_one');
      expect(pr.getSuffix('ru', 2)).toBe('_few');
      expect(pr.getSuffix('ru', 5)).toBe('_many');
    });

    it('works correctly when postProcess is an empty array', () => {
      pr = new PluralResolver(lu, { prepend: '_', postProcess: [] });

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      expect(pr.getSuffix('ru', 1)).toBe('_one');
      expect(pr.getSuffix('ru', 2)).toBe('_few');
      expect(pr.getSuffix('ru', 5)).toBe('_many');
    });

    it('works correctly when postProcess is set with conflicting processor names', () => {
      pr = new PluralResolver(lu, {
        prepend: '_',
        postProcess: ['conflictingProcessor'],
      });

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      expect(pr.getSuffix('ru', 1)).toBe('_one');
      expect(pr.getSuffix('ru', 2)).toBe('_few');
      expect(pr.getSuffix('ru', 5)).toBe('_many');
    });

    it('passes postProcess in per-call options without breaking getSuffix', () => {
      pr = new PluralResolver(lu, { prepend: '_' });

      vi.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: vi.fn((count) => {
            if (count === 1) return 'one';
            if (count === 2) return 'few';
            if (count === 5) return 'many';
            return 'other';
          }),
        };
      });

      expect(pr.getSuffix('ru', 1, { postProcess: false })).toBe('_one');
      expect(pr.getSuffix('ru', 2, { postProcess: ['someProcessor'] })).toBe('_few');
      expect(pr.getSuffix('ru', 5, { postProcess: [] })).toBe('_many');
    });
  });
});