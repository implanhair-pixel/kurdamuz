---
name: KURDAMUZ Replit SWC Fix
description: Why Next.js 14.2.30 crashes on Replit and what fixes it — critical for any dependency or Next.js upgrade
---

## The Problem
Both `@next/swc-linux-x64-gnu` and `@next/swc-linux-x64-musl` native binaries cause **SIGBUS** (Bus Error, signal 7) when loaded on Replit's NixOS environment. This kills the entire Next.js process silently (exit code 0, no stderr). The crash happens in the router server worker and build workers, preventing any compilation.

**Why:** NixOS glibc ABI incompatibility with the pre-built SWC binary.

## The Fix (all three parts required)

1. **Rename both broken native binaries** (prevents SIGBUS, turns load failure into catchable MODULE_NOT_FOUND):
   - `node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node` → `.node.bak`
   - `node_modules/@next/swc-linux-x64-musl/next-swc.linux-x64-musl.node` → `.node.bak`

2. **Add `.babelrc`** at project root to force Babel compilation:
   ```json
   { "presets": ["next/babel"] }
   ```

3. **Pin `@babel/runtime@7.23.9`** — v8.x removed the `./regenerator` subpath export which Next.js client code requires. Install with `npm install --save-dev @babel/runtime@7.23.9`.

## Other startup fixes
- `next.config.js`: use `createNextIntlPlugin` (safe now that SWC is off) — without it, next-intl throws "Couldn't find config file" at runtime
- `start.js`: proxy wrapper on port 5000, Next.js on 3001; keepalive timer prevents event loop drain; `webpack.parallelism = 1` in next.config.js reduces memory pressure
- `src/db/index.ts`: stubs all DB calls when DATABASE_URL contains "helium" or "placeholder"

**Why keepalive in start.js:** Without the keepalive setInterval in intercept-exit.js, the main Next.js process's event loop drains when the router worker exits (even temporarily), causing silent exit code 0.

## If dependencies are re-installed
After any `npm install` or `pnpm install`, the `.node.bak` rename must be re-applied. Consider adding a postinstall script.
