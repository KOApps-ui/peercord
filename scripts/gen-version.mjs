#!/usr/bin/env node
/**
 * PeerCord — Sürüm Bilgisi Üretici
 * package.json versiyonü + commit sha + build zamanı + GitHub URL üretir
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// Commit SHA - git ile al
let commitSha;
try {
  commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch {
  commitSha = 'local-' + Date.now().toString(36).slice(-6);
}

// Build zamanı
const buildTime = new Date().toISOString();

// GitHub repo URL (CI ortamında)
const repoUrl = process.env.GITHUB_REPOSITORY 
  ? `https://github.com/${process.env.GITHUB_REPOSITORY}` 
  : 'https://github.com/KOApps-ui/peercord';

// Release notları - commit'lardan al veya elle tanıla
const notes = process.env.RELEASE_NOTES || 'Yeni sürüm yayınlandı';

// Version JSON yapısı
const versionData = {
  version: commitSha,
  buildTime,
  notes,
  repoUrl,
};

// public/version.json dosyasına yaz
const publicDir = join(repoRoot, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

const versionPath = join(publicDir, 'version.json');
writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log(`✓ Sürüm bilgisi üretildi: ${commitSha}`);
console.log(`  Build zamanı: ${buildTime}`);
console.log(`  Dosya: ${versionPath}`);