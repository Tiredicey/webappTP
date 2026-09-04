// Date/time panel built on the real Intl and Date platform APIs.
// Shows local time, the same instant in UTC, the IANA zone id resolved by
// Intl.DateTimeFormat, the raw Unix epoch value, and the DST offset.

export function snapshot() {
  const now = new Date();
  const resolved = Intl.DateTimeFormat().resolvedOptions();
  const zoneId = resolved.timeZone;

  const localText = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const utcText = now.toISOString().replace('.000', '').replace(/\.\d{3}Z$/, 'Z');

  // getTimezoneOffset returns minutes BEHIND UTC, so invert the sign.
  const offMin = -now.getTimezoneOffset();
  const sign = offMin >= 0 ? '+' : '-';
  const abs = Math.abs(offMin);
  const offsetText = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;

  // Compare January and July offsets to detect whether the zone observes DST.
  const y = now.getFullYear();
  const janOff = -new Date(Date.UTC(y, 0, 1)).getTimezoneOffset();
  const julOff = -new Date(Date.UTC(y, 6, 1)).getTimezoneOffset();
  const observesDst = janOff !== julOff;
  const stdOff = Math.min(janOff, julOff);
  const inDst = observesDst && offMin > stdOff;

  const zoneName = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'long',
  })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName');

  return {
    epochMs: now.getTime(),
    localText,
    utcText,
    zoneId,
    offsetText,
    zoneName: zoneName ? zoneName.value : 'unavailable',
    observesDst,
    inDst,
    locale: resolved.locale,
    calendar: resolved.calendar,
    numberingSystem: resolved.numberingSystem,
  };
}

// Same instant rendered in several zones, to show that one epoch value maps
// to many local times.
const CITIES = [
  ['Asia/Manila', 'Manila'],
  ['UTC', 'UTC'],
  ['America/Los_Angeles', 'Los Angeles'],
  ['Europe/London', 'London'],
  ['Asia/Tokyo', 'Tokyo'],
];

export function worldClock(date = new Date()) {
  return CITIES.map(([zone, label]) => {
    let text;
    try {
      text = new Intl.DateTimeFormat(undefined, {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch (e) {
      text = 'unsupported';
    }
    return { zone, label, text };
  });
}
