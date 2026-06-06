#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  const result = execSync(
    'node node_modules/vitest/vitest.mjs run --project runtime resourceStore',
    { cwd: '/app/i18next', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log('STDOUT:', result);
} catch (e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
  console.log('EXIT CODE:', e.status);
}
