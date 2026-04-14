#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const bundleId = process.argv[2];
if (!bundleId) {
  console.error('Usage: node scripts/generate-viral-handoff-message.mjs <bundle-id>');
  process.exit(1);
}

const manifestPath = path.join(process.cwd(), 'server', 'runtime', bundleId, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest not found for bundle: ${bundleId}`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

const lines = [
  `Handoff-ready`,
  `Commit: ${commit}`,
  `Bundle: ${bundleId}`,
  `Title VI: ${manifest.titleVi || ''}`,
  `Final: ${manifest.outputUrl || ''}`,
  `Subtitle: ${manifest.subtitleUrl || ''}`,
  `Transcript: ${manifest.transcriptUrl || ''}`,
  `Thumbnail: ${manifest.thumbnailUrl || ''}`,
  `Manifest: /runtime/${bundleId}/manifest.json`,
  `Report: /runtime/${bundleId}/report.md`,
  `Bundle Viewer: /runtime/${bundleId}/bundle.html`,
];

console.log(lines.join('\n'));
