import ResourceStore from './src/ResourceStore.js';

const rs = new ResourceStore({ en: { translation: { test: 'test' } } });

console.log('=== Test 1: addResourceBundle basic ===');
rs.addResourceBundle('en', 'translation', { something: 'deeper' });
const result1 = rs.getResource('en', 'translation');
console.log('Result:', JSON.stringify(result1));
console.log('Pass:', result1.something === 'deeper' && result1.test === 'test');

console.log('\n=== Test 2: addResourceBundle with dotted notation ===');
rs.addResourceBundle('en.translation', { something1: 'deeper1' });
const result2 = rs.getResource('en.translation');
console.log('Result:', JSON.stringify(result2));
console.log('Pass:', result2.something === 'deeper' && result2.something1 === 'deeper1' && result2.test === 'test');

console.log('\n=== Test 3: removeResourceBundle ===');
const rs2 = new ResourceStore({ en: { translation: { test: 'test' } } });
rs2.removeResourceBundle('en', 'translation');
const result3 = rs2.getResourceBundle('en', 'translation');
console.log('After remove:', result3);
console.log('Pass:', result3 === undefined || result3 === false);

console.log('\n=== Test 4: addResourceBundle with deep merge ===');
const rs3 = new ResourceStore({ en: { translation: { test: 'test' } } });
rs3.addResourceBundle('en', 'translation', { nested: { key: 'value' } }, true, true);
const result4 = rs3.getResource('en', 'translation');
console.log('Result:', JSON.stringify(result4));
console.log('Pass:', result4.nested.key === 'value' && result4.test === 'test');

console.log('\n=== Test 5: addResourceBundle with silent option ===');
let eventEmitted = false;
const rs4 = new ResourceStore({ en: { translation: { test: 'test' } } });
rs4.on('added', () => { eventEmitted = true; });
rs4.addResourceBundle('fr', 'translation', { hi: 'salut' }, true, true, { silent: true });
console.log('Event emitted:', eventEmitted);
console.log('Pass:', !eventEmitted);

console.log('\n=== Test 6: removeResourceBundle emits removed event ===');
let removedEmitted = false;
const rs5 = new ResourceStore({ en: { translation: { test: 'test' } } });
rs5.on('removed', () => { removedEmitted = true; });
rs5.removeResourceBundle('en', 'translation');
console.log('Removed event emitted:', removedEmitted);
console.log('Pass:', removedEmitted);

console.log('\n=== All tests completed ===');
