import { describe, it, expect, beforeAll } from 'vitest';
import Translator from '../../../src/Translator';
import ResourceStore from '../../../src/ResourceStore.js';
import LanguageUtils from '../../../src/LanguageUtils';
import PluralResolver from '../../../src/PluralResolver';
import Interpolator from '../../../src/Interpolator';

describe('Translator namespace root fallback', () => {
  describe('translate()', () => {
    let t;

    beforeAll(() => {
      const rs = new ResourceStore({
        en: {
          ns1: {
            parent: {
              existingChild: 'existing_child_value',
            },
            child: 'root_child_value',
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
          ns: 'ns1',
          interpolation: {
            interpolateResult: true,
            interpolateDefaultValue: true,
            interpolateKey: true,
          },
        },
      );
      t.changeLanguage('en');
    });

    it('should find exact path first', () => {
      expect(t.translate('ns1:parent.existingChild')).toEqual('existing_child_value');
    });

    it('should fallback to root if parent does not exist', () => {
      expect(t.translate('ns1:parent.child')).toEqual('root_child_value');
    });

    it('should support array paths iteration fallback', () => {
      expect(t.translate('ns1:not_exist_parent.another_not_exist.child')).toEqual('root_child_value');
    });
  });
});
