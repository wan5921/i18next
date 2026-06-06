import { describe, it, expect, beforeEach } from 'vitest';
import ResourceStore from '../../src/ResourceStore.js';

describe('ResourceStore - Path Fallback', () => {
  describe('path fallback functionality', () => {
    let rs;

    beforeEach(() => {
      const data = {
        en: {
          ns1: {
            child: 'direct child value',
            parent: {
              child: 'nested child value',
              deep: {
                nested: 'deep nested value'
              }
            },
            direct: 'direct value',
            root: 'root value'
          }
        }
      };
      rs = new ResourceStore(data);
    });

    it('should find nested child directly when parent exists', () => {
      expect(rs.getResource('en', 'ns1', 'parent.child')).to.equal('nested child value');
    });

    it('should fallback to root child when parent does not exist', () => {
      expect(rs.getResource('en', 'ns1', 'nonexistent.child')).to.equal('direct child value');
    });

    it('should fallback through multiple levels', () => {
      expect(rs.getResource('en', 'ns1', 'a.b.c.direct')).to.equal('direct value');
    });

    it('should find deep nested value when path exists', () => {
      expect(rs.getResource('en', 'ns1', 'parent.deep.nested')).to.equal('deep nested value');
    });

    it('should fallback step by step through multiple missing segments', () => {
      expect(rs.getResource('en', 'ns1', 'nonexistent.deep.nested')).to.equal('root value');
    });

    it('should return undefined when no matching keys at any level', () => {
      expect(rs.getResource('en', 'ns1', 'a.b.c.d.e.f')).to.equal(undefined);
    });
  });

  describe('path fallback with array keys', () => {
    let rs;

    beforeEach(() => {
      const data = {
        en: {
          ns1: {
            child: 'array path test value',
            parent: {
              child: 'array path nested value'
            }
          }
        }
      };
      rs = new ResourceStore(data);
    });

    it('should handle array paths with fallback', () => {
      expect(rs.getResource('en', 'ns1', ['nonexistent', 'child'])).to.equal('array path test value');
    });

    it('should handle array paths with existing parent', () => {
      expect(rs.getResource('en', 'ns1', ['parent', 'child'])).to.equal('array path nested value');
    });
  });

  describe('integration with translator (basic check)', () => {
    it('basic integration - resource store fallback works', () => {
      const data = {
        en: {
          translation: {
            hello: 'Hello',
            greeting: {
              world: 'Hello World'
            }
          }
        }
      };
      const rs = new ResourceStore(data);
      
      expect(rs.getResource('en', 'translation', 'nonexistent.hello')).to.equal('Hello');
    });
  });
});
