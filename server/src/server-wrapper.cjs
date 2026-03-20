// CJS wrapper so Electron's utilityProcess.fork() can load the ESM server.js
// utilityProcess does not support ESM directly, but dynamic import() works.
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('[backend-wrapper] Failed to start server:', err);
    process.exit(1);
  }
})();
