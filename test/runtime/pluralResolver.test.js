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
        select: expect.any(Function),
        resolvedOptions: expect.any(Function),
      };

      expect(pr.getRule('en')).toEqual(expected);
    });

    it('correctly returns getRule for an unsupported locale', () => {
      expect(pr.getRule('nonexistent')).toEqual({
        select: expect.any(Function),
        resolvedOptions: expect.any(Function),
      });
    });

    it('correctly returns getRule for locale with region', () => {
      expect(pr.getRule('pt-PT')).toEqual({
        select: expect.any(Function),
        resolvedOptions: expect.any(Function),
      });
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

    it('correctly returns suffix for arabic plural categories', () => {
      expect(pr.getSuffix('ar', 0)).toEqual('_zero');
      expect(pr.getSuffix('ar', 1)).toEqual('_one');
      expect(pr.getSuffix('ar', 2)).toEqual('_two');
      expect(pr.getSuffix('ar', 3)).toEqual('_few');
      expect(pr.getSuffix('ar', 15)).toEqual('_many');
      expect(pr.getSuffix('ar', 101)).toEqual('_other');
    });

    it('logs language and count when plural resolution logging is enabled', () => {
      const logSpy = vitest.spyOn(console, 'log').mockImplementation(() => {});
      const selectStub = vitest.fn().mockReturnValue('few');
      vitest.spyOn(Intl, 'PluralRules').mockImplementation(function () {
        return { select: selectStub };
      });

      expect(pr.getSuffix('ar', 3, { logPluralResolution: true })).toEqual('_few');
      expect(logSpy).toHaveBeenCalledWith(
        '[pluralResolver.getSuffix]',
        expect.objectContaining({
          language: 'ar',
          count: 3,
          pluralCategory: 'few',
          ordinal: false,
        }),
      );
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
