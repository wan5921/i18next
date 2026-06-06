import { describe, it, expect, beforeAll } from 'vitest';
import Translator from '../../../src/Translator';
import ResourceStore from '../../../src/ResourceStore.js';
import LanguageUtils from '../../../src/LanguageUtils';
import PluralResolver from '../../../src/PluralResolver';
import Interpolator from '../../../src/Interpolator';

describe('Translator', () => {
  describe('namespace path fallback', () => {
    /** @type {Translator} */
    let t;

    beforeAll(() => {
      const rs = new ResourceStore({
        en: {
          ns1: {
            child: 'child_from_ns1_root',
            parent: {
              child: 'child_from_ns1_parent',
            },
            deep: {
              nested: {
                leaf: 'leaf_from_deep',
              },
            },
          },
          ns2: {
            child: 'child_from_ns2_root',
            orphan: {
              missing: 'orphan_missing_ns2',
            },
          },
          translation: {
            test: 'test_en',
          },
        },
      });
      const lu = new LanguageUtils({ fallbackLng: 'en' });
      t = new Translator(
        {
          resourceStore: rs,
          languageUtils: lu,
          pluralResolver: new PluralResolver(lu, { prepend: '_' }),
          interpolator: new Interpolator(),
        },
        {
          defaultNS: 'ns1',
          ns: ['ns1', 'ns2', 'translation'],
          interpolation: {
            interpolateResult: true,
            interpolateDefaultValue: true,
            interpolateKey: true,
          },
        },
      );
      t.changeLanguage('en');
    });

    describe('t("ns1:parent.child") - parent exists, uses nested value', () => {
      it('returns the nested value when parent key exists', () => {
        expect(t.translate('ns1:parent.child')).toEqual('child_from_ns1_parent');
      });
    });

    describe('t("ns1:missing.child") - parent missing, falls back to ns1 root child', () => {
      it('falls back to root-level "child" when "missing" does not exist', () => {
        expect(t.translate('ns1:missing.child')).toEqual('child_from_ns1_root');
      });
    });

    describe('t("ns1:deep.nested.leaf") - full path exists', () => {
      it('returns the deeply nested value', () => {
        expect(t.translate('ns1:deep.nested.leaf')).toEqual('leaf_from_deep');
      });
    });

    describe('t("ns1:nonexistent.nested.leaf") - first segment missing, falls back through path', () => {
      it('falls back to "nested.leaf" then "leaf" - finds nothing, returns key', () => {
        expect(t.translate('ns1:nonexistent.nested.leaf')).toEqual('nonexistent.nested.leaf');
      });
    });

    describe('t("ns1:deep.nested.missing") - partial path exists but leaf missing', () => {
      it('falls back to "nested.missing" then "missing" - finds nothing, returns key', () => {
        expect(t.translate('ns1:deep.nested.missing')).toEqual('deep.nested.missing');
      });
    });

    describe('t("ns2:orphan.missing") - parent exists in ns2', () => {
      it('returns the value from ns2 orphan.missing', () => {
        expect(t.translate('ns2:orphan.missing')).toEqual('orphan_missing_ns2');
      });
    });

    describe('t("ns2:missing.child") - parent missing in ns2, falls back to ns2 root child', () => {
      it('falls back to root-level "child" in ns2', () => {
        expect(t.translate('ns2:missing.child')).toEqual('child_from_ns2_root');
      });
    });

    describe('with returnDetails - tracks exactUsedKey for fallback', () => {
      it('reports the resolved key when fallback is used', () => {
        const result = t.translate('ns1:missing.child', { returnDetails: true });
        expect(result.res).toEqual('child_from_ns1_root');
        expect(result.exactUsedKey).toEqual('child');
        expect(result.usedNS).toEqual('ns1');
      });
    });

    describe('with returnDetails - tracks exactUsedKey for direct match', () => {
      it('reports the full key when direct match is found', () => {
        const result = t.translate('ns1:parent.child', { returnDetails: true });
        expect(result.res).toEqual('child_from_ns1_parent');
        expect(result.exactUsedKey).toEqual('parent.child');
        expect(result.usedNS).toEqual('ns1');
      });
    });

    describe('keySeparator: false disables path fallback', () => {
      it('does not fallback when keySeparator is false', () => {
        expect(t.translate('ns1:missing.child', { keySeparator: false })).toEqual(
          'ns1:missing.child',
        );
      });
    });
  });
});
