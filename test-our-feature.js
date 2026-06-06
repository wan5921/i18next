import ResourceStore from './src/ResourceStore.js';

console.log('Testing path fallback functionality...');

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

const rs = new ResourceStore(data);

console.log('Test 1: finding existing nested child:');
const result1 = rs.getResource('en', 'ns1', 'parent.child');
console.log('Result:', result1, 'Expected: nested child value', 'Pass:', result1 === 'nested child value');

console.log('\nTest 2: finding root child when parent does not exist:');
const result2 = rs.getResource('en', 'ns1', 'nonexistent.child');
console.log('Result:', result2, 'Expected: direct child value', 'Pass:', result2 === 'direct child value');

console.log('\nTest 3: finding deep nested value:');
const result3 = rs.getResource('en', 'ns1', 'parent.deep.nested');
console.log('Result:', result3, 'Expected: deep nested value', 'Pass:', result3 === 'deep nested value');

console.log('\nTest 4: finding value through multiple missing segments:');
const result4 = rs.getResource('en', 'ns1', 'a.b.c.root');
console.log('Result:', result4, 'Expected: root value', 'Pass:', result4 === 'root value');

console.log('\nTest 5: array path fallback:');
const result5 = rs.getResource('en', 'ns1', ['nonexistent', 'direct']);
console.log('Result:', result5, 'Expected: direct value', 'Pass:', result5 === 'direct value');

console.log('\nAll tests completed!');
