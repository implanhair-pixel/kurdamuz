/**
 * Loaded via NODE_OPTIONS=--require into every Node.js subprocess.
 * 1. Suppresses spurious process.exit(0) calls in Next.js dev internals
 * 2. Adds a keepalive timer so event loop doesn't drain (fixes the router
 *    worker exiting due to all handles closing before the app is ready)
 */

// ── Suppress process.exit(0) ────────────────────────────────────────────────
const _exit = process.exit.bind(process);
process.exit = function patchedExit(code) {
  if (code === 0 || code === undefined) {
    process.stderr.write('[next-keepalive] Suppressed process.exit(' + code + ')\n');
    process.stderr.write(new Error('[next-keepalive] stack').stack + '\n');
    return; // Don't exit
  }
  _exit(code);
};

// ── Keepalive timer ─────────────────────────────────────────────────────────
// Prevents event loop drain in the router server worker subprocess.
// Only activate for long-running dev processes (skip webpack workers, etc.)
const isDevProcess = process.argv.some(a =>
  a.includes('next') || a.includes('server') || a.includes('worker')
);
if (isDevProcess) {
  const keepAlive = setInterval(() => { /* keep event loop alive */ }, 2000);
  // Allow clean shutdown when explicitly killed:
  process.on('SIGTERM', () => { clearInterval(keepAlive); _exit(0); });
  process.on('SIGINT',  () => { clearInterval(keepAlive); _exit(0); });
}
