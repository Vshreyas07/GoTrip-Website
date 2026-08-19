const path = require("path");
const express = require("express");

const { destinations, flights, hotels, buses, airports, airlineLogos } = require("./data");
const {
	generateHubConnections,
	buildFlightSegments,
	getTrustMetrics,
	minutesToDurationStr,
} = require("./flight-routing");

// Tourist spot gallery images per destination (spot images after main card image)
const destinationGallery = {
  // North India
  "delhi":        ["/img/delhi-red-fort.jpg","/img/delhi-india-gate.jpg","/img/delhi-qutub-minar.jpg","/img/delhi-humayun-tomb.jpg","/img/delhi-lotus-temple.jpg"],
  "agra":         ["/img/agra-agra-fort.jpg","/img/agra-fatehpur-sikri.jpg","/img/agra-itimad-ud-daulah.jpg","/img/agra-mehtab-bagh.jpg"],
  "jaipur":       ["/img/jaipur-amber-fort.jpg","/img/jaipur-hawa-mahal.jpg","/img/jaipur-city-palace.jpg","/img/jaipur-jantar-mantar.jpg","/img/jaipur-nahargarh-fort.jpg"],
  "varanasi":     ["/img/varanasi-ganga-aarti.jpg","/img/varanasi-kashi-vishwanath.jpg","/img/varanasi-assi-ghat.jpg","/img/varanasi-manikarnika-gha.jpg","/img/varanasi-sarnath.jpg"],
  "manali":       ["/img/manali-rohtang-pass.jpg","/img/manali-solang-valley.jpg","/img/manali-hadimba-temple.jpg","/img/manali-beas-river.jpg","/img/manali-old-manali.jpg"],
  "ladakh":       ["/img/ladakh-pangong-lake.jpeg","/img/ladakh-nubra-valley.jpg","/img/ladakh-thiksey-monastery.jpg","/img/ladakh-leh-palace.jpg","/img/ladakh-magnetic-hill.jpeg"],
  "amritsar":     ["/img/amritsar-golden-temple.jpg","/img/amritsar-wagah-border.jpg","/img/amritsar-jallianwala-bagh.jpg","/img/amritsar-akal-takht.jpg","/img/amritsar-durgiana-temple.jpeg"],
  "shimla":       ["/img/shimla-mall-road.jpg","/img/shimla-christ-church.jpg","/img/shimla-jakhu-temple.jpg","/img/shimla-kufri.jpg","/img/shimla-viceregal-lodge.jpeg"],
  "rishikesh":    ["/img/rishikesh-laxman-jhula.jpg","/img/rishikesh-rafting.jpg","/img/rishikesh-triveni-ghat.jpg","/img/rishikesh-beatles-ashram.jpg","/img/rishikesh-neelkanth-temple.jpg"],
  // West India
  "mumbai":       ["/img/mumbai-gateway-of-india.jpg","/img/mumbai-marine-drive.jpg","/img/mumbai-elephanta-caves.jpg","/img/mumbai-bandra-worli-sealink.jpg","/img/mumbai-siddhivinayak.jpeg"],
  "goa":          ["/img/goa-baga-beach.jpg","/img/goa-basilica-bom-jesus.jpg","/img/goa-fort-aguada.jpg","/img/goa-dudhsagar-falls.jpg","/img/goa-palolem-beach.jpg"],
  "udaipur":      ["/img/udaipur-city-palace.jpg","/img/udaipur-lake-pichola.jpg","/img/udaipur-jag-mandir.jpg","/img/udaipur-fateh-sagar-lake.jpg","/img/udaipur-saheliyon-ki-bari.jpg"],
  "jodhpur":      ["/img/jodhpur-mehrangarh-fort.jpg","/img/jodhpur-blue-city.jpg","/img/jodhpur-umaid-bhawan.jpg","/img/jodhpur-jaswant-thada.jpg","/img/jodhpur-clock-tower.jpg"],
  "ahmedabad":    ["/img/ahmedabad-sabarmati-ashram.jpg","/img/ahmedabad-adalaj-stepwell.jpg","/img/ahmedabad-sidi-saiyyed-mosque.jpg","/img/ahmedabad-kankaria-lake.jpg","/img/ahmedabad-swaminarayan-temple.jpg"],
  "rann-of-kutch":["/img/rann-rann-utsav.jpg","/img/rann-kalo-dungar.jpg","/img/rann-wild-ass-sanctuary.jpg","/img/rann-dholavira.jpeg","/img/rann-white-desert.jpeg"],
  "mount-abu":    ["/img/mount-abu-dilwara-temples.jpg","/img/mount-abu-guru-shikhar.jpg","/img/mount-abu-achalgarh-fort.jpg","/img/mount-abu-wildlife-sanctuary.jpeg","/img/mount-abu-nakki-lake.jpg"],
  "pune":         ["/img/pune-shaniwar-wada.jpg","/img/pune-sinhagad-fort.jpg","/img/pune-dagdusheth-temple.jpg","/img/pune-aga-khan-palace.jpg","/img/pune-osho-ashram.jpg"],
  "lakshadweep":  ["/img/lakshadweep-kalpeni-reef.jpg","/img/lakshadweep-kavaratti.jpg","/img/lakshadweep-minicoy-lighthouse.jpg","/img/lakshadweep-bangaram-island.jpg"],
  "daman-and-diu":["/img/daman-nagoa-beach.jpg","/img/daman-st-pauls-church.jpg","/img/daman-naida-caves.jpg","/img/daman-moti-fort.jpg","/img/daman-diu-fort.jpg"],
  // East India
  "kolkata":      ["/img/kolkata-howrah-bridge.jpg","/img/kolkata-victoria-memoria.jpg","/img/kolkata-dakshineswar.jpg","/img/kolkata-college-street.jpg","/img/kolkata-durga-puja.jpg"],
  "darjeeling":   ["/img/darjeeling-tiger-hill.jpg","/img/darjeeling-toy-train.jpg","/img/darjeeling-tea-garden.jpg","/img/darjeeling-batasia-loop.jpg","/img/darjeeling-peace-pagoda.jpg"],
  "assam":        ["/img/assam-kaziranga-rhino.jpg","/img/assam-kamakhya-temple.jpg","/img/assam-majuli-island.jpg","/img/assam-tea-garden.jpg","/img/assam-brahmaputra-river.jpg"],
  "kaziranga":    ["/img/kaziranga-one-horn-rhino.jpg","/img/kaziranga-elephant-safari.jpg","/img/kaziranga-tiger.jpg","/img/kaziranga-wild-buffalo.jpg","/img/kaziranga-watchtower.jpg"],
  "gangtok":      ["/img/gangtok-kanchenjunga-view.jpeg","/img/gangtok-tsomgo-lake.jpg","/img/gangtok-rumtek-monastery.jpg","/img/gangtok-nathula-pass.jpg","/img/gangtok-mg-marg.jpg"],
  "sundarbans":   ["/img/sundarbans-royal-bengal-tiger.jpg","/img/sundarbans-boat-safari.jpg","/img/sundarbans-mangrove-forest.jpg","/img/sundarbans-spotted-deer.jpg","/img/sundarbans-sudhanyakhali-watchtower..jpg"],
  "konark":       ["/img/konark-sun-temple.jpg","/img/konark-wheel-of-time.jpg","/img/konark-natya-mandap.jpg","/img/konark-chandrabhaga-beach.jpg","/img/konark-dance-festival.jpg"],
  "shillong":     ["/img/shillong-elephant-falls.jpg","/img/shillong-umiam-lake.jpg","/img/shillong-living-root-bridge.jpg","/img/shillong-mawlynnong-village.jpg","/img/shillong-don-bosco-museum.jpg"],
  "meghalaya":    ["/img/meghalaya-nohkalikai-falls.jpg","/img/meghalaya-dawki-river.jpg","/img/meghalaya-mawlynnong.jpg","/img/meghalaya-shillong-peak.jpg","/img/meghalaya-root-bridge.jpg"],
  "andaman":      ["/img/andaman-radhanagar-beach.jpg","/img/andaman-cellular-jail.jpg","/img/andaman-coral-reef.jpg","/img/andaman-elephant-beach.jpg","/img/andaman-north-bay-island.jpg"],
  // South India
  "kerala":       ["/img/kerala-alleppey-houseboat.jpg","/img/kerala-munnar-tea.jpg","/img/kerala-kovalam-beach.jpg","/img/kerala-periyar-wildlife.jpg","/img/kerala-kathakali.jpg"],
  "chennai":      ["/img/chennai-marina-beach.jpg","/img/chennai-kapaleeshwarar-temple.jpg","/img/chennai-fort-st-george.jpg","/img/chennai-mahabalipuram.jpg","/img/chennai-government-museum.jpg"],
  "bengaluru":    ["/img/bengaluru-lalbagh.jpg","/img/bengaluru-cubbon-park.jpg","/img/bengaluru-vidhana-soudha.jpg","/img/bengaluru-iskcon-temple.jpg","/img/bengaluru-mysore-palace-night.jpg"],
  "hyderabad":    ["/img/hyderabad-charminar.jpg","/img/hyderabad-golconda-fort.jpg","/img/hyderabad-hussain-sagar.jpg","/img/hyderabad-chowmahalla-palace.jpg","/img/hyderabad-ramoji-film-city.jpg"],
  "mysuru":       ["/img/mysuru-mysore-palace.jpeg","/img/mysuru-chamundi-hills.jpg","/img/mysuru-brindavan-gardens.jpg","/img/mysuru-devaraja-market.jpg","/img/mysuru-mysore-zoo.jpg"],
  "madurai":      ["/img/madurai-meenakshi-temple.jpg","/img/madurai-thirumalai-nayakkar.jpg","/img/madurai-alagar-kovil.jpg","/img/madurai-vandiyur-mariamman.jpg","/img/madurai-koodal-azhagar.jpg"],
  "hampi":        ["/img/hampi-virupaksha-temple.jpg","/img/hampi-vittala-temple.jpg","/img/hampi-lotus-mahal.jpg","/img/hampi-elephant-stables.jpg","/img/hampi-boulder-landscape.jpg"],
  "ooty":         ["/img/ooty-ooty-lake.jpg","/img/ooty-botanical-garden.jpg","/img/ooty-doddabetta-peak.jpg","/img/ooty-nilgiri-railway.jpg","/img/ooty-tea-museum.jpg"],
  "coorg":        ["/img/coorg-abbey-falls.jpg","/img/coorg-coffee-plantation.jpg","/img/coorg-raja-seat.jpg","/img/coorg-namdroling-monastery.jpg","/img/coorg-talakaveri.jpg"],
  "pondicherry":  ["/img/pondicherry-french-quarter.jpg","/img/pondicherry-promenade-beach.jpg","/img/pondicherry-auroville.jpg","/img/pondicherry-paradise-beach.jpg","/img/pondicherry-basilica-sacred-heart.jpg"],
  "tirupati":     ["/img/tirupati-venkateswara-temple.jpg","/img/tirupati-tirumala-hills.jpeg","/img/tirupati-sri-kalahasti.jpg","/img/tirupati-akasa-ganga.jpg","/img/tirupati-silathoranam.jpg"],
  "rameshwaram":  ["/img/rameshwaram-ramanathaswamy-temple.jpg","/img/rameshwaram-pamban-bridge.jpg","/img/rameshwaram-dhanushkodi.jpg","/img/rameshwaram-adams-bridge.jpg","/img/rameshwaram-agnitheertham..jpg"],
  "munnar":       ["/img/munnar-tea-estates.jpg","/img/munnar-eravikulam-national-park.jpg","/img/munnar-mattupetty-dam.jpg","/img/munnar-top-station.jpg","/img/munnar-attukal-waterfalls.jpg"],
  "kanyakumari":  ["/img/kanyakumari-vivekananda-rock.jpg","/img/kanyakumari-thiruvalluvar-statue.jpg","/img/kanyakumari-sunrise.jpg","/img/kanyakumari-sunset-point.jpg","/img/kanyakumari-kumari-amman-temple.jpg"],
  "vizag":        ["/img/vizag-rishikonda-beach.jpg","/img/vizag-submarine-museum.jpg","/img/vizag-araku-valley.jpg","/img/vizag-borra-caves.jpg","/img/vizag-simhachalam-temple.jpg"],
  "kodaikanal":   ["/img/kodaikanal-kodai-lake.jpg","/img/kodaikanal-coakers-walk.jpg","/img/kodaikanal-pillar-rocks.jpg","/img/kodaikanal-green-valley.jpg","/img/kodaikanal-bear-shola-falls.jpg"],
};
const { generateItinerary } = require("./itinerary");
const { getChatReply } = require("./chatbot");

const app = express();

const airlineCodes = {
	"IndiGo": "6E",
	"Air India": "AI",
	"Air India Express": "IX",
	"SpiceJet": "SG",
	"Akasa Air": "QP",
	"Star Air": "S5",
};

function stableHashInt(value) {
	const s = String(value || "");
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function buildDisplayFlightNo(f) {
	const code = airlineCodes[f.airline] || String(f.airline || "").slice(0, 2).toUpperCase();
	const basis = `${code}|${f.fromCode || f.from}|${f.toCode || f.to}|${f.depart || ""}|${f.id || ""}`;
	const n = 100 + (stableHashInt(basis) % 9900); // 100–9999
	return `${code} ${n}`;
}

function buildDisplayFlightNoForSegment(seg, airports, seed) {
	if (!seg || !seg.airline) return null;
	const fromAirport = airports[seg.from] || {};
	const toAirport = airports[seg.to] || {};
	const fromCode = fromAirport.iata || seg.from;
	const toCode = toAirport.iata || seg.to;
	const code = airlineCodes[seg.airline] || String(seg.airline || "").slice(0, 2).toUpperCase();
	const basis = `${code}|${fromCode}|${toCode}|${seed || ""}|SEG`;
	const n = 100 + (stableHashInt(basis) % 9900);
	return `${code} ${n}`;
}

function enrichFlightForUI(f) {
	const seg = buildFlightSegments(f, airports);
	const trust = getTrustMetrics(f);
	const secondaryDisplayFlightNo =
		seg && Array.isArray(seg.segments) && seg.segments.length === 2
			? buildDisplayFlightNoForSegment(seg.segments[1], airports, `${f.depart || ""}|${f.id || ""}`)
			: null;
	return {
		...f,
		displayFlightNo: buildDisplayFlightNo(f),
		meta: {
			...seg,
			layoverStr: seg.layoverMinutes != null ? minutesToDurationStr(seg.layoverMinutes) : null,
			secondaryDisplayFlightNo,
			segStrs: Array.isArray(seg.segments)
				? seg.segments.map((s) => ({
					from: s.from,
					to: s.to,
					airline: s.airline || null,
					duration: s.minutes != null ? minutesToDurationStr(s.minutes) : "—",
				}))
				: [],
		},
		rating: trust.rating,
		onTimePct: trust.onTimePct,
	};
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.render("pages/home", {
		title: "GoTrip",
		destinations,
	});
});

app.get("/flights", (req, res) => {
	const from   = (req.query.from   || "").trim();
	const to     = (req.query.to     || "").trim();
	const city   = (req.query.city   || "").trim();
	const sortBy = (req.query.sortBy || "price").trim();
	const tripType = (req.query.tripType || "oneway").trim();
	const departDate = (req.query.departDate || "").trim();
	const returnDate = (req.query.returnDate || "").trim();

	function filterFlights(list, fromCity, toCity) {
		return list.filter((f) => {
			const fromOk = !fromCity || f.from.toLowerCase() === fromCity.toLowerCase();
			const toOk   = !toCity   || f.to.toLowerCase()   === toCity.toLowerCase();
			return fromOk && toOk;
		});
	}

	function sortFlights(list) {
		if (sortBy === "duration") {
			return list.sort((a, b) => {
				const toDuration = (d) => {
					if (!d) return 999;
					const m = d.match(/(\d+)h\s*(\d+)?m?/);
					return m ? parseInt(m[1]) * 60 + parseInt(m[2] || 0) : 999;
				};
				return toDuration(a.duration) - toDuration(b.duration);
			});
		}
		if (sortBy === "depart") {
			return list.sort((a, b) => (a.depart || "").localeCompare(b.depart || ""));
		}
		// default: price ascending
		return list.sort((a, b) => a.priceINR - b.priceINR);
	}

	let filtered = from || to ? filterFlights(flights, from, to) : flights;
	if (!from && !to && city) {
		const c = city.toLowerCase();
		filtered = flights.filter((f) => f.from.toLowerCase() === c || f.to.toLowerCase() === c);
	}

	// If a specific route is requested but doesn't exist in the dataset,
	// generate 1-stop options via major hubs (adds realistic layover time).
	if (from && to && !filtered.length) {
		filtered = generateHubConnections({
			from,
			to,
			airports,
			// Keep hubs consistent with the UI defaults.
			hubCities: ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"],
			maxHubs: 2,
		});
	}

	filtered = sortFlights(filtered).map(enrichFlightForUI);

	// Round-trip: build return flights (to → from)
	let returnFlights = null;
	if (tripType.toLowerCase() === "round" && from && to) {
		returnFlights = filterFlights(flights, to, from);
		if (!returnFlights.length) {
			returnFlights = generateHubConnections({
				from: to,
				to: from,
				airports,
				hubCities: ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"],
				maxHubs: 2,
			});
		}
		returnFlights = sortFlights(returnFlights).map(enrichFlightForUI);
	}

	res.render("pages/flights", {
		title: "Flights",
		from,
		to,
		city,
		sortBy,
		tripType,
		departDate,
		returnDate,
		flights: filtered,
		returnFlights,
		destinations,
		airports,
		airlineLogos,
		airlineCodes,
	});
});

app.get("/hotels", (req, res) => {
	const city = (req.query.city || "").trim();

	const filtered = hotels.filter((h) => {
		if (!city) return true;
		return h.city.toLowerCase() === city.toLowerCase();
	});

	res.render("pages/hotels", {
		title: "Hotels",
		city,
		hotels: filtered,
		destinations,
	});
});

app.get("/buses", (req, res) => {
	const from = (req.query.from || "").trim();
	const to = (req.query.to || "").trim();

	const filtered = buses.filter((b) => {
		const fromOk = !from || b.from.toLowerCase() === from.toLowerCase();
		const toOk = !to || b.to.toLowerCase() === to.toLowerCase();
		return fromOk && toOk;
	});

	res.render("pages/buses", {
		title: "Buses",
		from,
		to,
		buses: filtered,
	});
});

app.get("/destination/:id", (req, res) => {
  const dest = destinations.find((d) => d.id === req.params.id);
  if (!dest) return res.status(404).render("pages/not-found", { title: "Not Found" });

  const itinerary = generateItinerary(dest.name, 5);
	let relatedFlights = flights
		.filter((f) => f.to.toLowerCase() === dest.name.toLowerCase() || f.from.toLowerCase() === dest.name.toLowerCase())
		.sort((a, b) => a.priceINR - b.priceINR)
		.slice(0, 8)
		.map(enrichFlightForUI);

	// If the dataset doesn't include any direct flights to/from this destination,
	// show a few realistic hub-connection options from major cities.
	if (!relatedFlights.length) {
		const hubs = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];
		relatedFlights = generateHubConnections({
			from: hubs[0],
			to: dest.name,
			airports,
			hubCities: hubs,
			maxHubs: 2,
		})
			.map(enrichFlightForUI)
			.slice(0, 6);
	}
  const relatedHotels  = hotels.filter((h) => h.city === dest.name).slice(0, 4);
  const relatedBuses   = buses.filter((b) => b.to === dest.name || b.from === dest.name).slice(0, 4);

  res.render("pages/destination", {
    title: dest.name,
    dest,
    itinerary,
    relatedFlights,
    relatedHotels,
    relatedBuses,
    gallery: destinationGallery[dest.id] || [],
		airports,
		airlineLogos,
		airlineCodes,
  });
});

app.get("/itinerary", (req, res) => {
	const destination = (req.query.destination || "").trim();
	const daysRaw = (req.query.days || "").trim();
	const from = (req.query.from || "").trim();
	const days = daysRaw ? Number(daysRaw) : 0;

	const itinerary =
		destination && Number.isFinite(days) && days > 0
			? generateItinerary(destination, days, from)
			: null;

	res.render("pages/itinerary", {
		title: "Itinerary",
		destinations,
		destination,
		days: daysRaw,
		from,
		itinerary,
	});
});

app.get("/payment", (req, res) => {
	const kind = String(Array.isArray(req.query.kind) ? req.query.kind[0] : req.query.kind || "Item").trim();
	const id   = String(Array.isArray(req.query.id)   ? req.query.id[0]   : req.query.id   || "").trim();

	let flight = null;
	if (String(kind || "").toLowerCase() === "flight" && id) {
		const f = flights.find((x) => String(x && x.id) === String(id));
		if (f) flight = enrichFlightForUI(f);
	}

	let hotel = null;
	if (String(kind || "").toLowerCase() === "hotel" && id) {
		hotel = hotels.find((x) => String(x && x.id) === String(id)) || null;
	}

	let bus = null;
	if (String(kind || "").toLowerCase() === "bus" && id) {
		bus = buses.find((x) => String(x && x.id) === String(id)) || null;
	}

	res.render("pages/payment", {
		title: "Payment",
		kind,
		id,
		flight,
		hotel,
		bus,
	});
});

app.post("/api/chat", (req, res) => {
	const message = req.body && typeof req.body.message === "string" ? req.body.message : "";
	const result = getChatReply({ message, destinations, hotels, flights });
	res.json(result);
});

app.use((req, res) => {
	res.status(404).render("pages/not-found", {
		title: "Not Found",
	});
});

const preferredPort = Number(process.env.PORT) || 3000;

function listenWithFallback(startPort, maxTries) {
	const maxPort = startPort + Math.max(0, Number(maxTries) || 0);

	function attempt(port) {
		const server = app.listen(port, () => {
			console.log(`GoTrip running on http://localhost:${port}`);
		});

		server.on("error", (err) => {
			if (err && err.code === "EADDRINUSE" && port < maxPort) {
				console.warn(`Port ${port} is in use; trying ${port + 1}...`);
				try {
					server.close();
				} catch (closeErr) {
					// ignore close error
				}
				attempt(port + 1);
				return;
			}

			console.error(err);
			process.exit(1);
		});
	}

	attempt(startPort);
}

// Global safety nets — prevent crash on unhandled promise rejections
process.on("unhandledRejection", function (reason) {
	console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", function (err) {
	console.error("Uncaught exception:", err);
});

// Try preferred port first, then fall back up to 20 ports ahead.
if (!process.env.VERCEL) {
	listenWithFallback(preferredPort, 20);
}

module.exports = app;
