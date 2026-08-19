/* ─────────────────────────────────────────────────────────────
   GoTrip Intelligent Chatbot Engine
   ─────────────────────────────────────────────────────────── */

// ── Fuzzy matching (Levenshtein distance) ─────────────────
function levenshtein(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyMatch(input, candidates, threshold) {
  threshold = threshold || 3;
  input = input.toLowerCase().trim();
  let best = null, bestDist = Infinity;
  for (const c of candidates) {
    const cl = c.toLowerCase();
    if (cl === input) return c;
    if (cl.includes(input) || input.includes(cl)) return c;
    const dist = levenshtein(input, cl);
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return bestDist <= threshold ? best : null;
}

// ── Destination category index ───────────────────────────
const DEST_CATEGORIES = {
  "hill station":   ["Shimla", "Manali", "Ooty", "Darjeeling", "Mount Abu", "Kodaikanal", "Munnar", "Shillong", "Coorg", "Gangtok"],
  "hill stations":  ["Shimla", "Manali", "Ooty", "Darjeeling", "Mount Abu", "Kodaikanal", "Munnar", "Shillong", "Coorg", "Gangtok"],
  "mountains":      ["Ladakh", "Manali", "Shimla", "Gangtok", "Rishikesh", "Darjeeling"],
  "beaches":        ["Goa", "Kerala", "Andaman & Nicobar Islands", "Lakshadweep Islands", "Pondicherry", "Visakhapatnam", "Daman and Diu", "Kanyakumari", "Mumbai"],
  "beach":          ["Goa", "Kerala", "Andaman & Nicobar Islands", "Lakshadweep Islands", "Pondicherry", "Visakhapatnam", "Daman and Diu", "Kanyakumari", "Mumbai"],
  "heritage":       ["Delhi", "Agra", "Jaipur", "Hampi", "Konark", "Mysuru", "Hyderabad", "Kolkata", "Ahmedabad"],
  "spiritual":      ["Varanasi", "Rishikesh", "Tirupati", "Rameshwaram", "Madurai", "Amritsar", "Kanyakumari"],
  "pilgrimage":     ["Varanasi", "Tirupati", "Rameshwaram", "Amritsar", "Madurai", "Rishikesh"],
  "wildlife":       ["Kaziranga", "Sundarbans", "Kerala", "Assam"],
  "adventure":      ["Ladakh", "Rishikesh", "Manali", "Gangtok", "Coorg"],
  "romantic":       ["Udaipur", "Goa", "Kerala", "Ooty", "Munnar", "Kodaikanal", "Coorg", "Andaman & Nicobar Islands"],
  "honeymoon":      ["Udaipur", "Goa", "Kerala", "Ooty", "Munnar", "Kodaikanal", "Andaman & Nicobar Islands", "Lakshadweep Islands"],
  "desert":         ["Jodhpur", "Rann of Kutch", "Jaipur", "Ladakh"],
  "backwaters":     ["Kerala", "Munnar"],
  "tea gardens":    ["Darjeeling", "Ooty", "Munnar", "Assam", "Coorg"],
  "islands":        ["Andaman & Nicobar Islands", "Lakshadweep Islands", "Daman and Diu"],
  "food":           ["Delhi", "Hyderabad", "Kolkata", "Mumbai", "Ahmedabad", "Pune", "Chennai"],
  "culture":        ["Kolkata", "Mysuru", "Hyderabad", "Jaipur", "Varanasi", "Pondicherry", "Meghalaya"],
  "northeast":      ["Assam", "Meghalaya", "Shillong", "Kaziranga", "Gangtok", "Darjeeling"],
  "trekking":       ["Coorg", "Manali", "Ladakh", "Rishikesh", "Kodaikanal", "Gangtok"],
  "nature":         ["Kerala", "Coorg", "Meghalaya", "Kaziranga", "Sundarbans", "Ooty", "Munnar"],
};

const ALL_CATEGORIES = Object.keys(DEST_CATEGORIES);

// ── Greeting patterns ────────────────────────────────────
const GREETINGS = [
  /^(hi|hello|hey|hola|namaste|howdy|sup|yo)\b/i,
  /good\s*(morning|afternoon|evening|day|night)/i,
  /^(greetings|salutations)/i,
  /what'?s?\s*up/i,
];

const GREETING_RESPONSES = [
  "Hey there! 👋 Welcome to GoTrip! I'm your travel buddy. I can help you with:\n\n🗺️ **Plan an itinerary** — Just say 'plan a trip'\n✈️ **Book flights** — Say 'book a flight'\n🏨 **Find hotels** — Say 'hotels in Goa'\n🌄 **Suggest destinations** — Say 'suggest beaches'\n🚌 **Find buses** — Ask about bus routes\n\nWhat would you like to explore? 😊",
  "Hello! 🌟 I'm your GoTrip travel assistant! Ask me about destinations, flights, hotels, itineraries, or anything travel-related. Where shall we wander today? ✈️",
  "Namaste! 🙏 Ready to plan your dream trip across India? I can help with itineraries, flights, hotels, and destination suggestions. What's on your mind?",
];

// ── Intent patterns ──────────────────────────────────────
const INTENT_PATTERNS = {
  itinerary: [
    /\b(itinerary|itin[ea]r|plan\s*(a|my|the)?\s*(trip|tour|travel|vacation|holiday|journey)|trip\s*plan|travel\s*plan|plan\s*my\s*visit)\b/i,
    /\b(sched[ue]le|create\s*(a|my)?\s*(plan|trip)|make\s*(a|my)?\s*(plan|trip|itinerary))\b/i,
    /\b(what\s*to\s*do\s*in|things\s*to\s*do|day\s*plan|daywise|day\s*wise)\b/i,
    /\b(itenary|iternary|itinarary|itenirary|itinrary|iteniary|itinerar|iterner|itenarary|itineray)\b/i,
  ],
  flight: [
    /\b(flights?|fly|planes?|air\s*tickets?|book\s*a?\s*flights?|flights?\s*book|air\s*travel)\b/i,
    /\b(fli[gh]ts?|fligs?t|filghts?|fligh|fligths?)\b/i,
    /\b(cheap\s*flights?|flights?\s*to|flights?\s*from|air\s*fares?)\b/i,
  ],
  hotel: [
    /\b(hotels?|stays?|accommodations?|resorts?|lodges?|where\s*to\s*stay|place\s*to\s*stay|rooms?|hostels?)\b/i,
    /\b(hotal|hotl|hotle|hotell|accomod)\b/i,
    /\b(book\s*(a|the)?\s*(hotel|room|stay|resort)|hotel\s*book)\b/i,
  ],
  bus: [
    /\b(bus|buses|coach|road\s*trip|bus\s*tickets?|bus\s*book)\b/i,
  ],
  destination_suggest: [
    /\b(suggest|recommend|which\s*place|where\s*(should|to|can)\s*(i|we)?\s*(go|visit|travel)|best\s*places?|top\s*places?|popular|famous)\b/i,
    /\b(explore|discover|what\s*to\s*visit|show\s*me\s*places?|destinations?)\b/i,
    /\b(where|which)\s*(part|region|area|side|place)\b/i,
    /\b(what('s|\s*is|\s*are)\s*(good|best|nice|great))\b/i,
    /\bwhat\s*(are|r)\s*(the|my|some)?\s*(option|choice|place)/i,
    /\b(the\s*best\s*places?|top\s*destinations?|popular\s*places?)\b/i,
  ],
  hotel_book: [
    /\b(book\s*(this|that|the|a)?\s*(hotel|room|stay|resort))\b/i,
    /\b(reserve|booking|reservation)\s*(a|the|my)?\s*(hotel|room|stay|resort)\b/i,
  ],
  generic_book: [
    /^(i\s*)?(want|wanna|need|like)\s*to\s*book\b/i,
    /^book\s*$/i,
    /^(i\s*)?(want|wanna|need|like)\s*to\s*(reserve|booking)\b/i,
  ],
  greeting: GREETINGS,
  help: [
    /\b(help|what\s*can\s*you\s*do|capabilities|features|guide|assist)\b/i,
    /\b(how\s*does\s*this\s*work|what\s*do\s*you\s*know)\b/i,
  ],
  thanks: [
    /\b(thanks|thank\s*you|thx|appreciate|great|awesome|cool|nice|perfect|wonderful)\b/i,
  ],
  goodbye: [
    /\b(bye|goodbye|see\s*you|take\s*care|cya|later|good\s*night)\b/i,
  ],
  best_time: [
    /\b(best\s*time|when\s*to\s*(go|visit|travel)|weather|season|climate)\b/i,
  ],
  about_place: [
    /\b(tell\s*(me)?\s*(about|more)|what\s*(is|about)|info\s*(about|on)|describe|details?)\b/i,
  ],
};

// ── Conversation state store (in-memory, per-session via sessionId) ──
const sessions = {};
function getSession(id) {
  if (!sessions[id]) sessions[id] = { flow: null, data: {} };
  return sessions[id];
}
function clearSession(id) {
  sessions[id] = { flow: null, data: {} };
}

// ── Helper: detect intent ─────────────────────────────────
function detectIntent(text) {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pat of patterns) {
      if (pat.test(text)) return intent;
    }
  }
  return null;
}

// ── Common English stop words (skip in fuzzy place matching) ──
var STOP_WORDS = [
  'the','and','for','are','but','not','you','all','can','had','her','was','one',
  'our','out','day','get','has','him','his','how','its','may','new','now','old',
  'see','way','who','did','got','let','say','she','too','use','what','when',
  'where','which','will','with','from','have','been','some','than','them','then',
  'they','this','that','very','want','come','could','make','like','just','over',
  'such','take','also','into','more','only','time','here','show','know','plan',
  'trip','about','after','being','book','find','good','need','tell','best','nice',
  'great','help','give','keep','many','much','most','next','should','would','place',
  'places','option','options','things','visit','travel','look','looking','going',
  'want','wanna'
];

// ── Helper: extract place names from text ─────────────────
function extractPlaces(text, destinations) {
  var names = destinations.map(function(d) { return d.name; });
  var words = text.replace(/[^\w\s&]/g, ' ').trim();
  var found = [];

  for (var i = 0; i < names.length; i++) {
    if (words.toLowerCase().includes(names[i].toLowerCase())) {
      found.push(names[i]);
    }
  }

  if (found.length === 0) {
    var tokens = words.split(/\s+/);
    for (var t = 0; t < tokens.length; t++) {
      var single = tokens[t].toLowerCase();
      // Skip stop words for fuzzy matching
      if (STOP_WORDS.indexOf(single) !== -1) continue;
      var pair = t < tokens.length - 1 ? tokens[t] + ' ' + tokens[t + 1] : null;
      if (pair) {
        var m = fuzzyMatch(pair, names, 3);
        if (m && found.indexOf(m) === -1) { found.push(m); continue; }
      }
      if (single.length >= 3) {
        var m2 = fuzzyMatch(single, names, 2);
        if (m2 && found.indexOf(m2) === -1) found.push(m2);
      }
    }
  }
  return found.filter(function(v, i, a) { return a.indexOf(v) === i; });
}

// ── Helper: extract number from text ─────────────────────
function extractNumber(text) {
  var m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// ── Helper: extract from/to from text ────────────────────
function extractFromTo(text, destinations) {
  var fromMatch = text.match(/from\s+([a-z\s&]+?)(?:\s+to\s+|\s*$)/i);
  var toMatch = text.match(/to\s+([a-z\s&]+?)(?:\s+from\s+|\s*$)/i);

  var from = null, to = null;
  var names = destinations.map(function(d) { return d.name; });

  if (fromMatch) {
    from = fuzzyMatch(fromMatch[1].trim(), names, 3);
  }
  if (toMatch) {
    to = fuzzyMatch(toMatch[1].trim(), names, 3);
  }

  if (!from && !to) {
    var places = extractPlaces(text, destinations);
    if (places.length >= 2) { from = places[0]; to = places[1]; }
    else if (places.length === 1) { to = places[0]; }
  }

  return { from: from, to: to };
}

// ── Helper: find category in text ────────────────────────
function detectCategory(text) {
  var lower = text.toLowerCase();
  // Exact substring match first (most reliable)
  for (var i = 0; i < ALL_CATEGORIES.length; i++) {
    // Ensure word boundary-ish match: the category should appear as a word
    var cat = ALL_CATEGORIES[i];
    var regex = new RegExp('\\b' + cat.replace(/\s+/g, '\\s+') + '\\b', 'i');
    if (regex.test(lower)) return cat;
  }
  // Fuzzy check only on longer tokens to avoid false positives
  var tokens = lower.split(/\s+/);
  for (var t = 0; t < tokens.length; t++) {
    if (tokens[t].length < 5) continue; // skip short words to avoid false matches
    var m = fuzzyMatch(tokens[t], ALL_CATEGORIES, 2);
    if (m) return m;
  }
  return null;
}

// ── Helper: format price ─────────────────────────────────
function fmt(n) {
  return '\u20B9' + Number(n).toLocaleString('en-IN');
}

// ── Main chat reply engine ───────────────────────────────
function getChatReply(opts) {
  var message = opts.message;
  var destinations = opts.destinations || [];
  var hotels = opts.hotels || [];
  var flights = opts.flights || [];
  var sessionId = opts.sessionId || 'default';

  var text = (message || '').trim();
  if (!text) return { reply: "Go ahead, ask me anything about travel! \u2708\uFE0F" };

  var lower = text.toLowerCase();
  var sess = getSession(sessionId);
  var destNames = destinations.map(function(d) { return d.name; });
  var allHotels = hotels;
  var allFlights = flights;

  // ─── Continue multi-turn flows ───────────────────────
  // But if the user clearly triggers a NEW intent, break out of the current flow
  if (sess.flow) {
    var newIntent = detectIntent(lower);
    var flowIntent = sess.flow.replace(/_.*/, ''); // e.g. 'hotel_list' -> 'hotel'
    // If user explicitly triggers a different intent, abandon the flow
    if (newIntent && newIntent !== flowIntent
        && !(newIntent === 'hotel_book' && flowIntent === 'hotel')
        && !(newIntent === 'hotel' && flowIntent === 'hotel')) {
      sess.flow = null;
      sess.data = {};
      // Fall through to normal intent handling below
    } else {
      return handleFlow(sess, text, lower, destinations, allHotels, allFlights, destNames);
    }
  }

  // ─── Detect intent ──────────────────────────────────
  var intent = detectIntent(lower);

  // ─── Greetings ──────────────────────────────────────
  if (intent === 'greeting') {
    return { reply: GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)] };
  }

  // ─── Thanks ─────────────────────────────────────────
  if (intent === 'thanks') {
    return { reply: "You're welcome! \uD83D\uDE0A Happy to help. Anything else you'd like to explore?" };
  }

  // ─── Goodbye ────────────────────────────────────────
  if (intent === 'goodbye') {
    clearSession(sessionId);
    return { reply: "Bye! \uD83C\uDF1F Have a wonderful trip! Come back anytime you need travel help. Safe travels! \u2708\uFE0F" };
  }

  // ─── Help ───────────────────────────────────────────
  if (intent === 'help') {
    return {
      reply: "Here's what I can help you with! \uD83C\uDFAF\n\n" +
        "\uD83D\uDDFA\uFE0F **Plan itinerary** \u2014 _'Plan a trip to Goa for 3 days'_\n" +
        "\u2708\uFE0F **Find flights** \u2014 _'Flights from Delhi to Goa'_\n" +
        "\uD83C\uDFE8 **Find hotels** \u2014 _'Hotels in Jaipur'_\n" +
        "\uD83D\uDE8C **Find buses** \u2014 _'Buses from Delhi to Agra'_\n" +
        "\uD83C\uDF04 **Destination suggestions** \u2014 _'Suggest hill stations'_\n" +
        "\uD83D\uDCCD **Place info** \u2014 _'Tell me about Kerala'_\n" +
        "\uD83D\uDD50 **Best time to visit** \u2014 _'Best time to visit Ladakh'_\n\n" +
        "Just type naturally \u2014 I understand typos too! \uD83D\uDE09"
    };
  }

  // ─── Itinerary ─────────────────────────────────────
  if (intent === 'itinerary') {
    var places = extractPlaces(lower, destinations);
    var days = extractNumber(lower);

    if (places.length > 0 && days) {
      return {
        reply: "Great choice! \uD83D\uDDFA\uFE0F Here's your **" + days + "-day itinerary for " + places[0] + "**!",
        action: { type: 'link', url: '/itinerary?destination=' + encodeURIComponent(places[0]) + '&days=' + days, label: 'View ' + places[0] + ' Itinerary' }
      };
    }
    sess.flow = 'itinerary';
    sess.data = {};
    if (places.length > 0) {
      sess.data.destination = places[0];
      return { reply: "Awesome! \uD83D\uDDFA\uFE0F A trip to **" + places[0] + "** sounds wonderful!\n\nHow many days are you planning for? (e.g., 3, 5, 7)" };
    }
    return { reply: "I'd love to plan an itinerary for you! \uD83D\uDDFA\uFE0F\u2728\n\nWhich destination would you like to visit? You can pick from our **45 amazing destinations** across India!" };
  }

  // ─── Flights ────────────────────────────────────────
  if (intent === 'flight') {
    var ft = extractFromTo(lower, destinations);
    if (ft.from && ft.to) {
      return {
        reply: "\u2708\uFE0F Let me find flights from **" + ft.from + "** to **" + ft.to + "** for you!",
        action: { type: 'link', url: '/flights?from=' + encodeURIComponent(ft.from) + '&to=' + encodeURIComponent(ft.to), label: 'View ' + ft.from + ' \u2192 ' + ft.to + ' Flights' }
      };
    }
    if (ft.to) {
      sess.flow = 'flight';
      sess.data = { to: ft.to };
      return { reply: "\u2708\uFE0F Flying to **" + ft.to + "** \u2014 great choice!\n\nWhere will you be flying **from**?" };
    }
    sess.flow = 'flight';
    sess.data = {};
    return { reply: "\u2708\uFE0F Let's find the perfect flight for you!\n\nWhere would you like to fly **from**? (departure city)" };
  }

  // ─── Generic book (no specific type) ─────────────────
  if (intent === 'generic_book') {
    return {
      reply: "What would you like to book? \uD83D\uDE0A\n\n\u2708\uFE0F **Flight** \u2014 say _'book a flight'_\n\uD83C\uDFE8 **Hotel** \u2014 say _'book a hotel'_\n\uD83D\uDE8C **Bus** \u2014 say _'book a bus'_\n\nOr tell me the full details like _'flights from Delhi to Goa'_ or _'hotels in Jaipur'_!"
    };
  }

  // ─── Hotels (book intent) ──────────────────────────
  if (intent === 'hotel_book') {
    var hbPlaces = extractPlaces(lower, destinations);
    if (hbPlaces.length > 0) {
      var cityHotels = allHotels.filter(function(h) { return h.city.toLowerCase() === hbPlaces[0].toLowerCase(); });
      if (cityHotels.length > 0) {
        return {
          reply: "\uD83C\uDFE8 Here are hotels in **" + hbPlaces[0] + "** you can book:\n\n" +
            cityHotels.map(function(h, i) { return (i + 1) + ". **" + h.name + "** \u2014 " + fmt(h.pricePerNightINR) + "/night \u2B50 " + h.rating; }).join('\n') +
            "\n\nTell me a hotel number or name to proceed with booking!",
          action: { type: 'hotels', city: hbPlaces[0], hotels: cityHotels }
        };
      }
    }
    sess.flow = 'hotel_book';
    sess.data = {};
    return { reply: "\uD83C\uDFE8 Which hotel would you like to book? Tell me the city or hotel name." };
  }

  // ─── Hotels (search intent) ────────────────────────
  if (intent === 'hotel') {
    var hPlaces = extractPlaces(lower, destinations);
    if (hPlaces.length > 0) {
      var city = hPlaces[0];
      var cHotels = allHotels.filter(function(h) { return h.city.toLowerCase() === city.toLowerCase(); });
      if (cHotels.length > 0) {
        sess.flow = 'hotel_list';
        sess.data = { city: city, hotels: cHotels };
        return {
          reply: "\uD83C\uDFE8 Found **" + cHotels.length + " hotels** in **" + city + "**:\n\n" +
            cHotels.map(function(h, i) { return (i + 1) + ". **" + h.name + "** \u2014 " + fmt(h.pricePerNightINR) + "/night \u2B50 " + h.rating; }).join('\n') +
            "\n\nWant to **book** any of these? Just tell me the number or name! Or say _'show all hotels in " + city + "'_ to see them on the hotels page.",
          action: { type: 'link', url: '/hotels?city=' + encodeURIComponent(city), label: 'View All Hotels in ' + city }
        };
      } else {
        return { reply: "Sorry, I couldn't find hotels listed in **" + city + "** right now. \uD83D\uDE14\n\nTry another city like Goa, Jaipur, Delhi, Kerala, or Mumbai!" };
      }
    }
    sess.flow = 'hotel_search';
    sess.data = {};
    return { reply: "\uD83C\uDFE8 I'd love to help you find a hotel!\n\nWhich **city** are you looking for hotels in?" };
  }

  // ─── Buses ──────────────────────────────────────────
  if (intent === 'bus') {
    var bt = extractFromTo(lower, destinations);
    if (bt.from && bt.to) {
      return {
        reply: "\uD83D\uDE8C Let me find buses from **" + bt.from + "** to **" + bt.to + "**!",
        action: { type: 'link', url: '/buses?from=' + encodeURIComponent(bt.from) + '&to=' + encodeURIComponent(bt.to), label: 'View ' + bt.from + ' \u2192 ' + bt.to + ' Buses' }
      };
    }
    sess.flow = 'bus';
    sess.data = {};
    return { reply: "\uD83D\uDE8C Let's find a bus for you!\n\nWhere are you traveling **from**?" };
  }

  // ─── Destination suggestions ───────────────────────
  if (intent === 'destination_suggest') {
    var cat = detectCategory(lower);
    if (cat && DEST_CATEGORIES[cat]) {
      var catPlaces = DEST_CATEGORIES[cat];
      return {
        reply: "\uD83C\uDF1F Here are the best **" + cat + "** destinations we have:\n\n" +
          catPlaces.map(function(p) { return "\u2022 **" + p + "**"; }).join('\n') +
          "\n\nWant to know more about any of these? Just ask! Or say _'plan a trip to " + catPlaces[0] + "'_ to get started! \uD83D\uDE80",
        action: { type: 'suggestions', places: catPlaces }
      };
    }
    return {
      reply: "\uD83C\uDF0D India has something for everyone! What kind of experience are you looking for?\n\n" +
        "\uD83C\uDFD4\uFE0F **Hill Stations** \u2014 Shimla, Manali, Ooty...\n" +
        "\uD83C\uDFD6\uFE0F **Beaches** \u2014 Goa, Andaman, Kerala...\n" +
        "\u26F0\uFE0F **Mountains** \u2014 Ladakh, Gangtok, Manali...\n" +
        "\uD83C\uDFDB\uFE0F **Heritage** \u2014 Agra, Jaipur, Hampi...\n" +
        "\uD83D\uDE4F **Spiritual** \u2014 Varanasi, Rishikesh, Tirupati...\n" +
        "\uD83D\uDC3E **Wildlife** \u2014 Kaziranga, Sundarbans...\n" +
        "\uD83D\uDC91 **Romantic** \u2014 Udaipur, Kerala, Munnar...\n" +
        "\uD83C\uDFDD\uFE0F **Islands** \u2014 Andaman, Lakshadweep...\n" +
        "\uD83C\uDF3F **Nature** \u2014 Coorg, Meghalaya, Kerala...\n" +
        "\uD83C\uDF5B **Food** \u2014 Delhi, Hyderabad, Kolkata...\n\n" +
        "Just tell me a category or your preference! \uD83D\uDE0A"
    };
  }

  // ─── Best time to visit ────────────────────────────
  if (intent === 'best_time') {
    var btPlaces = extractPlaces(lower, destinations);
    if (btPlaces.length > 0) {
      var dest = destinations.find(function(d) { return d.name.toLowerCase() === btPlaces[0].toLowerCase(); });
      if (dest) {
        return {
          reply: "\uD83D\uDD50 The **best time to visit " + dest.name + "** is **" + dest.bestTime + "**.\n\n" +
            "_\"" + dest.desc + "\"_\n\n" +
            "\uD83C\uDFF7\uFE0F Known for: " + dest.tags.join(', ') + "\n\n" +
            "Want me to plan a trip there? Just say _'plan a trip to " + dest.name + "'_! \uD83D\uDDFA\uFE0F"
        };
      }
    }
    return { reply: "\uD83D\uDD50 Which destination would you like to know the best time to visit? Name any of our 45 destinations!" };
  }

  // ─── About a place ─────────────────────────────────
  if (intent === 'about_place') {
    var apPlaces = extractPlaces(lower, destinations);
    if (apPlaces.length > 0) {
      var apDest = destinations.find(function(d) { return d.name.toLowerCase() === apPlaces[0].toLowerCase(); });
      if (apDest) {
        return {
          reply: "\uD83D\uDCCD **" + apDest.name + "** \u2014 _" + apDest.tagline + "_\n\n" +
            apDest.desc + "\n\n" +
            "\uD83D\uDCCC Region: " + apDest.region + " India\n" +
            "\uD83D\uDD50 Best time: " + apDest.bestTime + "\n" +
            "\uD83C\uDFF7\uFE0F Tags: " + apDest.tags.join(', ') + "\n\n" +
            "Would you like to:\n" +
            "\u2022 \uD83D\uDDFA\uFE0F Plan an itinerary \u2014 say _'plan trip to " + apDest.name + "'_\n" +
            "\u2022 \u2708\uFE0F Find flights \u2014 say _'flights to " + apDest.name + "'_\n" +
            "\u2022 \uD83C\uDFE8 See hotels \u2014 say _'hotels in " + apDest.name + "'_",
          action: { type: 'link', url: '/destination/' + apDest.id, label: 'Explore ' + apDest.name }
        };
      }
    }
    return { reply: "\uD83D\uDCCD Which place would you like to know about? Name any destination in India!" };
  }

  // ─── Category mentioned without suggest keyword ────
  var catCheck = detectCategory(lower);
  if (catCheck && DEST_CATEGORIES[catCheck]) {
    var cPlaces = DEST_CATEGORIES[catCheck];
    return {
      reply: "\uD83C\uDF1F Looking for **" + catCheck + "**? Here are our top picks:\n\n" +
        cPlaces.map(function(p) { return "\u2022 **" + p + "**"; }).join('\n') +
        "\n\nWant to know more about any place? Or plan a trip? Just ask! \uD83D\uDE80",
      action: { type: 'suggestions', places: cPlaces }
    };
  }

  // ─── Place name mentioned alone ────────────────────
  var alPlaces = extractPlaces(lower, destinations);
  if (alPlaces.length > 0) {
    var alDest = destinations.find(function(d) { return d.name.toLowerCase() === alPlaces[0].toLowerCase(); });
    if (alDest) {
      return {
        reply: "\uD83D\uDCCD **" + alDest.name + "** \u2014 _" + alDest.tagline + "_\n\n" +
          alDest.desc + "\n\n" +
          "\uD83D\uDD50 Best time: " + alDest.bestTime + " | \uD83D\uDCCC " + alDest.region + " India\n\n" +
          "What would you like to do?\n" +
          "\u2022 \uD83D\uDDFA\uFE0F _'Plan trip to " + alDest.name + "'_\n" +
          "\u2022 \u2708\uFE0F _'Flights to " + alDest.name + "'_\n" +
          "\u2022 \uD83C\uDFE8 _'Hotels in " + alDest.name + "'_",
        action: { type: 'link', url: '/destination/' + alDest.id, label: 'Explore ' + alDest.name }
      };
    }
  }

  // ─── Fallback ──────────────────────────────────────
  return {
    reply: "Hmm, I'm not sure I understood that \uD83E\uDD14\n\n" +
      "Try asking me things like:\n" +
      "\u2022 _'Plan a trip to Goa for 5 days'_\n" +
      "\u2022 _'Flights from Delhi to Manali'_\n" +
      "\u2022 _'Hotels in Jaipur'_\n" +
      "\u2022 _'Suggest beaches'_\n" +
      "\u2022 _'Tell me about Kerala'_\n\n" +
      "I understand natural language and even typos! \uD83D\uDE0A"
  };
}

// ─── Multi-turn flow handler ─────────────────────────────
function handleFlow(sess, text, lower, destinations, allHotels, allFlights, destNames) {

  // --- ITINERARY FLOW ---
  if (sess.flow === 'itinerary') {
    if (!sess.data.destination) {
      var places = extractPlaces(lower, destinations);
      if (places.length > 0) {
        sess.data.destination = places[0];
        return { reply: "Wonderful! **" + places[0] + "** is a great pick! \uD83C\uDF1F\n\nHow many **days** are you planning for? (e.g., 3, 5, 7)" };
      }
      var cat = detectCategory(lower);
      if (cat && DEST_CATEGORIES[cat]) {
        var catPlaces = DEST_CATEGORIES[cat];
        return {
          reply: "Great interest! Here are our **" + cat + "** destinations:\n\n" +
            catPlaces.map(function(p) { return "\u2022 **" + p + "**"; }).join('\n') +
            "\n\nWhich one would you like to plan your trip to?",
          action: { type: 'suggestions', places: catPlaces }
        };
      }
      return { reply: "I couldn't find that destination. \uD83D\uDE05 Try a popular one like **Goa**, **Manali**, **Kerala**, **Jaipur**, or **Ladakh**!\n\nOr say _'show destinations'_ to see all options." };
    }

    if (!sess.data.days) {
      var days = extractNumber(lower);
      if (days && days > 0 && days <= 30) {
        sess.data.days = days;
        var dest = sess.data.destination;
        sess.flow = null;
        sess.data = {};
        return {
          reply: "Perfect! \uD83C\uDF89 Here's your **" + days + "-day itinerary for " + dest + "**!",
          action: { type: 'link', url: '/itinerary?destination=' + encodeURIComponent(dest) + '&days=' + days, label: 'View ' + dest + ' ' + days + '-Day Itinerary' }
        };
      }
      return { reply: "Please enter a valid number of days (1\u201330). How many days is your trip?" };
    }
  }

  // --- FLIGHT FLOW ---
  if (sess.flow === 'flight') {
    if (!sess.data.from) {
      var fPlaces = extractPlaces(lower, destinations);
      if (fPlaces.length > 0) {
        sess.data.from = fPlaces[0];
        if (sess.data.to) {
          var from = sess.data.from;
          var to = sess.data.to;
          sess.flow = null;
          sess.data = {};
          return {
            reply: "\u2708\uFE0F Searching flights from **" + from + "** to **" + to + "**!",
            action: { type: 'link', url: '/flights?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to), label: 'View ' + from + ' \u2192 ' + to + ' Flights' }
          };
        }
        return { reply: "Got it \u2014 flying from **" + fPlaces[0] + "**! \u2708\uFE0F\n\nWhere would you like to fly **to**? (destination)" };
      }
      return { reply: "I couldn't match that city. Try a major city like **Delhi**, **Mumbai**, **Bengaluru**, **Chennai**, etc." };
    }

    if (!sess.data.to) {
      var tPlaces = extractPlaces(lower, destinations);
      if (tPlaces.length > 0) {
        var fFrom = sess.data.from;
        var fTo = tPlaces[0];
        sess.flow = null;
        sess.data = {};
        return {
          reply: "\u2708\uFE0F Let's find flights from **" + fFrom + "** to **" + fTo + "**!",
          action: { type: 'link', url: '/flights?from=' + encodeURIComponent(fFrom) + '&to=' + encodeURIComponent(fTo), label: 'View ' + fFrom + ' \u2192 ' + fTo + ' Flights' }
        };
      }
      return { reply: "I couldn't match that destination. Try places like **Goa**, **Manali**, **Kerala**, **Jaipur**, etc." };
    }
  }

  // --- BUS FLOW ---
  if (sess.flow === 'bus') {
    if (!sess.data.from) {
      var bfPlaces = extractPlaces(lower, destinations);
      if (bfPlaces.length > 0) {
        sess.data.from = bfPlaces[0];
        return { reply: "\uD83D\uDE8C Departing from **" + bfPlaces[0] + "**!\n\nWhere are you heading **to**?" };
      }
      return { reply: "I couldn't match that city. Try a city like **Delhi**, **Agra**, **Jaipur**, etc." };
    }
    if (!sess.data.to) {
      var btPlaces = extractPlaces(lower, destinations);
      if (btPlaces.length > 0) {
        var bFrom = sess.data.from;
        var bTo = btPlaces[0];
        sess.flow = null;
        sess.data = {};
        return {
          reply: "\uD83D\uDE8C Searching buses from **" + bFrom + "** to **" + bTo + "**!",
          action: { type: 'link', url: '/buses?from=' + encodeURIComponent(bFrom) + '&to=' + encodeURIComponent(bTo), label: 'View ' + bFrom + ' \u2192 ' + bTo + ' Buses' }
        };
      }
      return { reply: "I couldn't match that destination. Try places like **Agra**, **Jaipur**, **Mumbai**, etc." };
    }
  }

  // --- HOTEL SEARCH FLOW ---
  if (sess.flow === 'hotel_search') {
    var hsPlaces = extractPlaces(lower, destinations);
    if (hsPlaces.length > 0) {
      var hsCity = hsPlaces[0];
      var hsHotels = allHotels.filter(function(h) { return h.city.toLowerCase() === hsCity.toLowerCase(); });
      if (hsHotels.length > 0) {
        sess.flow = 'hotel_list';
        sess.data = { city: hsCity, hotels: hsHotels };
        return {
          reply: "\uD83C\uDFE8 Found **" + hsHotels.length + " hotels** in **" + hsCity + "**:\n\n" +
            hsHotels.map(function(h, i) { return (i + 1) + ". **" + h.name + "** \u2014 " + fmt(h.pricePerNightINR) + "/night \u2B50 " + h.rating; }).join('\n') +
            "\n\nWant to **book** any? Tell me the number or name!",
          action: { type: 'link', url: '/hotels?city=' + encodeURIComponent(hsCity), label: 'View All Hotels in ' + hsCity }
        };
      }
      sess.flow = null;
      return { reply: "Sorry, no hotels found in **" + hsCity + "**. \uD83D\uDE14 Try Goa, Jaipur, Delhi, Kerala, Mumbai, or any other major destination!" };
    }
    return { reply: "Which city are you looking for? Try places like **Goa**, **Jaipur**, **Delhi**, **Kerala**, **Manali**..." };
  }

  // --- HOTEL LIST FLOW (user can book) ---
  if (sess.flow === 'hotel_list') {
    var hlHotels = sess.data.hotels || [];
    var hlNum = extractNumber(lower);

    if (hlNum && hlNum >= 1 && hlNum <= hlHotels.length) {
      var hotel = hlHotels[hlNum - 1];
      sess.flow = null;
      sess.data = {};
      return {
        reply: "\uD83C\uDF89 Great choice! Proceeding to book **" + hotel.name + "** (" + fmt(hotel.pricePerNightINR) + "/night)!",
        action: { type: 'link', url: '/payment?kind=hotel&id=' + encodeURIComponent(hotel.id), label: 'Book ' + hotel.name }
      };
    }

    var hlNames = hlHotels.map(function(h) { return h.name; });
    var matched = fuzzyMatch(lower, hlNames, 5);
    if (matched) {
      var mHotel = hlHotels.find(function(h) { return h.name === matched; });
      if (mHotel) {
        sess.flow = null;
        sess.data = {};
        return {
          reply: "\uD83C\uDF89 Excellent! Booking **" + mHotel.name + "** (" + fmt(mHotel.pricePerNightINR) + "/night)!",
          action: { type: 'link', url: '/payment?kind=hotel&id=' + encodeURIComponent(mHotel.id), label: 'Book ' + mHotel.name }
        };
      }
    }

    if (/book|yes|proceed|confirm/i.test(lower)) {
      return { reply: "Which hotel number would you like to book? (1-" + hlHotels.length + ")" };
    }

    sess.flow = null;
    sess.data = {};
    return getChatReply({ message: text, destinations: destinations, hotels: allHotels, flights: allFlights, sessionId: 'default' });
  }

  // --- HOTEL BOOK FLOW ---
  if (sess.flow === 'hotel_book') {
    var hbPlaces2 = extractPlaces(lower, destinations);
    if (hbPlaces2.length > 0) {
      var hbCity = hbPlaces2[0];
      var hbHotels = allHotels.filter(function(h) { return h.city.toLowerCase() === hbCity.toLowerCase(); });
      if (hbHotels.length > 0) {
        sess.flow = 'hotel_list';
        sess.data = { city: hbCity, hotels: hbHotels };
        return {
          reply: "\uD83C\uDFE8 Hotels available in **" + hbCity + "**:\n\n" +
            hbHotels.map(function(h, i) { return (i + 1) + ". **" + h.name + "** \u2014 " + fmt(h.pricePerNightINR) + "/night \u2B50 " + h.rating; }).join('\n') +
            "\n\nTell me the number to book!",
          action: { type: 'link', url: '/hotels?city=' + encodeURIComponent(hbCity), label: 'View Hotels in ' + hbCity }
        };
      }
      sess.flow = null;
      return { reply: "No hotels found in **" + hbCity + "**. Try Goa, Jaipur, Delhi, etc." };
    }
    return { reply: "Which city do you want to book a hotel in?" };
  }

  // If we reach here, clear flow and re-process
  sess.flow = null;
  sess.data = {};
  return getChatReply({ message: text, destinations: destinations, hotels: allHotels, flights: allFlights, sessionId: 'default' });
}

module.exports = {
  getChatReply: getChatReply,
};
