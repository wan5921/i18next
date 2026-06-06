import { describe, it, expect, beforeAll } from 'vitest';
import Translator from '../../../src/Translator';
import ResourceStore from '../../../src/ResourceStore.js';
import LanguageUtils from '../../../src/LanguageUtils';
import PluralResolver from '../../../src/PluralResolver';
import Interpolator from '../../../src/Interpolator';

describe('Translator', () => {
  describe('resolve() namespace reference scenarios', () => {
    /** @type {Translator} */
    let t;

    beforeAll(() => {
      const rs = new ResourceStore({
        en: {
          translation: {
            test: 'test_en',
            nested: {
              deep: 'nested_deep_en',
            },
          },
          ns1: {
            child: 'ns1_root_child_en',
            parent: {
              child: 'ns1_parent_child_en',
            },
          },
          ns2: {
            leaf: 'ns2_leaf_en',
            branch: {
              leaf: 'ns2_branch_leaf_en',
            },
          },
        },
        de: {
          translation: {
            test: 'test_de',
          },
          ns1: {
            child: 'ns1_root_child_de',
            parent: {
              child: 'ns1_parent_child_de',
            },
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
          defaultNS: 'translation',
          ns: ['translation', 'ns1', 'ns2'],
          interpolation: {
            interpolateResult: true,
            interpolateDefaultValue: true,
            interpolateKey: true,
          },
        },
      );
      t.changeLanguage('en');
    });

    describe('namespace reference with nested key', () => {
      it('should resolve ns1:parent.child when parent exists', () => {
        const result = t.resolve('ns1:parent.child');
        expect(result.res).toEqual('ns1_parent_child_en');
        expect(result.usedNS).toEqual('ns1');
        expect(result.usedKey).toEqual('parent.child');
      });

      it('should resolve ns2:branch.leaf when branch exists', () => {
        const result = t.resolve('ns2:branch.leaf');
        expect(result.res).toEqual('ns2_branch_leaf_en');
        expect(result.usedNS).toEqual('ns2');
        expect(result.usedKey).toEqual('branch.leaf');
      });
    });

    describe('namespace fallback: if parent does not exist, try root lookup', () => {
      it('should fallback to root lookup when parent key does not exist', () => {
        const result = t.resolve('ns1:nonexistent.child');
        expect(result.res).toEqual('ns1_root_child_en');
        expect(result.usedNS).toEqual('ns1');
        expect(result.usedKey).toEqual('nonexistent.child');
        expect(result.exactUsedKey).toEqual('child');
      });

      it('should fallback to root lookup for ns2', () => {
        const result = t.resolve('ns2:nonexistent.leaf');
        expect(result.res).toEqual('ns2_leaf_en');
        expect(result.usedNS).toEqual('ns2');
        expect(result.usedKey).toEqual('nonexistent.leaf');
        expect(result.exactUsedKey).toEqual('leaf');
      });

      it('should not fallback when parent exists and key is found', () => {
        const result = t.resolve('ns1:parent.child');
        expect(result.res).toEqual('ns1_parent_child_en');
        expect(result.exactUsedKey).not.toEqual('child');
      });
    });

    describe('path array iteration', () => {
      it('should resolve path array for nested key', () => {
        const result = t.resolve(['parent', 'child'], { ns: ['ns1'] });
        expect(result.res).toEqual('ns1_parent_child_en');
        expect(result.usedNS).toEqual('ns1');
      });

      it('should resolve path array with namespace prefix', () => {
        const result = t.resolve('ns1:parent.child');
        expect(result.res).toEqual('ns1_parent_child_en');
      });

      it('should resolve path array for single level key', () => {
        const result = t.resolve(['child'], { ns: ['ns1'] });
        expect(result.res).toEqual('ns1_root_child_en');
      });

      it('should resolve path array with fallback when parent not found', () => {
        const result = t.resolve(['nonexistent', 'child'], { ns: ['ns1'] });
        expect(result.res).toEqual('ns1_root_child_en');
        expect(result.exactUsedKey).toEqual('child');
      });
    });

    describe('language fallback with namespace reference', () => {
      it('should fallback language for ns1:parent.child', () => {
        const result = t.resolve('ns1:parent.child', { lng: 'fr' });
        expect(result.res).toEqual('ns1_parent_child_en');
        expect(result.usedLng).toEqual('en');
      });

      it('should use specified language for ns1:parent.child', () => {
        const result = t.resolve('ns1:parent.child', { lng: 'de' });
        expect(result.res).toEqual('ns1_parent_child_de');
        expect(result.usedLng).toEqual('de');
      });
    });

    describe('namespace fallback with defaultNS', () => {
      it('should resolve nested key in default namespace', () => {
        const result = t.resolve('nested.deep');
        expect(result.res).toEqual('nested_deep_en');
        expect(result.usedNS).toEqual('translation');
      });
    });
  });
});