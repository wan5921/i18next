import { resolve } from 'path';
import { pathToFileURL } from 'url';

// A simple test runner to verify it works without bwrap
import Translator from './src/Translator.js';
import ResourceStore from './src/ResourceStore.js';
import LanguageUtils from './src/LanguageUtils.js';
import PluralResolver from './src/PluralResolver.js';
import Interpolator from './src/Interpolator.js';
import postProcessor from './src/postProcessor.js';

const rs = new ResourceStore({
  en: {
    translation: {
      test_one: 'test_en',
      test_other: 'tests_en',
    }
  }
});
const lu = new LanguageUtils({ fallbackLng: 'en' });
const t = new Translator(
  {
    resourceStore: rs,
    languageUtils: lu,
    pluralResolver: new PluralResolver(lu, { prepend: '_' }),
    interpolator: new Interpolator(),
  },
  {
    pluralSeparator: '_',
    interpolation: {
      interpolateResult: true,
      interpolateDefaultValue: true,
      interpolateKey: true,
    },
  },
);
t.changeLanguage('en');

postProcessor.addPostProcessor({
  name: 'dummyPostProcessor',
  process: (value, key, options, translator) => {
    console.log('Plugin received key:', key);
    return value + '_postProcessed';
  }
});

const res = t.translate('translation:test', { count: 2, postProcess: 'dummyPostProcessor' });
console.log('Result:', res);
