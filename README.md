# Hotdogdot Stats

Thai CookieRun statistics dashboard. This repository contains **only the website**, not the Android bot, APKs, license signing keys, production database, or license backend source.

## Access

- `/`: enter your game license KEY. The existing license backend verifies it with LicenseGate. The browser receives a five-minute Secure/HttpOnly/SameSite=Strict cookie, never a raw KEY in storage or a URL.
- `/admin`: ChatGPT sign-in, followed by a server-side administrator allowlist check. A game KEY cannot grant administrator access. An empty admin setting denies everyone.
- Users see only their license's sessions. Administrators see all licenses with submitted sessions, identified by registration ID, not the plaintext KEY.
- Statistics refresh every 60 seconds. Empty data is shown honestly; there is no demo data or fabricated box count.

## Local development

Requires Node 24 and npm. Copy `.env.example` to local `.env` and provide your existing backend URL, dedicated server-to-server bridge secret, and admin account email. Never commit real values. Configure matching production values through Sites runtime settings. The bridge secret must match the license backend's `WEB_BRIDGE_SECRET`.

```powershell
npm ci
npm run dev -- --host 127.0.0.1
npm test
npm run typecheck
npm run build
```

The API smoke tests expect the local development server on `http://localhost:3000`; override `TEST_ORIGIN` for a dedicated test server. Do not supply real license keys to tests.

Sites owns production sign-in and injects authenticated user headers. A standalone deployment must NOT trust headers supplied directly by a browser; replace that authentication integration before hosting outside Sites. The local development identity is test-only and is not an administrator by default.

## Existing license backend contract

The website server calls the fixed HTTPS backend paths below, using `Authorization: Bearer <WEB_BRIDGE_SECRET>`. That credential is never exposed in browser bundles.

- `POST /v1/web/login`: `{ key, client }` → `{ token, expiresIn }`
- `POST /v1/web/stats`: `{ token, offset, client }` → viewer-scoped sessions
- `POST /v1/web/admin`: `{ offset, client }` → all sessions, only after website administrator authorization

Responses contain `sessions`, `latest`, and `hasMore`. Pages contain at most 50 sessions. Each session has `session`, `startedAt` (milliseconds), `updatedAt` (seconds), and 14 integer `values`: observed rounds, completed rounds, active flag, last/current round elapsed milliseconds, five session box totals (wood/silver/gold/rainbow/unknown), and five current-round box totals. Admin responses also contain the hashed `license` registration identifier. The required `play_stats` schema and API implementation remain in the separate private license-backend project.

Current Android telemetry is sent on license renewal. Closing the app before its next upload can lose unsent data; this site cannot recover data the app never submitted. A new capture service creates a new session. Runtime information is client-observed, not anti-cheat proof.

## Publishing

Build the website and deploy the validated artifact with Sites. Keep `.openai/hosting.json` tied to the existing site; do not register another site for an update. Production variables belong in Sites, not that manifest or GitHub. Deploying to public access opens the login page, not protected statistics.
