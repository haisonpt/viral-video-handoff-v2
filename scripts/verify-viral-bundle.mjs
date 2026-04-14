#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const bundleId = process.argv[2];
if (!bundleId) {
  console.error('Usage: node scripts/verify-viral-bundle.mjs <bundle-id>');
  process.exit(1);
}

const bundleDir = path.join(process.cwd(), 'server', 'runtime', bundleId);
const requiredFiles = [
  'final.mp4',
  'final-with-voice.mp4',
  'subtitles.srt',
  'transcript.txt',
  'thumbnail.jpg',
  'manifest.json',
  'report.md',
  'bundle.html',
];

if (!fs.existsSync(bundleDir)) {
  console.error(`Bundle directory not found: ${bundleDir}`);
  process.exit(2);
}

const found = [];
const missing = [];
for (const file of requiredFiles) {
  const filePath = path.join(bundleDir, file);
  if (fs.existsSync(filePath)) found.push(file);
  else missing.push(file);
}

console.log(JSON.stringify({
  bundleId,
  bundleDir,
  found,
  missing,
  ok: missing.length === 0 || (missing.length === 1 && missing[0] === 'final.mp4'),
}, null, 2));
