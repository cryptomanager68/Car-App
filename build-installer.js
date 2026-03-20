/**
 * build-installer.js — builds a Windows NSIS installer using the locally
 * cached makensis.exe from electron-builder's cache.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const NSIS_CACHE = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
  'electron-builder', 'Cache', 'nsis', 'nsis-3.0.4.1'
);
const MAKENSIS = path.join(NSIS_CACHE, 'makensis.exe');
const NSI_SCRIPT = path.join(__dirname, 'installer.nsi');
const APP_FOLDER = path.join(__dirname, 'release', 'Car Rental App-win32-x64');

if (!fs.existsSync(APP_FOLDER)) {
  console.error('App folder not found. Run "npm run electron:build" first.');
  process.exit(1);
}

if (!fs.existsSync(MAKENSIS)) {
  console.error('makensis.exe not found at:', MAKENSIS);
  console.error('Tip: run the full build once with electron-builder to populate the cache,');
  console.error('or download nsis-3.0.4.1 manually to that path.');
  process.exit(1);
}

console.log('Building installer with NSIS (LZMA compression)...');
const result = spawnSync(MAKENSIS, ['/V3', NSI_SCRIPT], {
  stdio: 'inherit',
  cwd: __dirname
});

if (result.status !== 0) {
  console.error('NSIS build failed');
  process.exit(1);
}

const outExe = path.join(__dirname, 'release', 'Car Rental App Setup.exe');
if (fs.existsSync(outExe)) {
  const sizeMB = (fs.statSync(outExe).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Installer ready: ${outExe}`);
  console.log(`   Size: ${sizeMB} MB`);
  if (parseFloat(sizeMB) > 100) {
    console.warn(`⚠️  Installer exceeds 100 MB target (${sizeMB} MB)`);
  }
} else {
  console.error('Installer file not found after build.');
  process.exit(1);
}
