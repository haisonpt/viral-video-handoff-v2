#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const bundleId = process.argv[2];
if (!bundleId) {
  console.error('Usage: node scripts/show-viral-bundle-links.mjs <bundle-id>');
  process.exit(1);
}

const bundleDir = path.join(process.cwd(), 'server', 'runtime', bundleId);
const manifestPath = path.join(bundleDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest not found for bundle: ${bundleId}`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const lines = [
  `Bundle: ${bundleId}`,
  `Title VI: ${manifest.titleVi || ''}`,
  `Title EN: ${manifest.titleEn || ''}`,
  `Final: ${manifest.outputUrl || ''}`,
  `Subtitle: ${manifest.subtitleUrl || ''}`,
  `Transcript: ${manifest.transcriptUrl || ''}`,
  `Thumbnail: ${manifest.thumbnailUrl || ''}`,
  `Manifest: /runtime/${bundleId}/manifest.json`,
  `Report: /runtime/${bundleId}/report.md`,
  `Bundle Viewer: /runtime/${bundleId}/bundle.html`,
];
console.log(lines.join('\n'));
