import { Hono } from 'hono'

const app = new Hono()

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#16211b">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>ISDemo</title>
<link rel="manifest" href="/static/manifest.webmanifest">
<link rel="icon" href="/static/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/static/icon.svg">
<link rel="stylesheet" href="/static/style.css">
</head>
<body>

<div class="appbar">
  <span class="dot"></span>
  <h1>ISDemo</h1>
  <span class="spacer"></span>
  <span class="badge">IT2222</span>
</div>

<div class="wrap">

  <div id="ctx-warn" class="warn hidden"></div>

  <!-- ============ LOGIN ============ -->
  <section id="login-screen">
    <div class="card">
      <div class="logo-lock">&#128274;</div>
      <h2>Function 1 &middot; Login authentication</h2>
      <p id="login-headline" style="margin:0 0 14px;font-size:15px"></p>

      <form id="pin-form" onsubmit="return false">
      <div class="row">
        <label for="pin-input">PIN</label>
        <input id="pin-input" type="password" inputmode="numeric"
               autocomplete="off" maxlength="12" placeholder="******">
      </div>

      <div class="row hidden" id="pin-confirm-row">
        <label for="pin-confirm">Confirm PIN</label>
        <input id="pin-confirm" type="password" inputmode="numeric"
               autocomplete="off" maxlength="12" placeholder="******">
      </div>

      <div class="row"><button id="primary-btn" type="submit" class="btn-primary">Unlock</button></div>
      </form>
      <div class="row"><button id="biometric-btn" class="btn-ghost hidden">Register biometric</button></div>

      <div id="login-message" class="msg"></div>
      <div id="bio-note" class="note"></div>
      <div id="pbkdf2-note" class="note"></div>

      <h3>Stored credential</h3>
      <div class="note">The PIN is never saved. Only the derived digest and its
        random salt are written to storage &mdash; inspect them yourself:</div>
      <div class="row" style="margin-top:10px">
        <button id="show-store-btn" class="btn-ghost">Show what is stored</button>
      </div>
      <pre id="store-dump" class="hidden"></pre>
      <div class="row"><button id="reset-btn" class="btn-danger hidden">Reset credential</button></div>
    </div>
  </section>

  <!-- ============ APP ============ -->
  <section id="app-screen" class="hidden">
    <div class="tabs">
      <button class="tab active" data-target="panel-calc">Calculator</button>
      <button class="tab" data-target="panel-time">Date &amp; time</button>
      <button class="tab" data-target="panel-session">Session</button>
    </div>

    <!-- calculator -->
    <div id="panel-calc" class="panel card">
      <h2>Function 2 &middot; Calculator</h2>
      <div id="calc-expr" class="calc-expr">&nbsp;</div>
      <div id="calc-result" class="calc-result">0</div>
      <div id="keypad"></div>
      <button id="equals-btn" class="btn-primary">=</button>
      <div id="calc-note" class="msg" data-kind="error"></div>
      <div class="note">Exact decimal arithmetic on scaled BigInt values, so
        <code>0.1+0.2</code> returns <code>0.3</code> rather than
        <code>0.30000000000000004</code>. Parsed with the shunting-yard
        algorithm into RPN.</div>
      <div class="row" style="margin-top:12px">
        <button id="selftest-btn" class="btn-ghost">Run arithmetic self-test</button>
      </div>
      <div id="selftest-wrap" class="hidden">
        <h3>Self-test &mdash; <span id="selftest-summary"></span></h3>
        <table>
          <thead><tr><th>Input</th><th>Expected</th><th>Actual</th><th></th></tr></thead>
          <tbody id="selftest-body"></tbody>
        </table>
      </div>
    </div>

    <!-- date & time -->
    <div id="panel-time" class="panel card hidden">
      <h2>Function 3 &middot; Date and time</h2>
      <div id="clock-local" class="big-time"></div>
      <div class="kv">
        <div>UTC instant</div><div id="clock-utc"></div>
        <div>IANA zone</div><div id="clock-zone"></div>
        <div>Zone name</div><div id="clock-zonename"></div>
        <div>Unix epoch (ms)</div><div id="clock-epoch"></div>
        <div>DST</div><div id="clock-dst"></div>
        <div>Locale</div><div id="clock-locale"></div>
      </div>
      <h3>Same instant, five zones</h3>
      <table>
        <thead><tr><th>City</th><th>Zone</th><th>Local time</th></tr></thead>
        <tbody id="world-body"></tbody>
      </table>
      <div class="note">Android tracks the current Unix epoch time and the
        current time zone as two separate device-wide states. Change your zone
        in Settings and the epoch value keeps counting while the local time
        jumps.</div>
    </div>

    <!-- session -->
    <div id="panel-session" class="panel card hidden">
      <h2>Session</h2>
      <div class="kv">
        <div>Authenticated by</div><div id="session-method"></div>
        <div>Session age</div><div id="session-age"></div>
      </div>
      <div class="row" style="margin-top:16px">
        <button id="logout-btn" class="btn-ghost">Lock session</button>
      </div>
      <div class="note">Locking clears the calculator state and returns to the
        PIN screen. The stored digest is untouched.</div>
    </div>
  </section>

  <p class="note center" style="margin-top:20px">
    ISDemo &middot; no camera, location, or contacts permission requested
  </p>
</div>

<script type="module" src="/static/app.js"></script>
</body>
</html>`

app.get('/', (c) => c.html(PAGE))

// Served from the worker: _routes.json only excludes /static/*, so a file at
// the dist root would still be routed here.
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#16211b"/>
  <rect x="146" y="232" width="220" height="170" rx="26" fill="#5ec98b"/>
  <path d="M196 232v-42a60 60 0 0 1 120 0v42" fill="none" stroke="#5ec98b" stroke-width="30" stroke-linecap="round"/>
  <circle cx="256" cy="304" r="20" fill="#16211b"/>
  <rect x="246" y="316" width="20" height="46" rx="10" fill="#16211b"/>
</svg>`

app.get('/favicon.ico', (c) =>
  new Response(ICON, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
)

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

export default app
