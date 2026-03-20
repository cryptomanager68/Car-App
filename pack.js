/**
 * pack.js — builds Vite frontend, packages Electron app, copies server as
 * loose files into app.asar.unpacked/server (required for ESM + node_modules).
 * Targets < 100 MB installer by pruning devDeps and stripping unneeded files.
 */
const { packager } = require('@electron/packager');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmDir(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

(async () => {
  const appDir = __dirname;

  // ── 1. Install server production deps ──────────────────────────────────────
  console.log('Installing server production dependencies...');
  execSync('npm install --omit=dev --no-audit --no-fund', {
    cwd: path.join(appDir, 'server'),
    stdio: 'inherit'
  });

  // ── 2. Package Electron app ─────────────────────────────────────────────────
  const options = {
    dir: appDir,
    name: 'Car Rental App',
    platform: 'win32',
    arch: 'x64',
    out: path.join(appDir, 'release'),
    overwrite: true,
    asar: true,

    // Prune everything not needed in the asar
    ignore: [
      /^\/node_modules/,
      /^\/src/,
      /^\/server/,           // copied loose below
      /^\/release/,
      /^\/\.git/,
      /^\/public/,
      /^\/playwright/,
      /^\/vitest\.config/,
      /^\/tsconfig/,
      /^\/eslint\.config/,
      /^\/postcss\.config/,
      /^\/tailwind\.config/,
      /^\/vite\.config/,
      /^\/README/,
      /^\/EMAIL/,
      /^\/installer\.nsi/,
      /^\/build-installer\.js/,
      /^\/pack\.js/,
      /^\/components\.json/,
      /^\/index\.html/,
      /^\/package-lock\.json/,
      /^\/car\.jfif/,
      /^\/car-icon\.ico/,
      /^\/playwright-fixture/,
      /^\/playwright\.config/,
    ],

    // Strip debug symbols and reduce Electron size
    prune: true,
    derefSymlinks: true,

    // Exclude heavy/unused Electron internals
    icon: path.join(appDir, 'download.ico'),
  };

  console.log('Packaging Electron app...');
  const [appPath] = await packager(options);
  console.log('Packaged to:', appPath);

  // ── 3. Copy server (prod deps only) into app.asar.unpacked/server ──────────
  const serverSrc = path.join(appDir, 'server');
  const unpackedDest = path.join(appPath, 'resources', 'app.asar.unpacked', 'server');

  console.log('Copying server to:', unpackedDest);
  copyDirSync(serverSrc, unpackedDest);

  // Remove devDependencies from the copied server node_modules
  const serverDevDeps = ['nodemon'];
  for (const dep of serverDevDeps) {
    rmDir(path.join(unpackedDest, 'node_modules', dep));
  }

  // Remove test/doc files from server node_modules to save space
  const serverNM = path.join(unpackedDest, 'node_modules');
  if (fs.existsSync(serverNM)) {
    for (const pkg of fs.readdirSync(serverNM)) {
      const pkgDir = path.join(serverNM, pkg);
      for (const junk of ['test', 'tests', '__tests__', 'docs', 'example', 'examples', '.github']) {
        rmDir(path.join(pkgDir, junk));
      }
    }
  }

  // ── 4. Copy node.exe as car-rental-logger.exe for custom Task Manager name ──
  // Use the slim node.exe (no npm) for a much smaller footprint
  const slimNode = path.join(appDir, 'node-slim.exe');
  const nodeSrc = fs.existsSync(slimNode) ? slimNode : process.execPath;
  const nodeDest = path.join(unpackedDest, 'car-rental-logger.exe');
  console.log(`Copying ${path.basename(nodeSrc)} as car-rental-logger.exe...`);
  fs.copyFileSync(nodeSrc, nodeDest);
  console.log('✅ car-rental-logger.exe copied');

  // ── 5. Verify ───────────────────────────────────────────────────────────────
  const check = path.join(unpackedDest, 'src', 'server.js');
  if (fs.existsSync(check)) {
    console.log('✅ Server successfully copied to app.asar.unpacked/server');
  } else {
    console.error('❌ Server copy failed — server.js not found at', check);
    process.exit(1);
  }

  // ── 6. Report size ──────────────────────────────────────────────────────────
  function dirSizeMB(dir) {
    let total = 0;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, f.name);
      if (f.isDirectory()) total += dirSizeMB(fp);
      else total += fs.statSync(fp).size;
    }
    return total;
  }
  const mb = (dirSizeMB(appPath) / 1024 / 1024).toFixed(1);
  console.log(`\nPackaged app size: ${mb} MB  →  ${appPath}`);
})().catch(err => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
