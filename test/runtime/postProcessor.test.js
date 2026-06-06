import { describe, it, expect, beforeAll, beforeEach, afterEach, vitest } from 'vitest';
import postProcessor from '../../src/postProcessor';
import Translator from '../../src/Translator';
import ResourceStore from '../../src/ResourceStore';
import LanguageUtils from '../../src/LanguageUtils';
import PluralResolver from '../../src/PluralResolver';
import Interpolator from '../../src/Interpolator';

describe('postProcessor', () => {
  describe('add and handle()', () => {
    beforeAll(() => {
      postProcessor.addPostProcessor({
        name: 'dummy',
        process: (value) => value.toUpperCase(),
      });
    });

    const tests = [{ args: [['dummy'], 'test', 'key', {}, () => {}], expected: 'TEST' }];

    tests.forEach((test) => {
      it(`correctly process for ${JSON.stringify(test.args)} args`, () => {
        expect(postProcessor.handle.apply(postProcessor, test.args)).to.eql(test.expected);
      });
    });
  });

  describe('postProcess scenarios', () => {
    /** @type {Translator} */
    let t;

    beforeEach(() => {
      // Reset processors and add test processors
      postProcessor.processors = {};
      postProcessor.addPostProcessor({
        name: 'uppercase',
        process: (value) => value.toUpperCase(),
      });
      postProcessor.addPostProcessor({
        name: 'lowercase',
        process: (value) => value.toLowerCase(),
      });

      const rs = new ResourceStore({
        en: {
          translation: {
            test: 'Hello World',
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
          ns: 'translation',
        },
      );
      t.changeLanguage('en');
    });

    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('should handle empty postProcess', () => {
      const result = t.translate('test', { postProcess: [] });
      expect(result).toEqual('Hello World');
    });

    it('should handle postProcess as null/undefined', () => {
      const result1 = t.translate('test', { postProcess: null });
      const result2 = t.translate('test', { postProcess: undefined });
      expect(result1).toEqual('Hello World');
      expect(result2).toEqual('Hello World');
    });

    it('should handle conflicting postProcessors (uppercase then lowercase)', () => {
      const result = t.translate('test', { postProcess: ['uppercase', 'lowercase'] });
      expect(result).toEqual('hello world');
    });

    it('should handle conflicting postProcessors (lowercase then uppercase)', () => {
      const result = t.translate('test', { postProcess: ['lowercase', 'uppercase'] });
      expect(result).toEqual('HELLO WORLD');
    });

    it('should handle non-existent postProcessors', () => {
      const result = t.translate('test', { postProcess: ['nonExistent'] });
      expect(result).toEqual('Hello World');
    });
  });
});
