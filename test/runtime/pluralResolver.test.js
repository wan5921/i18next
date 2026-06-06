import { describe, it, expect, beforeAll, beforeEach, afterEach, vitest } from 'vitest';
import PluralResolver from '../../src/PluralResolver';
import LanguageUtils from '../../src/LanguageUtils';

describe('PluralResolver', () => {
  describe('getRule()', () => {
    /** @type {PluralResolver} */
    let pr;
    beforeAll(() => {
      const lu = new LanguageUtils({ fallbackLng: 'en' });
      pr = new PluralResolver(lu, {});
    });

    beforeEach(() => {
      pr.clearCache();
    });

    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('correctly returns getRule for a supported locale', () => {
      const expected = {
        resolvedOptions() {},
        select() {},
      };
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return expected;
      });

      const locale = 'en';

      expect(pr.getRule(locale)).toEqual(expected);
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });

    it('correctly returns getRule for an unsupported locale', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        throw Error('mock error');
      });

      const locale = 'en';

      expect(pr.getRule(locale)).not.toBeUndefined(); // we return dummy rule
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });
  });

  describe('needsPlural()', () => {
    /** @type {PluralResolver} */
    let pr;
    beforeAll(() => {
      const lu = new LanguageUtils({ fallbackLng: 'en' });
      pr = new PluralResolver(lu, {});
    });

    beforeEach(() => {
      pr.clearCache();
    });

    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('correctly returns needsPlural for locale with more than one plural form', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { resolvedOptions: () => ({ pluralCategories: ['one', 'other'] }) };
      });

      const locale = 'en';

      expect(pr.needsPlural(locale)).toBeTruthy();
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });

    it('correctly returns needsPlural for locale with just one plural form', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { resolvedOptions: () => ({ pluralCategories: ['other'] }) };
      });

      const locale = 'ja';

      expect(pr.needsPlural(locale)).toBeFalsy();
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });
  });

  describe('getSuffix()', () => {
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
      vitest.restoreAllMocks();
    });

    it('correctly returns suffix for a supported locale', () => {
      const locale = 'en';
      const count = 10.5;
      const expected = 'other';

      const selectStub = vitest.fn().mockReturnValue(expected);
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix(locale, count)).to.equal(`_${expected}`);
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
      expect(selectStub).toHaveBeenCalledOnce();
      expect(selectStub).toHaveBeenCalledWith(count);
    });

    it('correctly returns suffix for an unsupported locale', () => {
      const locale = 'nonexistent';

      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        throw Error('mock error');
      });

      expect(pr.getSuffix(locale, 10.5)).toEqual('_other');
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });

    it('correctly returns plural forms for a given key', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { resolvedOptions: () => ({ pluralCategories: ['one', 'other'] }) };
      });

      const locale = 'en';

      expect(pr.getPluralFormsOfKey(locale, 'key')).toStrictEqual(['key_one', 'key_other']);
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });

    it('correctly maps count=1 to "one" suffix for English', () => {
      const locale = 'en';
      const count = 1;

      const selectStub = vitest.fn().mockReturnValue('one');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix(locale, count)).to.equal('_one');
      expect(selectStub).toHaveBeenCalledWith(count);
    });

    it('correctly maps count=0 to "other" suffix for English', () => {
      const locale = 'en';
      const count = 0;

      const selectStub = vitest.fn().mockReturnValue('other');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix(locale, count)).to.equal('_other');
      expect(selectStub).toHaveBeenCalledWith(count);
    });

    it('correctly handles Russian plural rules (one/few/many/other)', () => {
      const locale = 'ru';
      const counts = [
        { count: 1, expected: 'one' },
        { count: 2, expected: 'few' },
        { count: 5, expected: 'many' },
        { count: 1.5, expected: 'other' },
      ];

      counts.forEach(({ count, expected }) => {
        const selectStub = vitest.fn().mockReturnValue(expected);
        vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
          return { select: selectStub };
        });
        pr.clearCache();

        expect(pr.getSuffix(locale, count)).to.equal(`_${expected}`);
        expect(selectStub).toHaveBeenCalledWith(count);
      });
    });

    it('correctly handles Arabic plural rules (zero/one/two/few/many/other)', () => {
      const locale = 'ar';
      const counts = [
        { count: 0, expected: 'zero' },
        { count: 1, expected: 'one' },
        { count: 2, expected: 'two' },
        { count: 3, expected: 'few' },
        { count: 12, expected: 'many' },
        { count: 100, expected: 'other' },
      ];

      counts.forEach(({ count, expected }) => {
        const selectStub = vitest.fn().mockReturnValue(expected);
        vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
          return { select: selectStub };
        });
        pr.clearCache();

        expect(pr.getSuffix(locale, count)).to.equal(`_${expected}`);
        expect(selectStub).toHaveBeenCalledWith(count);
      });
    });

    it('correctly handles Japanese (single plural form)', () => {
      const locale = 'ja';
      const count = 5;

      const selectStub = vitest.fn().mockReturnValue('other');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix(locale, count)).to.equal('_other');
      expect(selectStub).toHaveBeenCalledWith(count);
    });

    it('correctly handles ordinal plurals', () => {
      const locale = 'en';
      const count = 1;

      const selectStub = vitest.fn().mockReturnValue('one');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix(locale, count, { ordinal: true })).to.equal('_ordinal_one');
      expect(selectStub).toHaveBeenCalledWith(count);
    });

    it('correctly falls back to dev rule when primary rule fails', () => {
      const locale = 'invalid-locale';
      let callCount = 0;

      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function (code) {
        callCount++;
        if (code === 'invalid-locale') {
          throw Error('invalid locale');
        }
        return { select: () => 'one' };
      });

      expect(pr.getSuffix(locale, 1)).to.equal('_one');
      expect(callCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSuffixes()', () => {
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
      vitest.restoreAllMocks();
    });

    it('correctly returns plural suffixes for a given key', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          resolvedOptions: () => ({
            pluralCategories: ['zero', 'one', 'two', 'few', 'many', 'other'],
          }),
        };
      });

      const locale = 'en';

      expect(pr.getSuffixes(locale)).toStrictEqual([
        '_zero',
        '_one',
        '_two',
        '_few',
        '_many',
        '_other',
      ]);
      expect(Intl.PluralRules).toHaveBeenCalledOnce();
      expect(Intl.PluralRules).toHaveBeenCalledWith(
        locale,
        expect.objectContaining({ type: expect.any(String) }),
      );
    });
  });
});
