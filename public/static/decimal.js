// Exact decimal arithmetic on scaled BigInt values.
// Avoids IEEE-754 binary floating point artefacts, e.g. 0.1 + 0.2 === 0.3.

const SCALE = 30n; // guard digits kept during division
const POW10 = [];
for (let i = 0; i <= 80; i++) POW10.push(10n ** BigInt(i));

function pow10(n) {
  return n <= 80 ? POW10[n] : 10n ** BigInt(n);
}

export class Dec {
  // value = unscaled / 10^exp
  constructor(unscaled, exp) {
    this.u = unscaled;
    this.e = exp;
  }

  static fromString(str) {
    const s = str.trim();
    if (!/^\d*\.?\d*$/.test(s) || s === '' || s === '.') {
      throw new CalcError(`Malformed number "${str}"`);
    }
    const dot = s.indexOf('.');
    if (dot === -1) return new Dec(BigInt(s), 0);
    const intPart = s.slice(0, dot) || '0';
    const fracPart = s.slice(dot + 1) || '0';
    return new Dec(BigInt(intPart + fracPart), fracPart.length);
  }

  static fromInt(n) {
    return new Dec(BigInt(n), 0);
  }

  // Re-express both operands at a common exponent.
  static align(a, b) {
    const e = Math.max(a.e, b.e);
    return [a.u * pow10(e - a.e), b.u * pow10(e - b.e), e];
  }

  add(o) {
    const [x, y, e] = Dec.align(this, o);
    return new Dec(x + y, e);
  }

  sub(o) {
    const [x, y, e] = Dec.align(this, o);
    return new Dec(x - y, e);
  }

  mul(o) {
    return new Dec(this.u * o.u, this.e + o.e);
  }

  div(o) {
    if (o.u === 0n) throw new CalcError('Division by zero');
    // (u1/10^e1) / (u2/10^e2) = (u1 * 10^(e2+SCALE)) / u2  at exp SCALE
    const num = this.u * pow10(o.e + Number(SCALE));
    const den = o.u;
    let q = num / den;
    const rem = num % den;
    // round half away from zero on the last guard digit
    if (rem !== 0n) {
      const twice = (rem < 0n ? -rem : rem) * 2n;
      const absDen = den < 0n ? -den : den;
      if (twice >= absDen) q += (num < 0n) !== (den < 0n) ? -1n : 1n;
    }
    return new Dec(q, this.e + Number(SCALE));
  }

  neg() {
    return new Dec(-this.u, this.e);
  }

  isZero() {
    return this.u === 0n;
  }

  // Strip trailing zeros in the fractional part.
  normalize() {
    let u = this.u;
    let e = this.e;
    while (e > 0 && u !== 0n && u % 10n === 0n) {
      u /= 10n;
      e--;
    }
    if (u === 0n) e = 0;
    return new Dec(u, e);
  }

  toString(maxFrac = 12) {
    let d = this.normalize();
    if (d.e > maxFrac) {
      // round to maxFrac decimals
      const drop = d.e - maxFrac;
      const p = pow10(drop);
      let u = d.u / p;
      const rem = d.u % p;
      if (rem !== 0n) {
        const twice = (rem < 0n ? -rem : rem) * 2n;
        if (twice >= p) u += d.u < 0n ? -1n : 1n;
      }
      d = new Dec(u, maxFrac).normalize();
    }
    const neg = d.u < 0n;
    let digits = (neg ? -d.u : d.u).toString();
    if (d.e === 0) return (neg ? '-' : '') + digits;
    while (digits.length <= d.e) digits = '0' + digits;
    const cut = digits.length - d.e;
    const out = digits.slice(0, cut) + '.' + digits.slice(cut);
    return (neg ? '-' : '') + out;
  }
}

export class CalcError extends Error {}

// ---- tokenizer -> shunting-yard -> RPN evaluation ----

const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, u: 3 };

function tokenize(input) {
  const out = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === ' ') { i++; continue; }
    if (/[\d.]/.test(c)) {
      let j = i;
      let dots = 0;
      while (j < input.length && /[\d.]/.test(input[j])) {
        if (input[j] === '.') dots++;
        j++;
      }
      const lit = input.slice(i, j);
      if (dots > 1) throw new CalcError(`Malformed number "${lit}"`);
      out.push({ t: 'num', v: Dec.fromString(lit) });
      i = j;
      continue;
    }
    if (c === '(') { out.push({ t: 'lp' }); i++; continue; }
    if (c === ')') { out.push({ t: 'rp' }); i++; continue; }
    if (c === '%') { out.push({ t: 'pct' }); i++; continue; }
    if ('+-*/'.includes(c)) {
      const prev = out[out.length - 1];
      const unary =
        c === '-' && (!prev || prev.t === 'lp' || prev.t === 'op');
      out.push({ t: 'op', v: unary ? 'u' : c });
      i++;
      continue;
    }
    throw new CalcError(`Unexpected character "${c}"`);
  }
  return out;
}

function toRpn(tokens) {
  const out = [];
  const stack = [];
  for (const tk of tokens) {
    if (tk.t === 'num') {
      out.push(tk);
    } else if (tk.t === 'pct') {
      out.push(tk); // postfix: applies to the value already emitted
    } else if (tk.t === 'op') {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (
          top.t === 'op' &&
          (PREC[top.v] > PREC[tk.v] ||
            (PREC[top.v] === PREC[tk.v] && tk.v !== 'u'))
        ) {
          out.push(stack.pop());
        } else break;
      }
      stack.push(tk);
    } else if (tk.t === 'lp') {
      stack.push(tk);
    } else if (tk.t === 'rp') {
      let matched = false;
      while (stack.length) {
        const top = stack.pop();
        if (top.t === 'lp') { matched = true; break; }
        out.push(top);
      }
      if (!matched) throw new CalcError('Unbalanced closing bracket');
    }
  }
  while (stack.length) {
    const top = stack.pop();
    if (top.t === 'lp') throw new CalcError('Unbalanced opening bracket');
    out.push(top);
  }
  return out;
}

const HUNDRED = Dec.fromInt(100);

function evalRpn(rpn) {
  const st = [];
  for (const tk of rpn) {
    if (tk.t === 'num') {
      st.push(tk.v);
    } else if (tk.t === 'pct') {
      const a = st.pop();
      if (!a) throw new CalcError('Missing operand for %');
      st.push(a.div(HUNDRED));
    } else if (tk.t === 'op') {
      if (tk.v === 'u') {
        const a = st.pop();
        if (!a) throw new CalcError('Missing operand for negation');
        st.push(a.neg());
      } else {
        const b = st.pop();
        const a = st.pop();
        if (!a || !b) throw new CalcError('Incomplete expression');
        if (tk.v === '+') st.push(a.add(b));
        else if (tk.v === '-') st.push(a.sub(b));
        else if (tk.v === '*') st.push(a.mul(b));
        else st.push(a.div(b));
      }
    }
  }
  if (st.length !== 1) throw new CalcError('Incomplete expression');
  return st[0];
}

export function evaluate(input) {
  const tokens = tokenize(input);
  if (!tokens.length) throw new CalcError('Nothing to evaluate');
  return evalRpn(toRpn(tokens));
}
