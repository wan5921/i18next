import Translator from './src/Translator.js';
import ResourceStore from './src/ResourceStore.js';
import LanguageUtils from './src/LanguageUtils.js';
import PluralResolver from './src/PluralResolver.js';
import Interpolator from './src/Interpolator.js';

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
const t = new Translator(
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

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} - expected "${expected}", got "${actual}"`);
    failed++;
  }
}

console.log('=== Namespace Path Fallback Tests ===');

assert('ns1:parent.child (exists)', t.translate('ns1:parent.child'), 'child_from_ns1_parent');
assert('ns1:missing.child (fallback)', t.translate('ns1:missing.child'), 'child_from_ns1_root');
assert('ns1:deep.nested.leaf (deep)', t.translate('ns1:deep.nested.leaf'), 'leaf_from_deep');
assert('ns1:nonexistent.nested.leaf (no match)', t.translate('ns1:nonexistent.nested.leaf'), 'nonexistent.nested.leaf');
assert('ns2:orphan.missing (exists)', t.translate('ns2:orphan.missing'), 'orphan_missing_ns2');
assert('ns2:missing.child (fallback ns2)', t.translate('ns2:missing.child'), 'child_from_ns2_root');

const details1 = t.translate('ns1:missing.child', { returnDetails: true });
assert('returnDetails fallback - res', details1.res, 'child_from_ns1_root');
assert('returnDetails fallback - exactUsedKey', details1.exactUsedKey, 'child');

const details2 = t.translate('ns1:parent.child', { returnDetails: true });
assert('returnDetails direct - res', details2.res, 'child_from_ns1_parent');
assert('returnDetails direct - exactUsedKey', details2.exactUsedKey, 'parent.child');

assert('keySeparator:false', t.translate('ns1:missing.child', { keySeparator: false }), 'ns1:missing.child');
assert('basic translation:test', t.translate('translation:test'), 'test_en');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
