---
name: bos-sqlite-hybrid
description: Running SQLite in two runtimes from one codebase — better-sqlite3 (native, for Node tests/build) and sql.js (wasm, in the browser/WebView/APK). Use for local-first SQLite, offline database, sql.js, better-sqlite3, or WebView persistence tasks.
---

# Hybrid SQLite (native + wasm)

One data layer that runs as native SQLite in Node (fast tests, build scripts) and
as sql.js (wasm) inside the browser/Capacitor WebView.

## Architecture
- Put ALL SQL behind one module (`lib/localdb/`) with an async init and a small
  typed API (`query`, `run`, `tx`). Callers never touch the driver directly.
- Pick the driver at runtime: `typeof window === "undefined"` → better-sqlite3;
  else load sql.js and its `.wasm`. Keep the SQL strings identical for both.
- `initLocalDb()` is async (wasm load is async). Everything that touches the DB
  must `await` it first — background tasks especially (they fire before the UI).

## Pitfalls
- **wasm not bundled**: `next build`/export won't copy `sql.js`'s `.wasm` — add a
  post-build copy script and verify the file is in `out/` and in the APK.
- **Persistence in wasm**: sql.js is in-memory. You must export the DB bytes and
  write them (Capacitor Filesystem / better-sqlite3 file) on every mutation or on
  a debounce; load them back on init. Forgetting this = data lost on reload.
- **Ordering non-determinism**: synchronous in-process SQLite can close rows in the
  same millisecond; add a `rowid`/id tiebreaker to every `ORDER BY <time>` or
  pagination silently corrupts on repeat queries.
- **Type drift**: better-sqlite3 and sql.js return slightly different types (e.g.
  integers vs. numbers, BLOB handling). Normalize at the data-layer boundary.

## Test it
- Unit-test the data layer under better-sqlite3 (fast, native).
- Add one integration test that exercises export → reload → query to catch the
  persistence path the unit tests skip.
