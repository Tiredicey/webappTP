import * as auth from './auth.js';
import { evaluate, CalcError } from './decimal.js';
import { snapshot, worldClock } from './clock.js';

const $ = (id) => document.getElementById(id);
const show = (el, on) => el.classList.toggle('hidden', !on);

let sessionStart = 0;
let authMethod = 'none';
let tickTimer = null;

// ---------------------------------------------------------------- routing ---

function goto(screen) {
  show($('login-screen'), screen === 'login');
  show($('app-screen'), screen === 'app');
  if (screen === 'app') {
    sessionStart = Date.now();
    startTick();
  } else {
    stopTick();
  }
}

// ------------------------------------------------------------------- auth ---

function setMsg(text, kind = 'info') {
  const el = $('login-message');
  el.textContent = text;
  el.dataset.kind = kind;
}

async function refreshLoginUi() {
  const enrolled = auth.isEnrolled();
  $('login-headline').textContent = enrolled
    ? 'Enter your PIN to continue'
    : 'Set a 6 to 12 digit PIN';
  show($('pin-confirm-row'), !enrolled);
  $('primary-btn').textContent = enrolled ? 'Unlock' : 'Save PIN';
  $('pbkdf2-note').textContent =
    `PBKDF2-HMAC-SHA256 · ${auth.iterations().toLocaleString()} iterations · 128-bit random salt`;

  show($('reset-btn'), enrolled);

  const bio = await auth.biometricAvailable();
  const canBio = bio.ok && enrolled;
  show($('biometric-btn'), canBio);
  if (enrolled && !bio.ok) {
    $('bio-note').textContent = `Biometric unavailable: ${bio.reason}`;
  } else if (canBio) {
    $('bio-note').textContent = auth.biometricEnrolled()
      ? 'Platform authenticator registered on this device.'
      : 'Tap to register this device\u2019s fingerprint or face.';
    $('biometric-btn').textContent = auth.biometricEnrolled()
      ? 'Unlock with biometric'
      : 'Register biometric';
  } else {
    $('bio-note').textContent = '';
  }

  const st = auth.lockState();
  if (st.locked) {
    setMsg(`Locked. Try again in ${Math.ceil(st.remainingMs / 1000)} s.`, 'error');
  }
}

async function onPrimary() {
  const pin = $('pin-input').value;
  if (!auth.cryptoAvailable()) {
    setMsg('Web Crypto is unavailable. Serve this page over HTTPS.', 'error');
    return;
  }

  if (!auth.isEnrolled()) {
    const confirmPin = $('pin-confirm').value;
    if (!/^\d{6,12}$/.test(pin)) {
      setMsg('PIN must be 6 to 12 digits.', 'error');
      return;
    }
    if (pin !== confirmPin) {
      setMsg('The two entries do not match.', 'error');
      return;
    }
    if (new Set(pin).size === 1) {
      setMsg('A PIN of one repeated digit is rejected.', 'error');
      return;
    }
    $('primary-btn').disabled = true;
    setMsg('Deriving key\u2026');
    const res = await auth.enroll(pin);
    $('primary-btn').disabled = false;
    $('pin-input').value = '';
    $('pin-confirm').value = '';
    setMsg(`PIN enrolled. Key derivation took ${res.ms} ms.`, 'ok');
    await refreshLoginUi();
    return;
  }

  if (pin.length < 6) {
    setMsg('PIN is too short.', 'error');
    return;
  }
  $('primary-btn').disabled = true;
  setMsg('Verifying\u2026');
  const res = await auth.verify(pin);
  $('primary-btn').disabled = false;
  $('pin-input').value = '';

  if (res.ok) {
    authMethod = `PIN (PBKDF2, ${res.ms} ms)`;
    setMsg('', 'info');
    goto('app');
    return;
  }
  if (res.reason === 'locked') {
    const secs = Math.ceil((res.remainingMs || auth.LOCKOUT_MS) / 1000);
    setMsg(`Too many attempts. Locked for ${secs} s.`, 'error');
  } else {
    setMsg(`Incorrect PIN. Attempt ${res.fails} of ${auth.MAX_FAILS}.`, 'error');
  }
}

async function onBiometric() {
  try {
    if (!auth.biometricEnrolled()) {
      setMsg('Follow the system prompt\u2026');
      const r = await auth.biometricEnroll();
      setMsg(`Biometric registered (credential ${r.id}).`, 'ok');
      await refreshLoginUi();
      return;
    }
    setMsg('Follow the system prompt\u2026');
    await auth.biometricVerify();
    authMethod = 'WebAuthn platform authenticator';
    setMsg('', 'info');
    goto('app');
  } catch (e) {
    setMsg(`Biometric stopped: ${e.name === 'NotAllowedError' ? 'cancelled or timed out' : e.message}`, 'error');
  }
}

// ------------------------------------------------------------- calculator ---

const KEYS = [
  'C', 'DEL', '(', ')',
  '7', '8', '9', '/',
  '4', '5', '6', '*',
  '1', '2', '3', '-',
  '0', '.', '%', '+',
];

let expr = '';

function buildKeypad() {
  const grid = $('keypad');
  grid.innerHTML = '';
  KEYS.forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = k;
    b.className = 'key';
    if ('/*-+%'.includes(k) && k.length === 1) b.classList.add('key-op');
    if (k === 'C' || k === 'DEL') b.classList.add('key-fn');
    b.addEventListener('click', () => onKey(k));
    grid.appendChild(b);
  });
}

function onKey(k) {
  if (k === 'C') expr = '';
  else if (k === 'DEL') expr = expr.slice(0, -1);
  else expr += k;
  renderCalc();
}

function renderCalc() {
  $('calc-expr').textContent = expr || '\u00a0';
  if (!expr) {
    $('calc-result').textContent = '0';
    $('calc-note').textContent = '';
    return;
  }
  try {
    $('calc-result').textContent = evaluate(expr).toString();
    $('calc-note').textContent = '';
  } catch (e) {
    // Incomplete input previews blank rather than showing a wrong number.
    $('calc-result').textContent = '';
    $('calc-note').textContent = '';
  }
}

function commit() {
  if (!expr) return;
  try {
    const v = evaluate(expr).toString();
    expr = v;
    $('calc-expr').textContent = '\u00a0';
    $('calc-result').textContent = v;
    $('calc-note').textContent = '';
  } catch (e) {
    $('calc-result').textContent = '';
    $('calc-note').textContent =
      e instanceof CalcError ? e.message : 'Invalid expression';
  }
}

function runSelfTest() {
  const cases = [
    ['0.1+0.2', '0.3'],
    ['0.3-0.1', '0.2'],
    ['1.1*3', '3.3'],
    ['2.675*100', '267.5'],
    ['1/3', '0.333333333333'],
    ['10/4', '2.5'],
    ['(2+3)*4', '20'],
    ['-5+8', '3'],
    ['50%', '0.5'],
    ['999999999999*999999999999', '999999999998000000000001'],
  ];
  const rows = cases.map(([input, want]) => {
    let got;
    try {
      got = evaluate(input).toString();
    } catch (e) {
      got = `error: ${e.message}`;
    }
    return { input, want, got, pass: got === want };
  });
  const errCases = [
    ['5/0', 'Division by zero'],
    ['(2+3', 'Unbalanced opening bracket'],
    ['2+3)', 'Unbalanced closing bracket'],
    ['1..2', 'Malformed number "1..2"'],
  ];
  errCases.forEach(([input, want]) => {
    let got;
    try {
      got = evaluate(input).toString();
    } catch (e) {
      got = e.message;
    }
    rows.push({ input, want, got, pass: got === want });
  });

  const tbody = $('selftest-body');
  tbody.innerHTML = '';
  let passed = 0;
  rows.forEach((r) => {
    if (r.pass) passed++;
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td><code>${r.input}</code></td><td><code>${r.want}</code></td>` +
      `<td><code>${r.got}</code></td>` +
      `<td class="${r.pass ? 'pass' : 'fail'}">${r.pass ? 'PASS' : 'FAIL'}</td>`;
    tbody.appendChild(tr);
  });
  $('selftest-summary').textContent = `${passed} of ${rows.length} passed`;
  $('selftest-summary').className = passed === rows.length ? 'pass' : 'fail';
  show($('selftest-wrap'), true);
}

// -------------------------------------------------------------- date/time ---

function startTick() {
  stopTick();
  tickTimer = setInterval(renderClock, 250);
  renderClock();
}

function stopTick() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
}

function renderClock() {
  const s = snapshot();
  $('clock-local').textContent = s.localText;
  $('clock-utc').textContent = s.utcText;
  $('clock-zone').textContent = `${s.zoneId} (UTC${s.offsetText})`;
  $('clock-zonename').textContent = s.zoneName;
  $('clock-epoch').textContent = s.epochMs.toLocaleString();
  $('clock-dst').textContent = s.observesDst
    ? (s.inDst ? 'observes DST \u2014 currently in DST' : 'observes DST \u2014 currently standard time')
    : 'does not observe DST';
  $('clock-locale').textContent = `${s.locale} \u00b7 ${s.calendar} \u00b7 ${s.numberingSystem}`;

  const wc = worldClock();
  $('world-body').innerHTML = wc
    .map((r) => `<tr><td>${r.label}</td><td><code>${r.zone}</code></td><td><code>${r.text}</code></td></tr>`)
    .join('');

  const secs = Math.floor((Date.now() - sessionStart) / 1000);
  $('session-method').textContent = authMethod;
  $('session-age').textContent = `${secs} s`;
}

// ------------------------------------------------------------------- init ---

function init() {
  buildKeypad();
  renderCalc();

  $('pin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    onPrimary();
  });
  $('biometric-btn').addEventListener('click', onBiometric);
  $('equals-btn').addEventListener('click', commit);
  $('selftest-btn').addEventListener('click', runSelfTest);
  $('logout-btn').addEventListener('click', () => {
    expr = '';
    renderCalc();
    authMethod = 'none';
    goto('login');
    refreshLoginUi();
  });
  $('reset-btn').addEventListener('click', () => {
    if (confirm('Delete the stored PIN digest and start over?')) {
      auth.reset();
      setMsg('Credential store cleared.', 'ok');
      refreshLoginUi();
    }
  });
  $('show-store-btn').addEventListener('click', () => {
    const d = auth.storeDebug();
    $('store-dump').textContent = d
      ? JSON.stringify(d, null, 2)
      : 'No credential stored yet.';
    show($('store-dump'), true);
  });

  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((x) => x.classList.add('hidden'));
      t.classList.add('active');
      $(t.dataset.target).classList.remove('hidden');
    });
  });

  if (!window.isSecureContext) {
    $('ctx-warn').textContent =
      'Not a secure context. WebAuthn needs HTTPS or localhost.';
    show($('ctx-warn'), true);
  }

  refreshLoginUi();
  goto('login');
}

document.addEventListener('DOMContentLoaded', init);
