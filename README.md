# ISDemo — IT2222 Performance Task 1

## Project Overview
- **Name**: ISDemo
- **Goal**: Deliverables for IT2222 "Hardware and Software in Action" — one IS
  hardware item and one application software, three functions each, recorded by
  six members in under five minutes, plus the MS Word summary.
- **Hardware**: Smartphone — power on/off, camera, flashlight
- **Software**: ISDemo, this installable Android web app — authentication,
  calculator, date/time

## URLs
- **Live app (sandbox, temporary)**: https://3000-iccpg4c1uh11qb9tux2f4-ea026bf9.sandbox.novita.ai
- **Health check**: `/health`

The sandbox URL changes whenever the sandbox recycles. For a permanent URL,
deploy to Cloudflare Pages.

## Three software functions (all real, no mock-ups)

### 1. Login authentication
- PIN is **never stored**. Only a `PBKDF2-HMAC-SHA256` digest over a random
  128-bit salt, at 210,000 iterations, via the Web Crypto API.
- The "Show what is stored" button dumps the stored record on screen so an
  audience can confirm no PIN is present.
- Constant-time digest comparison (bitwise OR over full length).
- Five failed attempts trigger a 30-second lockout.
- Biometric path uses **WebAuthn** with a platform authenticator, so the real
  device fingerprint/face prompt appears. Availability is checked first via
  `isUserVerifyingPlatformAuthenticatorAvailable()`, falling back to PIN.

### 2. Calculator
- Exact decimal arithmetic on **scaled BigInt** values, so `0.1+0.2` returns
  `0.3` — native JS returns `0.30000000000000004`.
- Tokenizer → shunting-yard → RPN evaluation.
- Built-in self-test button runs **17 cases** live (13 value cases + 4 error
  cases) and reports pass/fail.
- Errors are handled, not crashed: `5/0` → "Division by zero"; unbalanced
  brackets report which side.

### 3. Date and time
- Local time, same instant in UTC, IANA zone id, raw Unix epoch (ms), long zone
  name, and DST state (detected by comparing January vs July offsets).
- Five-zone world clock showing one epoch value mapping to many local times.

## Data Architecture
- **Storage**: `localStorage` only — the PBKDF2 salt+digest record and the
  WebAuthn credential id. No backend, no database, no user data leaves the phone.
- **Server**: Hono on Cloudflare Pages serves the HTML shell and static ES
  modules. All three functions run entirely client-side.

## User Guide
1. Open the app URL in Chrome on an Android phone.
2. Menu → **Add to Home screen**, then launch from the icon (full screen, no
   URL bar — better for screen recording).
3. Enrol a 6–12 digit PIN, then tap **Show what is stored**.
4. Optionally register the biometric, then unlock with it.
5. In the app: run `0.1+0.2`, tap **Run arithmetic self-test**, then open the
   **Date & time** tab.

## Deliverables (`task/`)
| File | Purpose |
|---|---|
| `IT2222_PT1_Summary.docx` | The graded Word summary (7 + 8 sentences) |
| `SCRIPT_6_MEMBERS.md` | Timed narration, 6 members, 4:40 total |
| `make_summary.py` | Regenerates the .docx with your names/section |

Regenerate the summary with your details:
```bash
cd task && python3 make_summary.py \
  --section "BSIT 3-A" --instructor "Prof. Santos" \
  --members "Reyes,Santos,Cruz,Garcia,Lim,Tan" \
  --appurl "<your app url>"
```

## Runtime budget
| Video | Members | Duration |
|---|---|---|
| 1 — Hardware | 1, 2, 3 | 2:20 |
| 2 — Software | 4, 5, 6 | 2:20 |
| **Total** | | **4:40** (limit 5:00) |

## Verification status
- 17/17 arithmetic tests pass (`node` harness + in-app self-test)
- All 9 HTTP routes return 200
- Browser console: 0 errors, 0 warnings
- Every technical claim in the script cites a primary Android/AOSP source,
  fetched and confirmed (see References in `SCRIPT_6_MEMBERS.md`)

## Not yet implemented
- Cloudflare Pages deployment for a permanent URL
- A compiled native `.apk` (no Android SDK/Gradle in this sandbox — see the
  note in the chat summary)

## Deployment
- **Platform**: Cloudflare Pages (Hono + Vite), currently running locally under PM2
- **Status**: ✅ Active in sandbox
- **Tech Stack**: Hono, Vite, vanilla ES modules, Web Crypto, WebAuthn, Intl
- **Last Updated**: 4 September 2026
