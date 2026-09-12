# Hotdogdot Stats

## วิธีใช้งานเว็บ

เว็บใช้งานจริง: https://cookierun-stats.kidmiakk.chatgpt.site

หน้าแอดมิน: https://cookierun-stats.kidmiakk.chatgpt.site/admin

GitHub: https://github.com/DevD-Z/hotdogdot-stats

### ผู้ใช้ทั่วไป: ดูสถิติของ KEY ตัวเอง

1. ใช้แอป Android รุ่น 0.21 ขึ้นไปที่รองรับการส่งสถิติ และเข้าสู่แอปด้วย KEY ของคุณ
2. เปิดการแคสต์หน้าจอและเริ่มให้แอปทำงานในเกม
3. เปิดเว็บ แล้วกรอก KEY เดียวกับที่ใช้ในแอป กด **ดูสถิติของฉัน**
4. เว็บแสดงรอบที่จบ เวลาและกล่องของรอบปัจจุบัน/ล่าสุด กล่องแยกชนิด และประวัติเซสชันของ KEY นั้น
5. กด **อัปเดต** เมื่อต้องการโหลดข้อมูลใหม่ หรือรอเว็บอัปเดตอัตโนมัติทุก 60 วินาที
6. กด **ออกจากระบบ** เมื่อใช้เสร็จ โดยเฉพาะบนเครื่องที่ใช้ร่วมกัน

การเข้าสู่เว็บมีอายุ 5 นาที เมื่อหมดเวลาจะต้องกรอก KEY ใหม่ หน้าเว็บเปิดให้เข้าถึงได้ทั่วไป แต่ข้อมูลสถิติต้องผ่านการตรวจสิทธิ์ก่อนเสมอ

### แอดมิน: ดูข้อมูลทุก KEY

1. เปิดหน้า `/admin` หรือกด **แอดมิน** บนเว็บ
2. เข้าสู่ระบบด้วยบัญชี ChatGPT เจ้าของเว็บที่ผู้ดูแลกำหนดไว้
3. หน้าแอดมินแสดงเซสชันจากทุก KEY ที่ส่งข้อมูลเข้ามาแล้ว พร้อมรหัสทะเบียน KEY รอบที่จบ กล่อง และเวลาอัปเดต
4. ใช้ **ก่อนหน้า / ถัดไป** เพื่อดูข้อมูลเพิ่มเติม หนึ่งหน้าแสดงไม่เกิน 50 เซสชัน

KEY สำหรับเล่นเกมไม่ใช่รหัสผ่านแอดมิน ถ้าขึ้น **ไม่มีสิทธิ์แอดมิน** ให้กดเปลี่ยนบัญชีแล้วใช้บัญชีที่ได้รับอนุญาต การลงชื่อเข้าใช้ ChatGPT ด้วยบัญชีทั่วไปไม่ได้ให้สิทธิ์ดูทุก KEY

### อ่านตัวเลขอย่างไร

- **รอบที่จบในเซสชันล่าสุด**: จำนวนรอบที่แอปตรวจพบว่าจบแล้วในเซสชันนั้น
- **รอบปัจจุบัน / ล่าสุด**: เวลารอบจากข้อมูลที่แอปส่งครั้งล่าสุด ไม่ใช่นาฬิกาสดบนเว็บ
- **กล่องรอบนี้**: กล่องจากหน้ารางวัลของรอบล่าสุดที่แอปตรวจพบ
- **Mystery Box**: แยกไม้ เงิน ทอง รุ้ง และไม่ทราบชนิด ภาพที่ไม่มีผลตรวจที่น่าเชื่อถือจะไม่ถูกเพิ่มเป็นกล่องสมมุติ
- **กล่องรวมในหน้านี้**: รวมเฉพาะเซสชันที่อยู่ในหน้าปัจจุบัน เมื่อเปลี่ยนหน้าตัวเลขรวมอาจเปลี่ยนตาม
- **เซสชัน**: การทำงานของบริการแคสต์หน้าจอหนึ่งครั้ง เปิดบริการใหม่จะเริ่มเซสชันใหม่
- แอดมินเห็น **รหัสทะเบียน KEY** แทน KEY จริง จึงไม่ควรนำรหัสทะเบียนไปกรอกในช่อง Login

### ถ้ายังไม่เห็นสถิติ

1. ตรวจว่าใช้แอปรุ่นที่รองรับสถิติ และเว็บกับแอปใช้ KEY เดียวกัน
2. ตรวจว่าแอปยังมีสิทธิ์ใช้งาน อินเทอร์เน็ต และบริการแคสต์หน้าจอยังทำงาน
3. เริ่มเล่นแล้วรอประมาณ 1–2 นาที: แอปส่งข้อมูลประมาณทุก 60 วินาที และเว็บโหลดใหม่ทุก 60 วินาที
4. กด **อัปเดต** และดูเวลา **อัปเดตล่าสุด**; ข้อมูลเก่าไม่ได้หมายความว่าแอปยังทำงานอยู่
5. กล่องจะนับหลังแอปตรวจพบรอบที่จบและหน้ากล่องของรอบนั้น ไม่ใช่ทุกครั้งที่เห็นรูปกล่อง

ถ้าปิดแอปก่อนส่งข้อมูลรอบถัดไป ข้อมูลที่ยังไม่ส่งอาจสูญหาย เว็บไม่สามารถกู้ข้อมูลที่แอปยังไม่เคยส่งได้ และไม่มีสถิติย้อนหลังจากแอปรุ่นก่อนเริ่มรองรับการส่งข้อมูล

---

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
