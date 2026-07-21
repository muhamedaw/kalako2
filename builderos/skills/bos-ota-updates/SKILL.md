---
name: bos-ota-updates
description: Over-the-air updates for Capacitor apps (capgo/@capgo/capacitor-updater) — bundle build, version bumps, public bucket hosting, and the failure modes. Use for OTA, live update, capgo, ship-without-store, or app auto-update tasks.
---

# OTA Updates (capgo / capacitor-updater)

Ship web changes to installed apps without a Play Store review.

## The loop
1. Build the web bundle (`next build` + asset copy).
2. Zip it with FORWARD-SLASH paths only — Android unzip rejects `\` entries (this bug ships broken updates silently).
3. Bump a real version string every release; the updater compares versions, so a stale version = device never updates.
4. Upload the zip to your host and update the version-manifest JSON the app checks.
5. App checks the manifest on launch (and via a manual "check update" button) → downloads → applies on next restart.

## Failure modes (all have happened)
- **Wrong bucket**: the manual check button and the auto-check must point at the SAME public URL. A private bucket returns 403 and the update never lands. Verify the URL is publicly fetchable with curl.
- **Backslash zip**: see above — the #1 silent OTA failure on Windows-built bundles.
- **Version not bumped**: shipping new code under the same version = no-op. Bump on every ship, even trivial ones (a no-op marker commit is fine to force a fresh version).
- **Manifest/bundle mismatch**: the manifest version must match the uploaded zip's version, or clients loop.

## Guardrails
- Keep a `lib/cloud/ota-version.ts` single source of the current version; never hardcode it in two places.
- Test the full path: build → upload → real device pulls it → app shows new version. Emulator is not enough.
- Public bucket only for OTA payloads; never put secrets in the bundle.
