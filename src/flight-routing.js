"use strict";

// Minimal hub-connection generator for routes missing in the dataset.
// Produces 1-stop itineraries via major hubs with realistic block time + layover.

const HUB_CITIES_DEFAULT = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];

// Airport coordinates (lat, lon) for IATA codes used by this project.
// Values are approximate; good enough for realistic block-time estimates.
const IATA_COORDS = {
  DEL: [28.5562, 77.1],
  BOM: [19.0896, 72.8656],
  BLR: [13.1986, 77.7066],
  HYD: [17.2403, 78.4294],
  MAA: [12.9941, 80.1709],
  CCU: [22.6547, 88.4467],
  GOI: [15.3800, 73.8330],
  JAI: [26.8242, 75.8122],
  AMD: [23.0734, 72.6266],
  PNQ: [18.5821, 73.9197],
  LKO: [26.7606, 80.8893],
  VNS: [25.4524, 82.8593],
  ATQ: [31.7096, 74.7973],
  IXL: [34.1359, 77.5465],
  SLV: [31.0818, 77.0680],
  KUU: [31.8767, 77.1544],
  AGR: [27.1558, 77.9609],
  UDR: [24.6177, 73.8961],
  JDH: [26.2511, 73.0489],
  DED: [30.1897, 78.1803],
  COK: [10.1520, 76.4019],
  IXM: [9.8345, 78.0934],
  MYQ: [12.2300, 76.6558],
  TIR: [13.6325, 79.5433],
  VTZ: [17.7212, 83.2245],
  TRV: [8.4821, 76.9201],
  PNY: [11.9680, 79.81],
  CJB: [11.03, 77.0434],
  MDU: [9.8345, 78.0934],
  HBX: [15.3617, 75.0849],
  IXZ: [11.6410, 92.7297],
  IXB: [26.6812, 88.3286],
  GAU: [26.1061, 91.5859],
  JRH: [26.7315, 94.1755],
  SHL: [25.7036, 91.9787],
  BBI: [20.2444, 85.8178],
  BHJ: [23.2878, 69.6702],
  DIU: [20.7131, 70.9211],
  AGX: [10.8237, 72.1760],
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function getIataForCity(airports, cityName) {
  const rec = airports && cityName ? airports[cityName] : null;
  return rec && rec.iata ? String(rec.iata).toUpperCase() : null;
}

function estimateNonstopMinutesByIata(fromIata, toIata) {
  if (!fromIata || !toIata || fromIata === toIata) return 0;
  const a = IATA_COORDS[fromIata];
  const b = IATA_COORDS[toIata];
  if (!a || !b) return null;

  const km = haversineKm(a[0], a[1], b[0], b[1]);

  // Rough domestic block time model:
  // - 40 min fixed overhead (taxi/climb/descent)
  // - cruise at ~800 km/h
  let minutes = 40 + (km / 800) * 60;

  // Boundaries to keep results plausible.
  minutes = Math.max(minutes, 55);
  minutes = Math.min(minutes, 6 * 60 + 30); // cap 6h30 for domestic legs

  // Round to nearest 5 minutes.
  minutes = Math.round(minutes / 5) * 5;
  return Math.round(minutes);
}

function minutesToDurationStr(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${String(mm).padStart(2, "0")}m`;
}

function parseDurationToMinutes(durationStr) {
  const s = String(durationStr || "");
  const m = s.match(/(\d+)h\s*(\d+)?m?/i);
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2] || "0", 10);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function parseTimeToMinutes(hhmm) {
  const m = String(hhmm || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  return hh * 60 + mm;
}

function minutesToTimeStr(minutesFromMidnight) {
  let m = Math.round(minutesFromMidnight);
  m = ((m % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function stableHashInt(str) {
  const s = String(str || "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function getTrustMetrics(flight) {
  const airline = String((flight && flight.airline) || "");
  const routeKey = `${flight && flight.from}|${flight && flight.to}|${airline}`;
  const h = stableHashInt(routeKey);

  // Rating: 3.7–4.7
  const rating = Math.round((3.7 + (h % 101) / 100) * 10) / 10;

  // On-time: 72–92%
  const onTimePct = 72 + (stableHashInt(routeKey + "|otp") % 21);

  return { rating, onTimePct };
}

function buildFlightSegments(flight, airports) {
  if (!flight) return { segments: [], totalMinutes: null, layoverMinutes: null, approx: true };

  // If caller provided a concrete breakdown (used by synthetic hub connections), trust it.
  if (Array.isArray(flight.segments) && flight.segments.length) {
    const segs = flight.segments
      .filter((s) => s && s.from && s.to)
      .map((s) => ({
        from: s.from,
        to: s.to,
        minutes: s.minutes != null ? Number(s.minutes) : null,
        airline: s.airline || null,
      }));

    const layoverMinutes = flight.layoverMinutes != null ? Number(flight.layoverMinutes) : null;
    const segSum = segs.reduce((acc, s) => acc + (Number.isFinite(s.minutes) ? s.minutes : 0), 0);
    const totalMinutes = (Number.isFinite(layoverMinutes) ? layoverMinutes : 0) + segSum;

    return {
      segments: segs,
      totalMinutes: totalMinutes || null,
      layoverMinutes: Number.isFinite(layoverMinutes) ? layoverMinutes : null,
      approx: true,
    };
  }

  const from = flight.from;
  const to = flight.to;
  const via = flight.via;
  const stops = flight.stops != null ? Number(flight.stops) : 0;

  const fromIata = getIataForCity(airports, from);
  const toIata = getIataForCity(airports, to);
  const viaIata = via ? getIataForCity(airports, via) : null;

  const parsedTotal = parseDurationToMinutes(flight.duration);
  let totalMinutes = parsedTotal;

  // Non-stop: single segment.
  if (!stops || stops === 0 || !via || !viaIata || !fromIata || !toIata) {
    const est = fromIata && toIata ? estimateNonstopMinutesByIata(fromIata, toIata) : null;
    const minutes = totalMinutes != null ? totalMinutes : est;
    return {
      segments: minutes != null ? [{ from, to, minutes }] : [{ from, to, minutes: null }],
      totalMinutes: minutes,
      layoverMinutes: null,
      approx: totalMinutes == null,
    };
  }

  // 1-stop: 2 segments + layover.
  const d1 = estimateDistanceKmByIata(fromIata, viaIata) || 0;
  const d2 = estimateDistanceKmByIata(viaIata, toIata) || 0;
  const distSum = Math.max(1, d1 + d2);

  const leg1Est = estimateNonstopMinutesByIata(fromIata, viaIata);
  const leg2Est = estimateNonstopMinutesByIata(viaIata, toIata);

  // Default layover: 65–95 min deterministic.
  let layoverMinutes = 65 + (stableHashInt(`${from}|${via}|${to}`) % 31);

  // If we have a total duration, fit layover to make the breakdown consistent.
  if (totalMinutes != null && leg1Est != null && leg2Est != null) {
    layoverMinutes = clamp(totalMinutes - leg1Est - leg2Est, 50, 160);
  }

  // If total isn't known, compute it.
  if (totalMinutes == null) {
    const a = leg1Est != null ? leg1Est : Math.round(((d1 / distSum) * 120) + 80);
    const b = leg2Est != null ? leg2Est : Math.round(((d2 / distSum) * 120) + 80);
    totalMinutes = a + layoverMinutes + b;
  }

  // If either leg estimate is missing, allocate proportionally.
  let leg1Minutes = leg1Est;
  let leg2Minutes = leg2Est;
  if (leg1Minutes == null || leg2Minutes == null) {
    const flyMinutes = Math.max(60, totalMinutes - layoverMinutes);
    leg1Minutes = Math.round((flyMinutes * d1) / distSum / 5) * 5;
    leg2Minutes = Math.max(45, flyMinutes - leg1Minutes);
  }

  return {
    segments: [
      { from, to: via, minutes: leg1Minutes },
      { from: via, to, minutes: leg2Minutes },
    ],
    totalMinutes,
    layoverMinutes,
    approx: true,
  };
}

function estimatePriceINR(distanceKm, opts) {
  const d = Math.max(0, distanceKm || 0);
  const base = (opts && opts.base) || 1500;
  const perKm = (opts && opts.perKm) || 4.6;
  const p = base + d * perKm;
  // Round to nearest 50.
  return Math.max(1800, Math.round(p / 50) * 50);
}

function estimateDistanceKmByIata(fromIata, toIata) {
  const a = IATA_COORDS[fromIata];
  const b = IATA_COORDS[toIata];
  if (!a || !b) return null;
  return haversineKm(a[0], a[1], b[0], b[1]);
}

function pickAirlineForLeg(from, via, to, legIndex) {
  // legIndex: 1 for origin→hub, 2 for hub→destination
  const key = `${from}|${via}|${to}|leg${legIndex}`;

  // First leg: typically low-cost carriers
  const leg1 = ["IndiGo", "Akasa Air", "SpiceJet"];
  // Second leg: often AI/IX (as per your idea)
  const leg2 = ["Air India Express", "Air India"];

  const list = legIndex === 2 ? leg2 : leg1;
  const idx = stableHashInt(key) % list.length;
  return list[idx];
}

/**
 * Generate synthetic 1-stop flights via hubs when a route is missing.
 * Returns a small list (max 4) of options: 2 best hubs × (morning/evening).
 */
function generateHubConnections(params) {
  const { from, to, airports, hubCities, maxHubs } = params || {};
  if (!from || !to || from === to) return [];

  const hubs = Array.isArray(hubCities) && hubCities.length ? hubCities : HUB_CITIES_DEFAULT;
  const fromIata = getIataForCity(airports, from);
  const toIata = getIataForCity(airports, to);
  if (!fromIata || !toIata) return [];

  const candidates = [];
  for (const via of hubs) {
    if (!via || via === from || via === to) continue;
    const viaIata = getIataForCity(airports, via);
    if (!viaIata) continue;

    const leg1Min = estimateNonstopMinutesByIata(fromIata, viaIata);
    const leg2Min = estimateNonstopMinutesByIata(viaIata, toIata);
    if (!leg1Min || !leg2Min) continue;

    // Layover: 65–95 min, deterministic per route.
    const layover = 65 + (stableHashInt(`${from}|${via}|${to}`) % 31);
    const total = leg1Min + layover + leg2Min;

    candidates.push({ via, viaIata, leg1Min, leg2Min, layover, total });
  }

  if (!candidates.length) return [];

  candidates.sort((a, b) => a.total - b.total);
  const take = Math.max(1, Math.min(Number(maxHubs) || 2, candidates.length));
  const best = candidates.slice(0, take);

  const departTimes = ["07:30", "18:30"];
  const out = [];

  for (const c of best) {
    for (const depart of departTimes) {
      const depMin = parseTimeToMinutes(depart);
      const arriveMin = depMin != null ? depMin + c.total : null;

      const d1 = estimateDistanceKmByIata(fromIata, c.viaIata) || 0;
      const d2 = estimateDistanceKmByIata(c.viaIata, toIata) || 0;
      const price = estimatePriceINR(d1, { base: 1400, perKm: 4.7 }) +
        estimatePriceINR(d2, { base: 1400, perKm: 4.7 }) - 600;

      const leg1Airline = pickAirlineForLeg(from, c.via, to, 1);
      const leg2Airline = pickAirlineForLeg(from, c.via, to, 2);
      const airline = leg1Airline;
      const id = `CX-${fromIata}-${toIata}-VIA-${c.viaIata}-${depart.replace(":", "")}`;

      out.push({
        id,
        airline,
        from,
        to,
        fromCode: fromIata,
        toCode: toIata,
        depart,
        arrive: arriveMin != null ? minutesToTimeStr(arriveMin) : "—",
        duration: minutesToDurationStr(c.total),
        priceINR: Math.max(2500, Math.round(price / 50) * 50),
        stops: 1,
        via: c.via,
        class: "Economy",
        synthetic: true,
        layoverMinutes: c.layover,
        segments: [
          { from, to: c.via, minutes: c.leg1Min, airline: leg1Airline },
          { from: c.via, to, minutes: c.leg2Min, airline: leg2Airline },
        ],
      });
    }
  }

  return out;
}

module.exports = {
  generateHubConnections,
  // For server-side UI enrichment
  minutesToDurationStr,
  parseDurationToMinutes,
  buildFlightSegments,
  getTrustMetrics,
};
