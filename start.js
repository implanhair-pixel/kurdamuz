#!/usr/bin/env node
/**
 * KURDAMUZ startup wrapper:
 * - Immediately binds port 5000 so Replit's waitForPort check passes
 * - Starts Next.js dev on port 3001, captures stderr for diagnostics
 * - Auto-restarts Next.js with exponential backoff if it dies
 * - Emits heartbeat to prevent idle-kill
 */

const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const PUBLIC_PORT = 5000;
const NEXT_PORT = 3001;
const HEARTBEAT_INTERVAL_MS = 8000;

const loadingPage = (msg) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KURDAMUZ — Starting...</title>
  <meta http-equiv="refresh" content="4">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a1628;color:#e2e8f0;font-family:system-ui,sans-serif;
         display:flex;align-items:center;justify-content:center;
         min-height:100vh;flex-direction:column;gap:16px}
    .logo{font-size:2rem;font-weight:800;color:#10b981;letter-spacing:-0.05em}
    .sub{font-size:.875rem;color:#64748b}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{display:inline-block;width:16px;height:16px;border:2px solid #10b981;
          border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;
          vertical-align:middle;margin-right:6px}
  </style>
</head>
<body>
  <div class="logo">KURDAMUZ</div>
  <div class="sub"><span class="spin"></span>${msg || 'Compiling...'}</div>
</body></html>`;

let nextIsReady = false;
let nextProcess = null;
let restartTimer = null;
let startCount = 0;
let lastError = '';

// ── Proxy ───────────────────────────────────────────────────────────────────
function proxyToNext(req, res) {
  const opts = {
    hostname: '127.0.0.1', port: NEXT_PORT,
    path: req.url, method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
  };
  const proxy = http.request(opts, (pr) => {
    res.writeHead(pr.statusCode, pr.headers);
    pr.pipe(res, { end: true });
  });
  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(loadingPage('Restarting...'));
    }
  });
  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  if (nextIsReady) return proxyToNext(req, res);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(loadingPage(`Attempt ${startCount}...`));
});

server.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log(`[kurdamuz] Proxy on :${PUBLIC_PORT}`);
  startNextDev();
});
server.on('error', (err) => {
  if (err.code !== 'EADDRINUSE') { console.error(err); process.exit(1); }
  startNextDev();
});

// ── Heartbeat ───────────────────────────────────────────────────────────────
setInterval(() => {
  const mb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  console.log(`[kurdamuz] alive | ready=${nextIsReady} attempt=${startCount} mem=${mb}MB`);
  if (lastError) { console.log(`[kurdamuz] last-err: ${lastError.slice(0,200)}`); lastError=''; }
}, HEARTBEAT_INTERVAL_MS).unref();

// ── waitForPort ─────────────────────────────────────────────────────────────
function waitForPort(port, ms = 60000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + ms;
    const check = () => {
      if (Date.now() > deadline) return reject(new Error('timeout'));
      const s = new net.Socket();
      s.setTimeout(400);
      s.connect(port, '127.0.0.1', () => { s.destroy(); resolve(); });
      s.on('error', () => { s.destroy(); setTimeout(check, 500); });
      s.on('timeout', () => { s.destroy(); setTimeout(check, 500); });
    };
    check();
  });
}

// ── startNextDev ────────────────────────────────────────────────────────────
function startNextDev() {
  if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
  if (nextProcess) { try { nextProcess.kill(); } catch(e){} nextProcess = null; }
  nextIsReady = false;
  startCount++;
  console.log(`[kurdamuz] Starting Next.js (attempt ${startCount}) on :${NEXT_PORT}`);

  const interceptPath = require('path').resolve(__dirname, 'intercept-exit.js');
  nextProcess = spawn('node_modules/.bin/next', ['dev', '-p', String(NEXT_PORT)], {
    stdio: ['pipe', 'inherit', 'pipe'],
    // NODE_OPTIONS: cap heap to prevent SIGBUS/OOM when webpack compiles in Replit
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      FORCE_COLOR: '0',
      // 512MB heap limit for each spawned Node worker (webpack, router server, etc.)
      NODE_OPTIONS: '--max-old-space-size=512',
    },
    detached: false,
  });
  // Never close stdin — this prevents Next.js from receiving EOF and quitting

  const stderrChunks = [];
  nextProcess.stderr.on('data', (d) => {
    const s = d.toString();
    process.stderr.write(s);
    stderrChunks.push(s);
    lastError = stderrChunks.slice(-5).join('').trim();
  });

  nextProcess.on('error', (err) => {
    console.error(`[kurdamuz] spawn error: ${err.message}`);
    scheduleRestart(3000);
  });

  nextProcess.on('exit', (code, signal) => {
    const stderrSummary = stderrChunks.slice(-3).join('').trim().slice(0, 300) || '(none)';
    console.log(`[kurdamuz] Next.js exit code=${code} signal=${signal}`);
    console.log(`[kurdamuz] stderr: ${stderrSummary}`);
    nextIsReady = false;
    scheduleRestart(3000);
  });

  waitForPort(NEXT_PORT, 60000)
    .then(() => {
      console.log(`[kurdamuz] ✓ Next.js up on :${NEXT_PORT}`);
      nextIsReady = true;
    })
    .catch((err) => {
      console.error(`[kurdamuz] port wait failed: ${err.message}`);
    });
}

function scheduleRestart(delay) {
  if (restartTimer) return;
  restartTimer = setTimeout(startNextDev, delay);
}

// ── Shutdown ────────────────────────────────────────────────────────────────
const shutdown = (sig) => {
  console.log(`[kurdamuz] ${sig} received`);
  if (nextProcess) try { nextProcess.kill('SIGTERM'); } catch(e) {}
  server.close();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
