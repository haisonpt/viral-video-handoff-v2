#!/usr/bin/env node
import { spawnSync } from 'child_process';

const bundleId = process.argv[2];
if (!bundleId) {
  console.error('Usage: node scripts/handoff-viral-bundle.mjs <bundle-id>');
  process.exit(1);
}

const verify = spawnSync('node', ['scripts/verify-viral-bundle.mjs', bundleId], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status || 1);

console.log('\n---\n');

const summary = spawnSync('node', ['scripts/show-viral-bundle-links.mjs', bundleId], { stdio: 'inherit' });
process.exit(summary.status || 0);
