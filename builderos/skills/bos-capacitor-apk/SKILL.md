---
name: bos-capacitor-apk
description: Wrapping a Next.js/React web app as an Android APK with Capacitor — static export, sync, build, and the touch/tablet pitfalls. Use for any Capacitor, Android APK, tablet POS, or web-to-native wrapping task.
---

# Capacitor Android APK (Next.js)

## Build chain (get this order right)
1. `next build` with `output: "export"` in next.config — Capacitor ships static files, no Node server on device.
2. Copy any wasm/assets the export misses (e.g. `sql.js` .wasm) with a post-build script; `next export` does NOT bundle non-import assets.
3. `npx cap sync android` — copies web + updates native deps. Run after EVERY web change, not just once.
4. `cd android && ./gradlew assembleRelease` (or `assembleDebug`).

## Pitfalls (each has bitten real builds)
- **Zip/path separators**: any zip you build for OTA or assets must use forward slashes. Android's unzip rejects backslash entries — build zips with `/` even on Windows.
- **Async init race**: on cold start the WebView runs background tasks (reporters, schedulers) before the DB is ready. `await initLocalDb()` at the top of every background task, not just on first screen.
- **No SSR/dynamic**: `output: export` forbids server actions, `headers()`, ISR. Keep everything client-side or pre-rendered.
- **Storage**: use `@capacitor/preferences` for small config and a real DB (sql.js wasm in the WebView) for data — `localStorage` is wiped on some WebView updates.
- **Touch-first**: 44px min targets, no hover-only UI, `KeepScreenAwake` on the active screen, disable text selection/long-press callouts.

## Verify before shipping
- Install the APK on the real tablet, not just the emulator.
- Cold-start test: force-stop, reopen — data persists, no white screen, no race error.
