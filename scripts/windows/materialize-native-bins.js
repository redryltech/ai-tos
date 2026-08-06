/**
 * Windows + OneDrive + Smart App Control hardening.
 *
 * OneDrive places cloud reparse points on files under synced folders.
 * Smart App Control / Code Integrity then blocks spawn of unsigned native
 * binaries (notably turbo.exe) with Node errno UNKNOWN (-4094).
 *
 * This script rewrites *.exe under node_modules/.pnpm as plain local files
 * (same bytes, no cloud reparse), which restores spawn without changing
 * Turbo/pnpm architecture.
 *
 * Safe no-op on non-Windows and when no cloud reparse is present.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PNPM_DIR = path.join(ROOT, 'node_modules', '.pnpm');

function isWindows() {
  return process.platform === 'win32';
}

function underOneDrive(p) {
  const normalized = p.replace(/\//g, '\\').toLowerCase();
  return normalized.includes('\\onedrive\\');
}

function hasCloudReparse(filePath) {
  const result = spawnSync('fsutil', ['reparsepoint', 'query', filePath], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) return false;
  const out = `${result.stdout || ''}${result.stderr || ''}`;
  // OneDrive cloud filter tag family (e.g. 0x9000601a)
  return /Reparse Tag Value\s*:\s*0x9/i.test(out) || /Cloud/i.test(out);
}

function materializeExe(filePath) {
  const tmp = `${filePath}.__local_materialize__`;
  fs.copyFileSync(filePath, tmp);
  fs.rmSync(filePath, { force: true });
  fs.renameSync(tmp, filePath);
}

function walkExes(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkExes(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.exe')) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  if (!isWindows()) {
    process.exit(0);
  }

  if (!underOneDrive(ROOT)) {
    process.exit(0);
  }

  if (!fs.existsSync(PNPM_DIR)) {
    process.exit(0);
  }

  const exes = walkExes(PNPM_DIR);
  let fixed = 0;
  for (const exe of exes) {
    try {
      if (!hasCloudReparse(exe)) continue;
      materializeExe(exe);
      fixed += 1;
      process.stdout.write(`[materialize-native-bins] fixed cloud reparse: ${path.relative(ROOT, exe)}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[materialize-native-bins] skip ${exe}: ${message}\n`);
    }
  }

  if (fixed > 0) {
    process.stdout.write(`[materialize-native-bins] materialized ${fixed} native binary(ies)\n`);
  }
}

main();
