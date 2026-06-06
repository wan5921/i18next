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

    it('correctly returns suffix for Russian (ru) with count=1, 2, 5', () => {
      const locale = 'ru';

      // Mock Intl.PluralRules for Russian
      const selectStub = vitest.fn((count) => {
        if (count === 1) return 'one';
        if (count >= 2 && count <= 4) return 'few';
        return 'many';
      });
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return {
          select: selectStub,
          resolvedOptions: () => ({ pluralCategories: ['one', 'few', 'many'] })
        };
      });

      expect(pr.getSuffix(locale, 1)).toEqual('_one');
      expect(pr.getSuffix(locale, 2)).toEqual('_few');
      expect(pr.getSuffix(locale, 5)).toEqual('_many');
      expect(selectStub).toHaveBeenCalledTimes(3);
    });

    it('monitors getSuffix call counts with vi.spyOn', () => {
      const locale = 'en';
      const selectStub = vitest.fn().mockReturnValue('one');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      const getSuffixSpy = vitest.spyOn(pr, 'getSuffix');

      expect(pr.getSuffix(locale, 1)).toEqual('_one');
      expect(pr.getSuffix(locale, 2)).toEqual('_one');
      expect(pr.getSuffix(locale, 3)).toEqual('_one');

      expect(getSuffixSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPluralFormsOfKey()', () => {
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

    it('correctly returns plural forms with few and many categories', () => {
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { resolvedOptions: () => ({ pluralCategories: ['one', 'few', 'many', 'other'] }) };
      });

      const locale = 'ru';

      expect(pr.getPluralFormsOfKey(locale, 'key')).toStrictEqual([
        'key_one',
        'key_few',
        'key_many',
        'key_other'
      ]);
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
