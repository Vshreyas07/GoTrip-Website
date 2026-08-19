function normalizeName(value) {
  return String(value || "").trim();
}

// Each destination lists realistic travel options FROM the nearest major hub city.
// Format: { mode, from, duration, cheapestINR, note }
const travelOptions = {
  /* North */
  Delhi: [
    { mode: "Metro / Local", from: "Any Delhi neighbourhood", duration: "30–60 min", cheapestINR: 50, note: "Delhi Metro covers the whole city; daily pass ₹50" },
    { mode: "Auto / Cab", from: "Airport / Station", duration: "45–90 min", cheapestINR: 250, note: "Meter auto ≈ ₹250; Ola/Uber surge possible" },
  ],
  Agra: [
    { mode: "Train (Gatimaan Express)", from: "New Delhi", duration: "1 hr 40 min", cheapestINR: 755, note: "Fastest option; book 60 days in advance" },
    { mode: "Bus (Volvo AC)", from: "ISBT Kashmere Gate, Delhi", duration: "3–4 hrs", cheapestINR: 350, note: "UPSRTC Volvo; frequent departures" },
    { mode: "Car / Cab", from: "New Delhi", duration: "3–4 hrs", cheapestINR: 2200, note: "Via Yamuna Expressway; toll extra" },
    { mode: "Flight", from: "Indira Gandhi Airport (DEL)", duration: "~50 min + transfer", cheapestINR: 3500, note: "Pantnagar/Agra airport; cheaper than cab only on deals" },
  ],
  Jaipur: [
    { mode: "Train (Shatabdi)", from: "New Delhi", duration: "4 hrs 30 min", cheapestINR: 615, note: "Early morning Shatabdi; book in advance" },
    { mode: "Bus (Volvo AC)", from: "ISBT Kashmere Gate, Delhi", duration: "5–6 hrs", cheapestINR: 550, note: "RSRTC Volvo; overnight option available" },
    { mode: "Car / Cab", from: "New Delhi", duration: "5 hrs", cheapestINR: 3200, note: "NH48 via Gurugram; toll extra" },
    { mode: "Flight", from: "Indira Gandhi Airport (DEL)", duration: "1 hr", cheapestINR: 2500, note: "Best on weekday mornings" },
  ],
  Varanasi: [
    { mode: "Train (Vande Bharat)", from: "New Delhi", duration: "8 hrs", cheapestINR: 1490, note: "Fastest train option; 2x daily" },
    { mode: "Overnight Train", from: "New Delhi", duration: "12–14 hrs", cheapestINR: 450, note: "Sleeper class; departs evening, arrives morning" },
    { mode: "Flight", from: "Indira Gandhi Airport (DEL)", duration: "1 hr 20 min", cheapestINR: 3200, note: "Multiple daily flights; book early" },
    { mode: "Bus", from: "New Delhi (ISBT)", duration: "14–16 hrs", cheapestINR: 700, note: "Overnight semi-sleeper; budget option" },
  ],
  Manali: [
    { mode: "Volvo Bus (overnight)", from: "ISBT Kashmere Gate, Delhi", duration: "14–16 hrs", cheapestINR: 1200, note: "HRTC Volvo AC; most popular; departs 5–7 PM" },
    { mode: "Car / Cab", from: "New Delhi", duration: "12–14 hrs", cheapestINR: 6000, note: "Via NH3 Kullu Valley; scenic but tiring in one go" },
    { mode: "Flight + Taxi", from: "Delhi → Kullu (KUU)", duration: "1 hr + 1.5 hr taxi", cheapestINR: 5000, note: "Kullu-Manali airport; weather-dependent" },
  ],
  Ladakh: [
    { mode: "Flight", from: "Indira Gandhi Airport (DEL)", duration: "1 hr 20 min", cheapestINR: 5500, note: "Only practical option Oct–May; book early in season" },
    { mode: "Road (2 days)", from: "Manali", duration: "2 days via Rohtang/Baralacha", cheapestINR: 3500, note: "Jun–Oct only; shared Sumo ≈ ₹3500; spectacular route" },
    { mode: "Road (via Srinagar)", from: "Srinagar", duration: "2 days", cheapestINR: 3000, note: "NH1D; via Zoji La Pass; open Jun–Oct" },
  ],
  Amritsar: [
    { mode: "Train (Shatabdi)", from: "New Delhi", duration: "6 hrs", cheapestINR: 900, note: "Daily morning Shatabdi; chair car" },
    { mode: "Bus (Volvo AC)", from: "ISBT Kashmere Gate, Delhi", duration: "7–8 hrs", cheapestINR: 700, note: "PRTC/HRTC Volvo; overnight available" },
    { mode: "Flight", from: "Indira Gandhi Airport (DEL)", duration: "1 hr", cheapestINR: 2800, note: "Sri Guru Ram Dass Jee Airport" },
    { mode: "Car / Cab", from: "New Delhi", duration: "6 hrs", cheapestINR: 4500, note: "Via NH1 (GT Road)" },
  ],
  Shimla: [
    { mode: "Volvo Bus", from: "ISBT Kashmere Gate, Delhi", duration: "8–9 hrs", cheapestINR: 650, note: "HRTC Volvo semi-sleeper" },
    { mode: "Car / Cab", from: "New Delhi", duration: "7–8 hrs", cheapestINR: 4000, note: "Via Chandigarh NH5; hill roads after Solan" },
    { mode: "Train + Toy Train", from: "Delhi → Kalka, then toy train", duration: "6 hr train + 5 hr toy train", cheapestINR: 700, note: "Shatabdi to Kalka; Kalka–Shimla Heritage Railway UNESCO" },
  ],
  Rishikesh: [
    { mode: "Bus", from: "ISBT Kashmere Gate, Delhi", duration: "6–7 hrs", cheapestINR: 350, note: "UPSRTC ordinary; very affordable" },
    { mode: "Train", from: "New Delhi → Haridwar, then shared auto", duration: "4.5 hrs + 30 min", cheapestINR: 400, note: "Shatabdi to Haridwar; 20 km onward" },
    { mode: "Car / Cab", from: "New Delhi", duration: "5–6 hrs", cheapestINR: 3200, note: "Via NH34 Meerut bypass" },
  ],
  /* West */
  Mumbai: [
    { mode: "Flight", from: "Major Indian cities", duration: "1–2.5 hrs", cheapestINR: 2200, note: "Chhatrapati Shivaji airport; multiple daily flights" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "16 hrs", cheapestINR: 1200, note: "3A/sleeper; overnight; most budget travellers prefer this" },
    { mode: "Bus (Volvo AC)", from: "Pune", duration: "3–4 hrs", cheapestINR: 450, note: "ExpressBus / MSRTC; frequent" },
    { mode: "Car / Cab", from: "Pune", duration: "3 hrs", cheapestINR: 2800, note: "Via Expressway; toll ≈ ₹400" },
  ],
  Goa: [
    { mode: "Flight", from: "Mumbai", duration: "1 hr", cheapestINR: 2500, note: "Manohar Airport; book 3+ weeks ahead" },
    { mode: "Train (Konkan Railway)", from: "Mumbai (LTT)", duration: "8–12 hrs", cheapestINR: 350, note: "Scenic Konkan route; Sleeper class cheap" },
    { mode: "Overnight Volvo Bus", from: "Mumbai / Pune", duration: "10–12 hrs", cheapestINR: 900, note: "Seabird / Paulo Travels; very popular" },
    { mode: "Car / Cab", from: "Pune", duration: "8 hrs", cheapestINR: 5500, note: "Via NH748 Kolhapur route" },
  ],
  Udaipur: [
    { mode: "Train", from: "Jaipur", duration: "5 hrs", cheapestINR: 280, note: "Mewar Express; scenic Aravalli route" },
    { mode: "Flight", from: "Mumbai", duration: "1 hr 20 min", cheapestINR: 3500, note: "Maharana Pratap Airport; daily flights" },
    { mode: "Bus", from: "Jaipur", duration: "6–7 hrs", cheapestINR: 450, note: "RSRTC Volvo; overnight available" },
    { mode: "Car / Cab", from: "Jaipur", duration: "5 hrs", cheapestINR: 3500, note: "Via NH48 Chittorgarh" },
  ],
  Jodhpur: [
    { mode: "Train", from: "Jaipur", duration: "5 hrs", cheapestINR: 280, note: "Intercity trains; daily" },
    { mode: "Bus (Volvo AC)", from: "Jaipur", duration: "5–6 hrs", cheapestINR: 500, note: "RSRTC Volvo; reliable" },
    { mode: "Flight", from: "Delhi", duration: "1 hr 15 min", cheapestINR: 3200, note: "Jodhpur Airport; limited flights" },
    { mode: "Car / Cab", from: "Jaipur", duration: "5 hrs", cheapestINR: 3800, note: "Via NH58" },
  ],
  Ahmedabad: [
    { mode: "Train (Shatabdi)", from: "Mumbai Central", duration: "6 hrs", cheapestINR: 780, note: "Morning Shatabdi; most convenient" },
    { mode: "Flight", from: "Mumbai", duration: "1 hr", cheapestINR: 2200, note: "Sardar Vallabhbhai Patel Airport" },
    { mode: "Bus (Volvo AC)", from: "Mumbai", duration: "8–9 hrs", cheapestINR: 700, note: "SRS / GSRTC Volvo overnight" },
    { mode: "Car / Cab", from: "Mumbai", duration: "8 hrs", cheapestINR: 6000, note: "Via NH48" },
  ],
  "Rann of Kutch": [
    { mode: "Flight + Car", from: "Mumbai → Bhuj Airport + 1 hr drive", duration: "1.5 hr flight + 1 hr", cheapestINR: 4500, note: "Bhuj airport; cabs available outside" },
    { mode: "Train + Car", from: "Ahmedabad → Bhuj train + taxi", duration: "7 hrs + 1 hr", cheapestINR: 400, note: "Rann Rider / Bhuj Exp; shared cab ≈ ₹400" },
    { mode: "Bus", from: "Ahmedabad", duration: "9–10 hrs", cheapestINR: 350, note: "GSRTC ordinary to Bhuj" },
  ],
  "Mount Abu": [
    { mode: "Bus", from: "Ahmedabad", duration: "5–6 hrs", cheapestINR: 350, note: "RSRTC/GSRTC; change at Abu Road or direct" },
    { mode: "Train + Taxi", from: "Ahmedabad → Abu Road stn + taxi", duration: "4 hrs + 30 min", cheapestINR: 300, note: "Sampark Kranti; taxi uphill ≈ ₹200" },
    { mode: "Car / Cab", from: "Udaipur", duration: "3 hrs", cheapestINR: 2200, note: "Via NH27; scenic Aravalli drive" },
  ],
  Pune: [
    { mode: "Bus (Expressway Volvo)", from: "Mumbai", duration: "3 hrs", cheapestINR: 350, note: "MSRTC Shivneri; every 30 min from Dadar" },
    { mode: "Train (Deccan Queen)", from: "Mumbai CST", duration: "3 hrs 30 min", cheapestINR: 295, note: "Iconic train; book early for weekend" },
    { mode: "Car / Cab", from: "Mumbai", duration: "2.5–3 hrs", cheapestINR: 2500, note: "Via Mumbai-Pune Expressway; toll ≈ ₹320" },
    { mode: "Flight", from: "Delhi", duration: "1 hr 45 min", cheapestINR: 2800, note: "Pune Airport; limited international" },
  ],
  "Lakshadweep Islands": [
    { mode: "Flight", from: "Kochi (Cochin Airport)", duration: "1.5 hrs", cheapestINR: 6500, note: "Agatti Island Airport; only way in; book months ahead" },
    { mode: "Ship (MV Arabian Sea)", from: "Kochi harbour", duration: "14–20 hrs", cheapestINR: 3200, note: "LAKSHADWEEP SHIP; budget bunk cabin; 2–3 sailings/week" },
  ],
  "Daman and Diu": [
    { mode: "Bus (Gujarat ST)", from: "Ahmedabad", duration: "6–7 hrs", cheapestINR: 350, note: "GSRTC to Vapi then taxi 12 km to Daman; direct buses available" },
    { mode: "Train + Taxi", from: "Mumbai → Vapi station + taxi", duration: "2.5 hrs train + 30 min taxi", cheapestINR: 280, note: "Vapi is nearest railhead; autos and taxis available" },
    { mode: "Car / Cab", from: "Mumbai", duration: "4.5 hrs", cheapestINR: 3800, note: "Via NH48 to Vapi then NH151A; scenic coastal road" },
    { mode: "Flight + Taxi", from: "Mumbai → Diu Airport", duration: "1 hr flight + local taxi", cheapestINR: 3500, note: "Diu has a small airport; IndiGo seasonal flights" },
  ],

  /* East */
  Kolkata: [
    { mode: "Flight", from: "Mumbai / Delhi", duration: "2–2.5 hrs", cheapestINR: 2800, note: "Netaji Subhas Chandra Bose Airport; busy hub" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "17 hrs", cheapestINR: 1200, note: "Overnight; 3A class comfortable" },
    { mode: "Bus", from: "Bhubaneswar", duration: "7–8 hrs", cheapestINR: 500, note: "OSRTC or private sleeper; overnight" },
  ],
  Darjeeling: [
    { mode: "Flight + Taxi", from: "Kolkata → Bagdogra Airport + 3 hr taxi", duration: "1 hr + 3 hrs", cheapestINR: 4000, note: "Bagdogra is closest airport; shared jeep ≈ ₹300" },
    { mode: "Train + Toy Train", from: "Kolkata → NJP station + toy train", duration: "8–10 hrs + 7 hrs", cheapestINR: 500, note: "NJP = New Jalpaiguri; DHR toy train ₹250 extra" },
    { mode: "Shared Jeep", from: "NJP / Siliguri", duration: "3 hrs", cheapestINR: 300, note: "Fastest hill option; no prior booking" },
  ],
  Assam: [
    { mode: "Flight", from: "Kolkata / Delhi", duration: "1 hr", cheapestINR: 2800, note: "Lokpriya Gopinath Bordoloi Airport, Guwahati; well connected" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "26 hrs", cheapestINR: 1100, note: "Kamrup Express or NE Rajdhani to Guwahati; 3A class" },
    { mode: "Bus", from: "Kolkata", duration: "18–20 hrs", cheapestINR: 700, note: "ASTC/private Volvo overnight; via NH17" },
    { mode: "Car / Cab", from: "Guwahati", duration: "3–4 hrs to tea garden areas", cheapestINR: 2500, note: "NH27 to Jorhat / Sivsagar; comfortable drive" },
  ],
  Meghalaya: [
    { mode: "Flight", from: "Kolkata / Delhi", duration: "1 hr (to Guwahati)", cheapestINR: 2800, note: "Fly to Guwahati (LGB); Shillong is 100 km / 2.5 hrs by cab" },
    { mode: "Train + Bus/Cab", from: "New Delhi → Guwahati + drive", duration: "26 hrs train + 2.5 hrs", cheapestINR: 1100, note: "NE Rajdhani to Guwahati; ASTC bus or shared cab to Shillong" },
    { mode: "Bus", from: "Guwahati", duration: "2.5–3 hrs", cheapestINR: 150, note: "ASTC / Meghalaya Transport to Shillong; very frequent" },
    { mode: "Car / Cab", from: "Guwahati", duration: "2 hrs", cheapestINR: 2000, note: "Via NH6; Umiam Lake view en route; shared taxis ₹400" },
  ],
  Kaziranga: [
    { mode: "Flight + Bus/Taxi", from: "Kolkata → Jorhat/Guwahati + drive", duration: "1 hr flight + 3 hr drive", cheapestINR: 4500, note: "Guwahati airport; Kaziranga is 217 km; shared bus cheaper" },
    { mode: "Train + Bus", from: "Kolkata → Furkating + bus", duration: "18 hrs + 1 hr", cheapestINR: 700, note: "Furkating is closest station; buses to park gate" },
    { mode: "Car / Cab", from: "Guwahati", duration: "3.5 hrs", cheapestINR: 3000, note: "Via NH37; self-drive available" },
  ],
  Gangtok: [
    { mode: "Flight + Taxi", from: "Kolkata → Bagdogra + shared jeep", duration: "1 hr + 4 hrs", cheapestINR: 4200, note: "Bagdogra is closest airport; jeep ≈ ₹400–600" },
    { mode: "Train + Jeep", from: "Kolkata → NJP + shared jeep", duration: "10 hrs + 4 hrs", cheapestINR: 600, note: "No rail to Gangtok; jeep from Siliguri" },
    { mode: "Helicopter", from: "Bagdogra", duration: "30 min", cheapestINR: 5500, note: "Pawan Hans; weather-dependent; book online" },
  ],
  Sundarbans: [
    { mode: "Train + Boat", from: "Kolkata Sealdah → Canning + launch", duration: "1 hr + 2 hrs", cheapestINR: 250, note: "Cheapest option; Canning is the gateway town" },
    { mode: "Car + Boat", from: "Kolkata", duration: "3 hrs drive + boat", cheapestINR: 2500, note: "Via Basanti; booked day tour packages" },
    { mode: "Tour Package", from: "Kolkata", duration: "2 days", cheapestINR: 2800, note: "Overnight forest package incl. boat + stay" },
  ],
  Konark: [
    { mode: "Bus", from: "Bhubaneswar", duration: "1.5–2 hrs", cheapestINR: 60, note: "OSRTC frequent; cheapest option" },
    { mode: "Car / Cab", from: "Bhubaneswar", duration: "1.5 hrs", cheapestINR: 1500, note: "Via Puri road; day trip easy" },
    { mode: "Cycle-Rickshaw / Auto", from: "Puri", duration: "1 hr 10 min by cab", cheapestINR: 500, note: "Puri–Konark Marine Drive; very scenic" },
  ],
  Shillong: [
    { mode: "Flight + Taxi", from: "Kolkata → Umroi Airport + taxi", duration: "1 hr + 30 min", cheapestINR: 4500, note: "Limited flights; taxi ≈ ₹600 to city" },
    { mode: "Bus", from: "Guwahati", duration: "3–4 hrs", cheapestINR: 150, note: "ASTC / private minibus; very frequent" },
    { mode: "Car / Cab", from: "Guwahati", duration: "2.5 hrs", cheapestINR: 2000, note: "Via Jorabat; shared taxis available ≈ ₹400" },
  ],
  "Andaman & Nicobar Islands": [
    { mode: "Flight", from: "Kolkata / Chennai / Delhi", duration: "2–2.5 hrs", cheapestINR: 5500, note: "Veer Savarkar Airport (Port Blair); book 6 wks early" },
    { mode: "Ship (Ferry)", from: "Chennai / Kolkata port", duration: "56–70 hrs", cheapestINR: 2800, note: "Budget 2-bunk cabin; scenic but slow; 4 sailings/month" },
  ],

  /* South */
  Kerala: [
    { mode: "Flight", from: "Mumbai / Delhi", duration: "1.5–3 hrs", cheapestINR: 3200, note: "Kochi (COK) is main hub; Trivandrum alternate" },
    { mode: "Train (Kerala Express)", from: "New Delhi", duration: "40 hrs", cheapestINR: 850, note: "Sleeper class; book 3 months ahead" },
    { mode: "Bus (Volvo AC)", from: "Bengaluru", duration: "9–11 hrs", cheapestINR: 900, note: "KSRTC Airavat; overnight popular" },
  ],
  Chennai: [
    { mode: "Flight", from: "Mumbai / Delhi / Bangalore", duration: "1–2 hrs", cheapestINR: 2200, note: "Chennai Airport (MAA); second busiest in South" },
    { mode: "Train (Shatabdi)", from: "Bengaluru", duration: "5 hrs", cheapestINR: 610, note: "Morning Shatabdi; very comfortable" },
    { mode: "Bus (Volvo AC)", from: "Bengaluru", duration: "6–7 hrs", cheapestINR: 650, note: "TNSTC / KSRTC Volvo; overnight options" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "28 hrs", cheapestINR: 1300, note: "GT Express; 3A class" },
  ],
  Bengaluru: [
    { mode: "Flight", from: "Mumbai / Delhi / Chennai", duration: "1–2 hrs", cheapestINR: 1800, note: "Kempegowda International (BLR); metro to city" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "33 hrs", cheapestINR: 1200, note: "Karnataka Sampark Kranti; 3A class" },
    { mode: "Bus (Volvo AC)", from: "Chennai", duration: "6–7 hrs", cheapestINR: 600, note: "KSRTC / SETC Volvo; runs all night" },
  ],
  Hyderabad: [
    { mode: "Flight", from: "Mumbai / Delhi / Bangalore", duration: "1–1.5 hrs", cheapestINR: 2000, note: "Rajiv Gandhi Airport (HYD); Hyderabad Metro to city" },
    { mode: "Train (Rajdhani)", from: "New Delhi", duration: "22 hrs", cheapestINR: 1100, note: "AP Rajdhani; sleeper ok" },
    { mode: "Bus (Volvo AC)", from: "Bengaluru", duration: "9–10 hrs", cheapestINR: 700, note: "VRL / SRS overnight Volvo" },
    { mode: "Car / Cab", from: "Bengaluru", duration: "9–10 hrs", cheapestINR: 7000, note: "Via NH44; long drive" },
  ],
  Mysuru: [
    { mode: "Bus (KSRTC Airavat)", from: "Bengaluru", duration: "3 hrs", cheapestINR: 350, note: "Every 30 min from Majestic; AC comfortable" },
    { mode: "Train", from: "Bengaluru City", duration: "2 hrs 30 min", cheapestINR: 130, note: "Chamundi Express / Shatabdi; affordable" },
    { mode: "Car / Cab", from: "Bengaluru", duration: "3 hrs", cheapestINR: 2500, note: "Via NH275; highway good condition" },
  ],
  Madurai: [
    { mode: "Flight", from: "Chennai / Bangalore", duration: "1 hr", cheapestINR: 2800, note: "Madurai Airport; daily flights" },
    { mode: "Train", from: "Chennai Central", duration: "7–8 hrs", cheapestINR: 340, note: "Pandian Express; overnight option" },
    { mode: "Bus (Volvo AC)", from: "Chennai", duration: "8–9 hrs", cheapestINR: 650, note: "SETC Volvo overnight; popular" },
    { mode: "Car / Cab", from: "Bengaluru", duration: "7 hrs", cheapestINR: 5500, note: "Via NH44; tolls extra" },
  ],
  Hampi: [
    { mode: "Overnight Bus", from: "Bengaluru", duration: "8–9 hrs", cheapestINR: 650, note: "KSRTC / private sleeper to Hospet; 13 km to Hampi" },
    { mode: "Train + Auto", from: "Bengaluru → Hospet + 13 km auto", duration: "7 hrs + 30 min", cheapestINR: 400, note: "Hampi Express; iconic route" },
    { mode: "Car / Cab", from: "Bengaluru", duration: "6 hrs", cheapestINR: 5000, note: "Via NH67; direct" },
  ],
  Ooty: [
    { mode: "Bus (TNSTC)", from: "Coimbatore", duration: "3 hrs", cheapestINR: 120, note: "Via Mettupalayam or Coonoor; scenic road" },
    { mode: "Train (Nilgiri Toy Train)", from: "Mettupalayam", duration: "4.5 hrs", cheapestINR: 260, note: "UNESCO heritage; diesel to Coonoor, steam onward" },
    { mode: "Car / Cab", from: "Coimbatore", duration: "2.5 hrs", cheapestINR: 2000, note: "Via Mettupalayam bypass" },
    { mode: "Flight + Bus/Cab", from: "Chennai → Coimbatore airport + 3 hr drive", duration: "1 hr + 3 hrs", cheapestINR: 3500, note: "Coimbatore is nearest airport" },
  ],
  Coorg: [
    { mode: "Bus (KSRTC)", from: "Bengaluru", duration: "5–6 hrs", cheapestINR: 350, note: "KSRTC to Madikeri; daily departures" },
    { mode: "Car / Cab", from: "Bengaluru", duration: "5 hrs", cheapestINR: 4200, note: "Via NH275; coffee estate roads at the end" },
    { mode: "Flight + Taxi", from: "Bangalore → Mysuru road via cab", duration: "4 hrs drive from BLR", cheapestINR: 3800, note: "No airport in Coorg; Mangalore airport 160 km" },
  ],
  Pondicherry: [
    { mode: "Bus (Volvo AC)", from: "Chennai", duration: "3 hrs", cheapestINR: 250, note: "TNSTC AC; frequent from CMBT" },
    { mode: "Car / Cab", from: "Chennai", duration: "2.5 hrs", cheapestINR: 2200, note: "Via ECR (East Coast Road); most scenic" },
    { mode: "Train", from: "Chennai Park", duration: "3.5 hrs", cheapestINR: 90, note: "Puducherry Express; cheapest option" },
  ],
  Tirupati: [
    { mode: "Train", from: "Chennai Central", duration: "2 hrs 30 min", cheapestINR: 155, note: "Multiple trains daily; most convenient" },
    { mode: "Bus (APSRTC)", from: "Chennai", duration: "3–4 hrs", cheapestINR: 200, note: "Frequent super-luxury buses; APSRTC" },
    { mode: "Car / Cab", from: "Chennai", duration: "3 hrs", cheapestINR: 2500, note: "Via NH716; easy drive" },
    { mode: "Flight", from: "Mumbai / Hyderabad", duration: "1–1.5 hrs", cheapestINR: 3500, note: "Tirupati Airport; limited flights" },
  ],
  Rameshwaram: [
    { mode: "Train", from: "Chennai Central", duration: "10–12 hrs", cheapestINR: 350, note: "Sethu Express; overnight sleeper" },
    { mode: "Bus (TNSTC)", from: "Madurai", duration: "3.5–4 hrs", cheapestINR: 150, note: "TNSTC via Mandapam causeway" },
    { mode: "Car / Cab", from: "Madurai", duration: "3 hrs", cheapestINR: 2800, note: "Via NH785" },
  ],
  Munnar: [
    { mode: "Bus (KSRTC)", from: "Kochi (Ernakulam)", duration: "4 hrs", cheapestINR: 160, note: "KSRTC direct; via Kothamangalam" },
    { mode: "Car / Cab", from: "Kochi", duration: "3.5 hrs", cheapestINR: 3200, note: "Via NH85; winding but beautiful ghats" },
    { mode: "Flight + Taxi", from: "Cochin Airport + 3.5 hr drive", duration: "1.5 hr flight + 3.5 hrs", cheapestINR: 4500, note: "Cochin Int'l is nearest airport" },
  ],
  Kanyakumari: [
    { mode: "Train", from: "Chennai Central", duration: "12–13 hrs", cheapestINR: 400, note: "Kanyakumari Express; overnight; southernmost station in India" },
    { mode: "Bus (TNSTC)", from: "Thiruvananthapuram", duration: "1.5 hrs", cheapestINR: 80, note: "Cross-state bus; very frequent" },
    { mode: "Car / Cab", from: "Thiruvananthapuram", duration: "1.5 hrs", cheapestINR: 1500, note: "Via NH44 (India's longest highway ends here)" },
    { mode: "Flight + Bus", from: "Trivandrum Airport (TRV) + bus", duration: "1.5 hr flight + 2 hrs", cheapestINR: 4500, note: "Trivandrum is nearest airport; 87 km" },
  ],
  Kodaikanal: [
    { mode: "Bus (TNSTC)", from: "Madurai", duration: "4 hrs", cheapestINR: 200, note: "TNSTC via Palani–Kodai Road; scenic ghat road" },
    { mode: "Car / Cab", from: "Madurai", duration: "3.5 hrs", cheapestINR: 3000, note: "Via NH38; winding ghat section last 35 km" },
    { mode: "Flight + Bus/Cab", from: "Chennai → Madurai airport + 4 hr drive", duration: "1 hr flight + 4 hrs", cheapestINR: 4500, note: "Madurai (IXM) is the nearest airport; 120 km" },
    { mode: "Train + Taxi", from: "Chennai → Kodai Road station + 64 km taxi", duration: "8 hrs train + 1.5 hr drive", cheapestINR: 1200, note: "Kodai Road (KDAI) is base station; taxi ≈ ₹1000" },
  ],
  Visakhapatnam: [
    { mode: "Flight", from: "Hyderabad / Chennai", duration: "1 hr 10 min", cheapestINR: 2500, note: "Vizag Airport (VTZ); well connected" },
    { mode: "Train (Shatabdi)", from: "Chennai Central", duration: "11 hrs", cheapestINR: 750, note: "Coromandel Express; also Rajdhani from Delhi 20 hrs" },
    { mode: "Bus (Volvo AC)", from: "Hyderabad", duration: "10–11 hrs", cheapestINR: 800, note: "APSRTC / VRL Volvo overnight" },
    { mode: "Car / Cab", from: "Hyderabad", duration: "9–10 hrs", cheapestINR: 7500, note: "Via NH65; long drive" },
  ],
};

// Each destination has up to 10 days of structured { morning, afternoon, evening } activities.
// Activities are real, famous, ordered logically (nearby sights grouped per day).
const destinationPlans = {

  /* ── NORTH INDIA ─────────────────────────────────────────── */
  Delhi: [
    { morning: "India Gate & Rajpath walk — arrive early to beat crowds", afternoon: "Red Fort (Lal Qila) UNESCO site + Chandni Chowk bazaar walk", evening: "Jama Masjid rooftop view + Karim's dinner in old Delhi" },
    { morning: "Qutub Minar UNESCO complex — world's tallest brick minaret", afternoon: "Mehrauli Archaeological Park trail + Jamali Kamali mosque", evening: "Hauz Khas Village — cafes, art galleries, ruins by the lake" },
    { morning: "Humayun's Tomb UNESCO site — Mughal garden tomb", afternoon: "Lotus Temple (Bahá'í) + Iskcon Temple Hare Krishna", evening: "Connaught Place nightlife + Bengali Sweet House desserts" },
    { morning: "Akshardham Temple — intricate stone carvings (opens 9 AM)", afternoon: "National Museum, Janpath + Rajpath heritage zone", evening: "Dilli Haat INA — handicrafts from every Indian state" },
    { morning: "Raj Ghat (Gandhi memorial) + Shanti Vana + Vir Bhumi", afternoon: "National Gandhi Museum + Parliament Street walk", evening: "Khan Market browsing + dinner at Bukhara or Dum Pukht" },
    { morning: "Gurudwara Bangla Sahib — community langar breakfast", afternoon: "National Craft Museum + Purana Qila lakeside", evening: "Lodi Garden sunset stroll + supper at Lodi Restaurant" },
    { morning: "Tughlaqabad Fort ruins — lesser-known, impressive scale", afternoon: "Qila Rai Pithora archaeological trail", evening: "Saket Select Citywalk mall + rooftop dining" },
    { morning: "Swaminarayan Akshardham boat ride & IMAX (book ahead)", afternoon: "Delhi Zoo + Humayun's Tomb revisit at sunset", evening: "Nizamuddin Dargah qawwali (Thursday evenings are magical)" },
    { morning: "Sunder Nursery park + Hazrat Nizamuddin Auliya precinct", afternoon: "Safdarjung's Tomb + Deer Park, Hauz Khas", evening: "Paharganj street food walk + rooftop cafes" },
    { morning: "Delhi Haat Pitampura + Janakpuri Bharat Darshan Park", afternoon: "Chhatarpur Temples complex (largest temple complex in India)", evening: "Ambience Mall Gurgaon + farewell dinner in Cyber Hub" },
  ],

  Agra: [
    { morning: "Taj Mahal sunrise visit (open 6 AM) — golden light is magical", afternoon: "Taj interior chambers + Mehtab Bagh across Yamuna for silhouette view", evening: "Agra Fort light & sound show (seasonal)" },
    { morning: "Agra Fort (Lal Qila) UNESCO — Diwan-i-Am, Jahangiri Mahal", afternoon: "Itimad-ud-Daulah (Baby Taj) — intricate marble inlay work", evening: "Kinari Bazaar shopping — marble inlay souvenirs + petha sweets" },
    { morning: "Fatehpur Sikri UNESCO — Akbar's ghost city, Buland Darwaza", afternoon: "Salim Chishti's Dargah inside Fatehpur Sikri", evening: "Aram Bagh (Ram Bagh) — oldest Mughal garden in India" },
    { morning: "Chini Ka Rauza — Afzal Khan's Persian-tiled tomb", afternoon: "Archaeological Museum Agra Fort + Agra Bear Rescue Facility", evening: "Sadar Bazaar street food — bedai, jalebi, dal moth" },
    { morning: "Akbar's Tomb at Sikandra — red sandstone marvel", afternoon: "Mariam's Tomb + Anguri Bagh inside Agra Fort", evening: "Taj by moonlight visit (on full moon nights — book separately)" },
  ],

  Jaipur: [
    { morning: "Amber Fort (Amer) UNESCO — elephant ride or jeep up to fort", afternoon: "Sheesh Mahal (Mirror Palace) + Ganesh Pol gateway", evening: "Jal Mahal (Water Palace) view from road at dusk" },
    { morning: "Hawa Mahal (Palace of Winds) — iconic honeycomb facade", afternoon: "City Palace Museum — royal collection + Diwan-i-Khas", evening: "Jantar Mantar UNESCO observatory + light show" },
    { morning: "Nahargarh Fort sunrise — panoramic Jaipur skyline views", afternoon: "Jaigarh Fort — world's largest cannon Jaivana", evening: "Chokhi Dhani cultural village — folk dances, traditional Rajasthani dinner" },
    { morning: "Albert Hall Museum — eclectic royal collection", afternoon: "Birla Mandir + Moti Dungri Ganesh Temple", evening: "Bapu Bazaar + Johri Bazaar — bangles, blue pottery, textiles" },
    { morning: "Galta Ji (Monkey Temple) — natural spring kunds", afternoon: "Sisodia Rani Garden + Vidyadhar Garden", evening: "Chaugan Stadium polo grounds + rooftop dinner at Narain Niwas" },
    { morning: "Sanganer village — handmade paper + block printing", afternoon: "Bagru village — traditional block printing factory tour", evening: "Masala Chowk food court — 20 iconic Jaipur street food stalls" },
    { morning: "Rambagh Palace garden walk (even non-guests can visit tea)", afternoon: "Anokhi Museum of Hand Printing, Amber", evening: "Raj Mandir Cinema — India's most ornate art-deco cinema hall" },
  ],

  Varanasi: [
    { morning: "Pre-dawn boat ride on Ganga — watch sunrise + morning rituals at ghats", afternoon: "Kashi Vishwanath Jyotirlinga Temple darshan + Vishwanath Gali", evening: "Grand Ganga Aarti at Dashashwamedh Ghat — spectacular fire ceremony" },
    { morning: "Assi Ghat sunrise yoga + Tulsi Ghat", afternoon: "Sarnath — where Buddha gave first sermon; Dhamek Stupa + museum", evening: "Old city narrow lanes food walk — kachori, lassi, rabri, malaiyyo" },
    { morning: "Manikarnika Ghat — sacred cremation ghat (observe respectfully)", afternoon: "Bharat Mata Mandir — unique temple with map of India in marble", evening: "Classical music concert at Sankat Mochan Foundation (evenings)" },
    { morning: "Ramnagar Fort across the Ganga — vintage car museum", afternoon: "Durga Temple (Monkey Temple) + Sankat Mochan Hanuman Temple", evening: "Boat ride at sunset — lit-up ghats, diyas, aarti from the water" },
    { morning: "Benaras Hindu University campus + Bharat Kala Bhavan museum", afternoon: "Tulsi Manas Temple — Ramcharitmanas inscribed on walls", evening: "Thatheri Bazaar — traditional brass + copper utensil market" },
    { morning: "Morning Ganga aarti at Pancha Ganga Ghat — smaller, authentic", afternoon: "Alamgir Mosque atop Panchganga Ghat — river views", evening: "Subhash Chowk + Godowlia Chowk street food + paan from Keshav Paan Bhandar" },
  ],

  Manali: [
    { morning: "Old Manali village walk + Manu Maharishi Temple", afternoon: "Hadimba Devi Temple (1553 CE) — unique wooden pagoda in cedar forest", evening: "Mall Road evening stroll + Tibetan Market + cafe hopping" },
    { morning: "Solang Valley — paragliding / zorbing / skiing (seasonal)", afternoon: "Rohtang Pass (open May–Oct, permit required) or Beas Kund trek", evening: "Vashisht hot-spring baths + Ram Temple in Vashisht village" },
    { morning: "Atal Tunnel (world's longest road tunnel at 10,000 ft) drive", afternoon: "Sissu Valley meadows + Sissu Lake beyond the tunnel", evening: "Back to Manali — bonfire at camp, apple orchard walk" },
    { morning: "Bijli Mahadev Temple trek (14 km round trip) — legendary lingam", afternoon: "Naggar Castle — Nicholas Roerich Art Gallery + views", evening: "Kullu town — Raghunath Temple + Dhalpur Maidan" },
    { morning: "Great Himalayan National Park day hike (permit needed)", afternoon: "Bhrigu Lake day trek (high altitude meadow lake)", evening: "Campfire at river banks near Beas — river-side dhabas" },
    { morning: "Manikaran Sahib Gurudwara hot springs + langar (25 km away)", afternoon: "Kasol village walk + Kheerganga hot spring trek start", evening: "Kullu rafting on River Beas (Grade III–IV rapids)" },
  ],

  Ladakh: [
    { morning: "Arrive Leh — acclimatise (critical: no exertion on day 1)", afternoon: "Leh Palace ruins (16th c.) view + Namgyal Tsemo Gompa", evening: "Main Bazaar Leh — Tibetan curios, pashmina, local food at Bon Appetit" },
    { morning: "Shanti Stupa (white dome) sunrise walk — panoramic Leh valley", afternoon: "Hall of Fame Museum (Indian Army) + Spituk Monastery", evening: "Stok Palace Museum — royal collection + Stok Kangri views" },
    { morning: "Khardung La pass (18,380 ft — highest motorable road in world)", afternoon: "Nubra Valley via Khardung La — Diskit Monastery", evening: "Hunder Sand Dunes — double-humped Bactrian camel ride at sunset" },
    { morning: "Sumur Monastery + Samstanling Monastery in Nubra", afternoon: "Drive back to Leh via Khardung La", evening: "Leh market dinner — thukpa, momos, butter tea" },
    { morning: "Pangong Tso Lake (4 hrs from Leh) — vivid blue-green lake at 14,270 ft", afternoon: "Merak village on the lake shore", evening: "Overnight camp at Pangong — stargazing, fire, silence" },
    { morning: "Pangong sunrise — colour shifts from blue to turquoise", afternoon: "Changla Pass (17,585 ft) on return + Druk White Lotus School", evening: "Hemis Monastery — largest in Ladakh, Hemis Festival (July)" },
    { morning: "Thiksey Monastery — resembles Potala Palace, Tibet", afternoon: "Shey Palace + Shey Monastery ruins", evening: "Stok village walk + views of Stok Kangri (6,153 m)" },
    { morning: "Alchi Monastery (11th c.) — oldest surviving murals", afternoon: "Likir Monastery + giant Buddha statue + Rizong Monastery", evening: "Nimmu village confluence — Indus & Zanskar rivers meeting point" },
  ],

  Amritsar: [
    { morning: "Golden Temple (Harmandir Sahib) amrit vela visit (4 AM) — most peaceful", afternoon: "Akal Takht + Langar Hall — free community meal (world's largest)", evening: "Golden Temple illuminated — magical reflection in sarovar at night" },
    { morning: "Jallianwala Bagh memorial — emotional, moving history", afternoon: "Partition Museum — India's most important modern history museum", evening: "Wagah Border Beating Retreat ceremony — patriotic, grand spectacle" },
    { morning: "Durgiana Temple — Hindu equivalent of Golden Temple", afternoon: "Ram Tirath Temple + Gobindgarh Fort", evening: "Lawrence Road + Hall Bazaar — kulcha chole, lassi, pinni shopping" },
    { morning: "Maharaja Ranjit Singh Museum (Summer Palace)", afternoon: "Town Hall + Company Bagh + Mata Lal Devi Temple", evening: "Kesar Da Dhaba + Brothers Dhaba — iconic Amritsari cuisine" },
    { morning: "Tarn Taran Sahib Gurudwara (25 km) — largest sarovar in Punjab", afternoon: "Pul Kanjri historic stop + border villages heritage walk", evening: "Phulkari textile market — embroidered shawls, salwar suits" },
  ],

  Shimla: [
    { morning: "Mall Road walk — Scandal Point to Lift (Shimla Lift)", afternoon: "The Ridge + Christ Church (1857) + Library building", evening: "Lakkar Bazaar — handmade wooden crafts + local bakeries" },
    { morning: "Jakhu Temple trek (2.5 km) — Lord Hanuman + forest trails", afternoon: "Annandale Ground + Shimla State Museum", evening: "Gaiety Theatre visit + Indian Coffee House on Mall Road" },
    { morning: "Kufri day trip (16 km) — Himalayan Wildlife Zoo + horse riding", afternoon: "Chail (45 km) — world's highest cricket pitch + Chail Palace", evening: "Prospect Hill sunset viewpoint + Tara Devi Temple" },
    { morning: "Kalka–Shimla UNESCO Toy Train (return journey or one-way scenic)", afternoon: "Gorton Castle (British-era Gothic building) + Rothney Castle", evening: "Café Sol + Ashiana restaurant — Shimla's rooftop dining" },
    { morning: "Narkanda (65 km) — apple orchards + Hatu Peak (11,152 ft)", afternoon: "Rampur Bushahr — Padam Palace, Lavi Fair grounds (Oct)", evening: "Mashobra village — apple picking + local cottage wine" },
    { morning: "Chadwick Falls (7 km) — 86 m waterfall in dense forest", afternoon: "Glen forest trail + Bantony Castle ruins", evening: "Naldehra Golf Course (Asia's oldest golf course 1905) sunset walk" },
  ],

  Rishikesh: [
    { morning: "Triveni Ghat Ganga Aarti at sunrise (6 AM) — intimate and spiritual", afternoon: "Laxman Jhula suspension bridge + Ram Jhula walking tour", evening: "Parmarth Niketan Ganga Aarti — largest aarti in Rishikesh" },
    { morning: "White-water rafting on River Ganges (Grade III–IV, 16–36 km routes)", afternoon: "Neer Garh Waterfall trek (3 km) — cool plunge pools", evening: "Beatles Ashram (Chaurasi Kutia) — atmospheric ruins, street art" },
    { morning: "Sunrise yoga & meditation at Sivananda Ashram or Yoga Niketan", afternoon: "Rajaji National Park jeep safari (elephants, tigers, leopards)", evening: "Chotiwala Restaurant + German Bakery cafes near Laxman Jhula" },
    { morning: "Kunjapuri Devi Temple sunrise trek (8 km) — 360° Himalayan panorama", afternoon: "Neelkanth Mahadev Temple trek (22 km from Rishikesh)", evening: "River-side bonfire camps + fly-high bungee jumping (83 m)" },
    { morning: "Garud Chatti Waterfall trek + Phool Chatti Ashram meditation", afternoon: "Vashisht Cave meditation + Swarg Ashram stroll", evening: "Tera Manzil (Trayambakeshwar) 13-storey temple complex" },
    { morning: "Kayaking + cliff jumping at Marine Drive beach", afternoon: "Camping at Shivpuri (white water village) picnic", evening: "Organic cafes — Pyramid Café, Little Buddha Café on Laxman Jhula side" },
  ],

  /* ── WEST INDIA ─────────────────────────────────────────────────── */
  Mumbai: [
    { morning: "Gateway of India (6 AM) + ferry to Elephanta Caves (UNESCO)", afternoon: "Elephanta Caves — Shiva Trimurti, rock-cut temples", evening: "Colaba Causeway shopping + Leopold Café + Taj Mahal Palace view" },
    { morning: "Marine Drive sunrise walk — Queen's Necklace", afternoon: "Chhatrapati Shivaji Maharaj Terminus (CST) UNESCO building + Fort area", evening: "Chowpatty Beach — bhel puri, pani puri + evening sea breeze" },
    { morning: "Dharavi walking tour (Asia's largest informal settlement — eye-opener)", afternoon: "Juhu Beach + ISKCON Juhu temple", evening: "Bandra — Bandstand Promenade, Mannat (SRK's house) + Linking Road" },
    { morning: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya (Prince of Wales Museum)", afternoon: "Rajabai Clock Tower + Mumbai University + High Court", evening: "Kala Ghoda Art District + Britannia restaurant for berry pulao" },
    { morning: "Sanjay Gandhi National Park — lion/tiger safari + Kanheri Caves", afternoon: "Powai Lake + Hiranandani Gardens", evening: "Worli Sea Face sunset + Sea Link bridge (drive across)" },
    { morning: "Crawford Market (Mahatma Jyotiba Phule Market) + Chor Bazaar", afternoon: "Mani Bhavan Gandhi Museum + Siddhivinayak Temple", evening: "Mohammed Ali Road — Mumbai's Ramzan food street (evenings)" },
    { morning: "Versova village + ferry to Madh Island beaches", afternoon: "Film City Goregaon guided tour", evening: "Pali Village Café + social — Bandra hipster dining scene" },
  ],

  Goa: [
    { morning: "Basilica of Bom Jesus UNESCO (Old Goa) — St Francis Xavier relics", afternoon: "Se Cathedral + Church of St Cajetan + Goa Museum", evening: "Panjim Latin Quarter (Fontainhas) walk + Goan fish curry dinner" },
    { morning: "Fort Aguada (16th c. Portuguese fort) + Sinquerim Beach", afternoon: "Baga Beach + Calangute Beach leisure + water sports", evening: "Tito's Lane Baga — Goa nightlife, beach shacks, live music" },
    { morning: "Chapora Fort sunrise (Dil Chahta Hai fame) + Vagator Beach", afternoon: "Anjuna Flea Market (every Wednesday) + Anjuna Beach", evening: "Curlies Beach Shack, Anjuna — sunset cocktails + trance music" },
    { morning: "Dudhsagar Waterfalls (4-tier, 310 m) — jeep safari through forest", afternoon: "Spice Plantation tour + traditional Goan lunch included", evening: "Mollem Wildlife Sanctuary evening + Tambdi Surla Temple (12th c.)" },
    { morning: "South Goa — Colva Beach + Benaulim Beach (peaceful, uncrowded)", afternoon: "Palolem Beach — crescent-shaped paradise + kayaking", evening: "Agonda Beach sunset — sea turtles nest here + bonfire on the beach" },
    { morning: "Reis Magos Fort + Reis Magos Church", afternoon: "Mario Gallery (Mario Miranda art) + Institute Menezes Braganza", evening: "Casino cruise on Mandovi River — dinner + live show" },
    { morning: "Cabo de Rama Fort ruins — dramatic clifftop views of Arabian Sea", afternoon: "Butterfly Beach + Honeymoon Beach by boat from Palolem", evening: "Panjim — Joseph Bar (oldest toddy shop, 1936) + Vinayak restaurant" },
  ],

  Udaipur: [
    { morning: "City Palace Museum — 11 palaces, artefacts, royal quarters", afternoon: "Boat ride on Lake Pichola — Jag Mandir island visit", evening: "Ambrai Ghat / Amet ki Haveli rooftop — sunset over lake" },
    { morning: "Jagdish Temple (1651) — largest temple in Udaipur", afternoon: "Saheliyon ki Bari (Garden of Maids) + Fateh Sagar Lake boat ride", evening: "Bagore ki Haveli museum + evening folk dance show" },
    { morning: "Monsoon Palace (Sajjangarh) — hilltop, panoramic views", afternoon: "Pratap Gaurav Kendra + Maharana Pratap memorial", evening: "Shilpgram rural arts and crafts village — live tribal art demos" },
    { morning: "Kumbhalgarh Fort day trip (84 km) — world's 2nd longest wall", afternoon: "Ranakpur Jain Temples (25 km from Kumbhalgarh) — 1444 marble pillars", evening: "Return to Udaipur — rooftop dinner at Upre by 1559 AD" },
    { morning: "Eklingji and Nagda Temples (22 km) — 10th century complex", afternoon: "Haldighati — battle of 1576 site + museum", evening: "Pichola Lake north shore walk + Gulab Bagh botanical garden" },
    { morning: "Jaisamand Lake (48 km) — Asia's second largest artificial lake", afternoon: "Mansi Wakal river valley picnic + tribal village visit", evening: "Mewar Sound & Light Show at City Palace (seasonal)" },
  ],

  Jodhpur: [
    { morning: "Mehrangarh Fort — sunrise views + Daulat Khana museum exhibits", afternoon: "Jaswant Thada cenotaph (white marble, intricate screens)", evening: "Clock Tower Sardar Market — blue pottery, tie-dye, spices + lassi" },
    { morning: "Umaid Bhawan Palace — one-third is a museum (royal collection)", afternoon: "Mandore Gardens + cenotaphs of Marwar rulers", evening: "Rooftop restaurant on blue city — Indique or On The Rocks for views" },
    { morning: "Osian (65 km) — Jain and Brahmanical temples (8th–11th c.) + sand dunes", afternoon: "Camel safari on Thar Desert fringes", evening: "Bishnoi village safari — wildlife, traditional homestay dinner" },
    { morning: "Chamunda Mata Temple inside Mehrangarh (sunrise aarti)", afternoon: "Toorji Ka Jhalra (step well) + Rai Ka Bagh Palace ruins", evening: "Nai Sarak bazaar — Marwari sweets, mawa kachori, mirchi bada" },
    { morning: "Balsamand Lake Garden — 12th century artificial lake + palace", afternoon: "Kaylana Lake boating + bird watching (flamingos, pelicans)", evening: "Mehrangarh Fort light and sound show — History of Marwar" },
  ],

  Ahmedabad: [
    { morning: "Sabarmati Ashram — Gandhi's spinning wheel, Dandi March start point", afternoon: "Sarkhej Roza — Mughal-era mosque complex + lake", evening: "Law Garden Night Market — mirror-work chaniya cholis, handicrafts" },
    { morning: "Heritage walk — Pol Houses (medieval gated communities)", afternoon: "Adalaj Vav (step well) — 5-storey, 1499 CE, exceptional geometry", evening: "Bhadra Fort + Sidi Saiyyed Mosque (Tree of Life jali window)" },
    { morning: "Calico Museum of Textiles — world's best Indian textile collection", afternoon: "Shreyas Folk Museum + Vechaar Utensils Museum", evening: "Manek Chowk — street food: khaman, fafda, undhiyu, jalebis at night" },
    { morning: "Akshardham Temple Gandhinagar (17 km) — grand Swaminarayan complex", afternoon: "Science City Ahmedabad — IMAX, robotics, energy park", evening: "Thaltej Trampoline Park + CG Road dining strip" },
    { morning: "Modhera Sun Temple (100 km) — 11th century, UNESCO tentative list", afternoon: "Patan — Rani ki Vav UNESCO step well + Patola silk weavers", evening: "Return to Ahmedabad — Vishalla restaurant — village-themed dinner" },
  ],

  "Rann of Kutch": [
    { morning: "White Rann sunrise walk — salt desert stretches to horizon", afternoon: "Dhordo village — traditional bhungas (round mud huts) + weavers", evening: "Rann Utsav festival grounds — folk dances, camel rides, cultural show" },
    { morning: "Kala Dungar (Black Hills) — highest point in Kutch (462 m) + panorama", afternoon: "India Bridge — closest point to Pakistan border + Foxes' den (unique phenomenon)", evening: "Sunset at White Rann with full moon (book moon-night tour in advance)" },
    { morning: "Bhuj — Aina Mahal Palace (1750) — Hall of Mirrors + royal collection", afternoon: "Prag Mahal Palace (1865) — Italian Gothic, climb tower for views", evening: "Bhuj Hamirsar Lake walk + Smriti Van earthquake memorial museum" },
    { morning: "Mandvi Beach + shipbuilding yards — wooden dhow construction", afternoon: "Vijay Vilas Palace (1929) — summer palace of Maharaos + private beach", evening: "Wind farm sunset drive — 100+ turbines at golden hour" },
    { morning: "Kutch Museum (oldest in Gujarat) + Swaminarayan Temple, Bhuj", afternoon: "Hodka village — leatherwork artisans + Lakhpat Fort ruins", evening: "Rann village cultural program + traditional Gujarati dinner" },
  ],

  "Mount Abu": [
    { morning: "Dilwara Jain Temples (1031–1231 CE) — among finest marble architecture in world", afternoon: "Guru Shikhar peak (1722 m) — highest point of Aravalli Range", evening: "Nakki Lake boating + Toad Rock viewpoint at sunset" },
    { morning: "Mount Abu Wildlife Sanctuary jeep safari — leopards, sloth bears", afternoon: "Achalgarh Fort + Achaleshwar Mahadev Temple (11th c.)", evening: "Sunset Point — most popular hilltop viewpoint, colourful crowds" },
    { morning: "Adhar Devi Temple — 365 steps carved in rock face", afternoon: "Trevor's Tank — crocodile habitat + migratory birds", evening: "Nakki Lake Market — woollens, local honey, marble souvenirs" },
    { morning: "Brahma Kumaris Spiritual University campus (world HQ) — open to all", afternoon: "Om Shanti Bhavan museum + Peace Park", evening: "Delwara village walk + local Rajasthani dinner in cottage resort" },
  ],

  Pune: [
    { morning: "Shaniwarwada Fort — 18th c. Peshwa fortress + light & sound show (evening)", afternoon: "Lal Mahal — Chhatrapati Shivaji's childhood home", evening: "FC Road + JM Road — Pune's student street food + Filter Coffee" },
    { morning: "Sinhagad Fort trek (22 km from city) — 1670 battle site, sunrise hike", afternoon: "Khadakwasla Dam + Panshet and Varasgaon dam drives", evening: "Koregaon Park — Osho Ashram area + German Bakery evening" },
    { morning: "Aga Khan Palace — Mahatma Gandhi memorial + Kasturba memorial", afternoon: "Raja Kelkar Museum — Bajirao II's 17,000 artefacts collection", evening: "Deccan Gymkhana area + Vaishali restaurant — South Indian breakfast tradition" },
    { morning: "Parvati Hill Temple trek — panoramic city views", afternoon: "Tribal Cultural Museum + Sangam Bridge Bhide Wada", evening: "MG Road + Camp area — Dorabjee's + boat club road restaurants" },
    { morning: "Lonavala day trip (65 km) — Bhushi Dam, Rajmachi, Khandala", afternoon: "Tiger's Leap viewpoint + Karla and Bhaja Caves (2nd c. BCE Buddhist)", evening: "Chikki stop at Lonavala Chikki shops + maggi at roadside stalls" },
    { morning: "Hadshi Temple (50 km) + Jyotiba Temple Kolhapur (120 km)", afternoon: "Raigad Fort — Shivaji's coronation site (2 hr drive)", evening: "Baner Road pub street — Pune's contemporary nightlife" },
  ],

  "Lakshadweep Islands": [
    { morning: "Agatti Island arrival — lagoon snorkelling at house reef + transparent kayak", afternoon: "Bangaram Island day trip by boat — uninhabited paradise, powdery sand", evening: "Agatti beach sunset — bioluminescent plankton night swim (seasonal)" },
    { morning: "Scuba diving at Agatti or Kadmat reef — manta rays, reef sharks, turtles", afternoon: "Glass-bottom boat at Kavaratti Island — coral garden viewing", evening: "Kavaratti lagoon walk — government guesthouse fish curry dinner" },
    { morning: "Minicoy Island (southernmost, unique Maldivian culture) — tuna fishing with locals", afternoon: "Minicoy Lighthouse (1885, British) + traditional laccadivian dance performance", evening: "Sunrise atoll walkthrough — deserted sandbanks appear at low tide" },
    { morning: "Kalpeni Island — three uninhabited islets by lagoon, best snorkelling in Lakshadweep", afternoon: "Pitti Island bird sanctuary (masked boobies, frigatebirds) — passing cruise", evening: "Stargazing from uninhabited islet — zero light pollution, Milky Way overhead" },
    { morning: "Androth Island — largest island, Al-Salam Mosque (oldest mosque in Lakshadweep)", afternoon: "Traditional coir rope weaving and boat building village tour", evening: "Final lagoon sail at golden hour — dolphins seen regularly around Agatti" },
  ],

  "Daman and Diu": [
    { morning: "Diu Fort (Portuguese, 1535) — lighthouse within fort + sea-facing ramparts at sunrise", afternoon: "St Paul's Church (1610, Baroque) — one of India's finest Portuguese churches", evening: "Nagoa Beach sunset — palm-lined, calm waters, traditional rongali boats" },
    { morning: "INS Khukri Memorial — WWII Indo-Pak war 1971 submarine memorial + museum", afternoon: "Gangeshwar Temple (sea caves) — five Shivalingas washed by the Arabian Sea waves", evening: "Diu town promenade — fresh catch seafood dinner + Portuguese wine at local café" },
    { morning: "Daman — Moti Daman Fort + Bom Jesus Cathedral (1603) + Governor's Palace", afternoon: "Nani Daman Fort + Damanganga River walk + Light House beach", evening: "Daman seafront — Devka Beach sunset + evening stroll on Jampore Beach" },
    { morning: "Gomtimata Beach (Diu) — seashell beach, pristine and uncrowded", afternoon: "Naida Caves (ruins of Portuguese cisterns — eerie, atmospheric, Instagram-famous)", evening: "Zampa Gateway (Diu) heritage walk + Fudam village whitewashed chapel" },
    { morning: "Jalandhar Beach — rock-cut Jalandhar Shrine + cliff walk to lighthouse", afternoon: "Diu Museum (Portuguese artefacts) + Shell Museum (Diu's unique private museum)", evening: "Ghoghla Beach (11 km, Gujarat side) — pristine, barely-visited farewell sunset" },
  ],

  /* ── EAST INDIA ───────────────────────────────────────────── */
  Kolkata: [
    { morning: "Victoria Memorial sunrise — British-era white marble marvel + garden", afternoon: "Indian Museum (oldest in Asia, 1814) + National Library", evening: "Park Street food walk — Peter Cat, Mocambo, Flurys for food history" },
    { morning: "Howrah Bridge (Rabindra Setu) predawn + Mullick Ghat flower market (4–8 AM)", afternoon: "Dakshineswar Kali Temple + Belur Math (Swami Vivekananda's ashram)", evening: "Princep Ghat sunset + Millennium Park promenade + phuchka on the ghats" },
    { morning: "Kumartuli potters' quarter — clay idol making (best pre-Durga Puja)", afternoon: "College Street book market + Coffee House — intellectual Kolkata", evening: "Bengali thali dinner — Bhojohori Manna + Kasba area adda culture" },
    { morning: "Marble Palace Mansion (1835) — private art collection, peacocks", afternoon: "Eden Gardens cricket ground visit + Birla Planetarium", evening: "Esplanade area + New Market evening + old-school Chinatown Tangra" },
    { morning: "Kalighat Kali Temple + Kali Ghat village (origin of 'Kolkata')", afternoon: "Rabindra Sarobar lake + Tagore's Jorasanko Thakur Bari", evening: "South City food court + tram ride (world's oldest electric tram system)" },
    { morning: "Science City Kolkata + Nicco Park (leisure day)", afternoon: "Sundarbans Express or hovercraft to Sajnekhali for day trip", evening: "Nandan cultural complex + Rabindra Sadan — evening concert" },
  ],

  Darjeeling: [
    { morning: "Tiger Hill (4 AM jeep) — sunrise over Kanchenjunga (8,586 m) — world-class view", afternoon: "Happy Valley Tea Estate tour + tea tasting session", evening: "Chowrasta Mall Road stroll + momos + thukpa dinner" },
    { morning: "Darjeeling Himalayan Railway toy train ride (Ghum–Darjeeling) — UNESCO heritage", afternoon: "Batasia Loop + War Memorial + panoramic views", evening: "Ghoom Monastery (oldest gompa, 1850) + Yiga Choeling Museum" },
    { morning: "Padmaja Naidu Himalayan Zoological Park — snow leopards, red pandas", afternoon: "Himalayan Mountaineering Institute — Tenzing Norgay memorial + museum", evening: "Peace Pagoda (Shanti Stupa) + Mahakal Temple at Observatory Hill" },
    { morning: "Sandakphu trek start (highest peak in WB, Himalayas visible)", afternoon: "Tumling village — views of Everest, Lhotse, Makalu on clear days", evening: "Campfire at Sandakphu ridge — milky way visible" },
    { morning: "Mirik Lake (49 km) — boating + orange orchards + Nepal border village", afternoon: "Kurseong (30 km) — Eagle's Craig viewpoint + Makaibari Tea Estate", evening: "Darjeeling Market — Tibetan boots, woollens, tea souvenirs" },
  ],

  Assam: [
    { morning: "Kamakhya Temple (Guwahati) — one of 51 Shakti Peethas, hilltop views of Brahmaputra", afternoon: "Umananda Island Temple — world's smallest inhabited river island in Brahmaputra", evening: "Fancy Bazaar evening walk + Assamese thali at Paradise Restaurant" },
    { morning: "Kaziranga National Park Eastern Range jeep safari (6–8 AM) — one-horned rhinos guaranteed", afternoon: "Central Range elephant safari — grasslands, buffalo herds, elephants at water", evening: "Kohora Village — Bihu dance cultural show + local rice beer experience" },
    { morning: "Majuli Island (world's largest river island) — ferry from Jorhat", afternoon: "Sattra monasteries (Kamalabari, Auniati) — Vaishnava culture, mask making", evening: "Mishing tribal village stay — bamboo stilt houses, local cuisine" },
    { morning: "Sivasagar — Sivasagar Tank + Shivadol (India's tallest Shiva temple)", afternoon: "Rang Ghar (Ahom amphitheatre, 18th c.) + Talatal Ghar underground palace", evening: "Charaideo Maidam — Ahom pyramid mounds, UNESCO tentative list" },
    { morning: "Manas National Park (UNESCO) — early morning tiger/elephant safari", afternoon: "Beki River Bankside — fishing with Bodo tribal community", evening: "Mathanguri Forest Rest House — sunset over Bhutan foothills" },
    { morning: "Sualkuchi silk village — Assam silk (muga, eri, pat) weaving at looms", afternoon: "Hajo — Hayagriva Madhava temple (Buddhist + Hindu) + Poa Mecca mosque", evening: "Brahmaputra River cruise (sunset) from Guwahati riverfront" },
    { morning: "Pobitora Wildlife Sanctuary (54 km from Guwahati) — highest rhino density on earth", afternoon: "Nameri Eco Camp — river rafting on Jia Bhoroli + birding", evening: "Tezpur — Agnigarh Hill + Cole Park garden sunset" },
  ],

  Meghalaya: [
    { morning: "Shillong — Ward's Lake boating at sunrise + Lady Hydari Park", afternoon: "Elephant Falls (3-tiered, 70 ft) + Shillong Peak (6,449 ft) viewpoint", evening: "Police Bazar food street — Jadoh, pukhlein, Momo's Den night market" },
    { morning: "Cherrapunji (Sohra, 54 km) — Double Decker Living Root Bridge trek (3 hrs round trip)", afternoon: "Nohkalikai Falls (340 m, India's tallest plunge waterfall) + Rainbow Falls trail", evening: "Mawsmai Cave walk + night stay in Cherrapunji eco-resort" },
    { morning: "Mawlynnong Village (90 km from Shillong) — Asia's Cleanest Village + single-decker root bridge", afternoon: "Dawki crystal-clear Umngot River boat ride (glass-floor visibility) + Bangladesh viewpoint", evening: "Dawki riverside camp — bioluminescent water at night, absolute silence" },
    { morning: "Don Bosco Museum, Shillong (7 floors, all 8 Northeast states' tribal culture)", afternoon: "Laitlum Canyons (21 km) — deep Meghalayan gorge, rolling green hills", evening: "Shillong rock music venues — India's rock capital; live bands at Café Shillong" },
    { morning: "Umiam Lake (Barapani, 17 km) — boating, kayaking on reservoir", afternoon: "Jakrem Hot Springs + Nongpoh village tribal market", evening: "Bara Bazaar — Khasi tribal women traders + fresh produce + bamboo crafts" },
    { morning: "Nongriat village 3-layered root bridge trek (full day, serious hikers)", afternoon: "Krang Suri Falls (Jaintia Hills, 115 km) — turquoise pool, jungle setting", evening: "Jowai town — Syndai & Thadlaskein Lake + Jaintia cuisine" },
    { morning: "Balpakram National Park (Garo Hills) — clouded leopard, elephants", afternoon: "Nokrek Biosphere Reserve trek — red pandas, rare citrus grove", evening: "Tura (Garo Hills capital) — Wangala drum festival culture (Oct–Nov)" },
  ],

  Kaziranga: [
    { morning: "Elephant safari (6–8 AM) Central Range — one-horned rhinos at closest range", afternoon: "Western Range jeep safari — open grasslands, buffaloes, rhinos, elephants", evening: "Kohora Market walk + traditional Assamese thali dinner" },
    { morning: "Eastern Range jeep safari (Agaratoli) — tigers sighted here most often", afternoon: "Kaziranga National Orchid Park — 500+ orchid species", evening: "Orchid camp cultural show + bamboo music + bihu dance" },
    { morning: "Central Range jeep safari at dawn — birding: pelicans, storks, hornbills", afternoon: "Kaziranga Craft Centre — cane & bamboo, silk work", evening: "Tea estate visit — Hatikhuli or Diphlu Tea Estate tour + tasting" },
    { morning: "Burachapori Wildlife Sanctuary (25 km) — river terns, rare turtle species", afternoon: "Gibbon Wildlife Sanctuary (33 km) — hoolock gibbons + birds", evening: "Diphlu River Lodge bonfire + naturalist lecture on rhino conservation" },
  ],

  Gangtok: [
    { morning: "Tsomgo (Changu) Lake day trip (35 km, 3720 m) — stunning glacial lake", afternoon: "Baba Mandir (13,200 ft) — Indian Army memorial + yak rides", evening: "Gangtok MG Marg pedestrian street — momos, thukpa, sel roti" },
    { morning: "Rumtek Monastery (24 km) — largest in Sikkim, replica of Tsurphu Tibet", afternoon: "Ranka Monastery + Martam village walk", evening: "Lal Bazaar Night Market — local vegetables, sikkim wines, noodles" },
    { morning: "Enchey Monastery (3 km, 1909) + Namgyal Institute of Tibetology", afternoon: "White Memorial Hall + Flower Exhibition Centre + Orchid Sanctuary", evening: "Banjhakri Falls & Energy Park — lush, illuminated at night" },
    { morning: "North Sikkim tour: Lachen, Gurudongmar Lake (5183 m) — permit needed", afternoon: "Lachung village — Yumthang Valley (Valley of Flowers, Apr–May)", evening: "Return via Mangan — Teesta River valley night views" },
    { morning: "Pelling day trip (112 km) — Rabdentse ruins + Pemayangtse Monastery", afternoon: "Khangchendzonga Falls + Rimbi Rock Garden", evening: "Return Gangtok — Nepali dinner + Tongba (millet beer) tasting" },
  ],

  Sundarbans: [
    { morning: "Sajnekhali Tiger Reserve boat entry — mangrove creek cruise", afternoon: "Sajnekhali Watch Tower — crocodiles, spotted deer, monitor lizards", evening: "Eco camp — sunset over delta, fireflies in mangroves, absolute silence" },
    { morning: "Sudhanyakhali Watch Tower early (tiger sighting probability highest at dawn)", afternoon: "Do-Beki boat trail + Pirkhali creek — rare Gangetic dolphins", evening: "Pakhiralay Bird Sanctuary — migratory birds Nov–Feb" },
    { morning: "Netidhopani — 400-year-old Shiva temple ruins in the jungle", afternoon: "Dobanki watch tower walk via canopy walkway (220 m)", evening: "Return boat through sunset-lit mangrove estuaries" },
  ],

  Konark: [
    { morning: "Sun Temple UNESCO (5 AM opening) — 13th c. stone chariot of Surya Dev", afternoon: "Archaeological Museum Konark — sculptures from the temple complex", evening: "Konark Dance Festival (Dec) — classical dance against the temple backdrop" },
    { morning: "Chandrabhaga Beach (3 km) — pilgrimage beach, cleaner than Puri", afternoon: "Kuruma village — traditional Odisha painting artisans at work", evening: "Pipili village (45 km) — famous appliqué craft, colourful canopies + lamps" },
    { morning: "Astaranga Beach (55 km) — fishing hamlet, little tourism, pristine", afternoon: "Ramachandi Temple at river mouth — Goddess Ramachandi + estuary", evening: "Puri Beach (35 km) — sunset dinner at seafood shacks" },
  ],

  Shillong: [
    { morning: "Ward's Lake boating + Lady Hydari Park", afternoon: "Elephant Falls (3-tiered) + Shillong Peak (6449 ft) viewpoint", evening: "Police Bazar food street — Jadoh (rice-meat), pukhlein, Khasi cuisine" },
    { morning: "Cherrapunji / Sohra (54 km) — Double Decker Living Root Bridge trek (3 hrs)", afternoon: "Nohkalikai Falls (340 m, tallest plunge waterfall in India) + Rainbow Falls", evening: "Mawsmai Cave (Cherrapunji) — limestone cave walk" },
    { morning: "Mawlynnong Village (90 km) — Asia's cleanest village + tree root bridge", afternoon: "Bangladesh border viewpoint from Dawki + crystal-clear Umngot River boat", evening: "Dawki hanging bridge + Night stay at Mawlynnong for stargazing" },
    { morning: "Don Bosco Museum — 7-floor Northeastern tribal cultures + sky bridge", afternoon: "Laitlum Canyons (21 km) — deep Meghalayan gorge + rolling green hills", evening: "Café Shillong + local live music venues — Shillong is India's rock capital" },
    { morning: "Umiam Lake (Barapani) boating + cycling on the dam road", afternoon: "Ri Kynmaw natural reserve walk + Nongkrem Dance Festival (Nov)", evening: "Bara Bazaar — Khasi tribal women traders + fresh produce + bamboo crafts" },
  ],

  "Andaman & Nicobar Islands": [
    { morning: "Cellular Jail (Port Blair) — 10 AM/2 PM English tour — colonial horror history", afternoon: "Ross Island — British-era ruins reclaimed by jungle + deer", evening: "Cellular Jail Light & Sound Show (6:30 PM) — moving historical narrative" },
    { morning: "Radhanagar Beach (Havelock/Swaraj Dweep) — Asia's best beach (2004), Forbes", afternoon: "Kalapathar Beach walk + Vijaynagar Beach — serene, unpopulated stretch", evening: "Havelock village market + seafood dinner by beach" },
    { morning: "Elephanta Beach snorkelling — vibrant coral reefs, sea turtles (glass boat option)", afternoon: "Neil Island (Shaheed Dweep) ferry — Natural Bridge, Bharatpur Beach", evening: "Neil Island sunset from Laxmanpur Beach" },
    { morning: "Baratang Island (100 km by road + boat) — limestone caves + mud volcano", afternoon: "Parrot Island at sunset — thousands of parrots return to roost", evening: "Port Blair — Aberdeen Bazaar night market + fresh grilled fish" },
    { morning: "North Bay Coral Island boat trip — scuba diving / sea walk / glass boat", afternoon: "Chidiya Tapu (Bird Island) — bird watching + forest trail + sunset point", evening: "Samudrika Naval Marine Museum + Aquarium — marine biodiversity" },
    { morning: "Little Andaman Island (optional) — surfing at Butler Bay Beach", afternoon: "White Surf Waterfall + Netaji Nagar Beach", evening: "Farewell bonfire at beach camp — bioluminescent plankton night swim" },
  ],

  /* ── SOUTH INDIA ─────────────────────────────────────────── */
  Kerala: [
    { morning: "Fort Kochi — Chinese fishing nets at sunrise + Mattancherry Palace (Dutch)", afternoon: "Jew Town antiques + Paradesi Synagogue (1568) + Spice Market", evening: "Kerala Kathakali performance + Kerala Folklore Theatre (8 PM)" },
    { morning: "Munnar tea gardens (130 km) — sunrise over tea-carpeted hills", afternoon: "Eravikulam National Park — Nilgiri Tahr (endangered mountain goat)", evening: "Mattupetty Dam sunset + Echo Point + Munnar tea estate bungalow" },
    { morning: "Alleppey (Alappuzha) backwaters houseboat departure (8 AM)", afternoon: "Drifting through Vembanad Lake + paddy fields + village life on water", evening: "Houseboat sunset + overnight stay — fish curry dinner on the boat" },
    { morning: "Disembark houseboat + Marari Beach (clean, quiet, ayurveda resorts)", afternoon: "Periyar Tiger Reserve (Thekkady) — 3 hr boat cruise on Periyar Lake", evening: "Kumily spice market + Kathakali makeup demonstration" },
    { morning: "Kovalam Beach — Lighthouse Beach, Hawah Beach (crescent-shaped)", afternoon: "Padmanabhapuram Palace (22 km, Tamil Nadu) — Kerala's wooden palace", evening: "Trivandrum — Padmanabhaswamy Temple evening aarti + Chalai Bazaar" },
    { morning: "Wayanad day trip — Edakkal Caves (3000 BCE petroglyphs) + Soochipara Falls", afternoon: "Pookode Lake boat ride + Chembra Peak trek (Wayanad)", evening: "Calicut (Kozhikode) — Kozhikode Beach + Malabar Biryani dinner" },
  ],

  Chennai: [
    { morning: "Marina Beach sunrise — world's 2nd longest urban beach (13 km)", afternoon: "Kapaleeshwarar Temple (7th c.) + Mylapore heritage walk + sabha season", evening: "T. Nagar shopping — Pondy Bazaar, Ranganathan Street silk sarees + filter coffee" },
    { morning: "Fort St. George (1644) — India's first British fort + Fort Museum", afternoon: "Government Museum Complex — bronze gallery + Amaravati sculptures", evening: "Egmore area — Spencer's Plaza + Amethyst Café in heritage house" },
    { morning: "Mahabalipuram (Mamallapuram) UNESCO day trip (60 km)", afternoon: "Shore Temple + Five Rathas + Arjuna's Penance (world's largest bas-relief)", evening: "DakshinaChitra Living Heritage Museum (30 km south) + Muthu's Biryani" },
    { morning: "Santhome Cathedral Basilica + Luz Church + San Thome beach", afternoon: "Birla Planetarium + Valluvar Kottam (Thiruvalluvar monument)", evening: "Besant Nagar (Elliot's) Beach + Murugan Idli shop + Cream Centre" },
    { morning: "Guindy National Park (within city!) + Raj Bhavan grounds", afternoon: "Little Mount + St Thomas Mount — where Apostle Thomas preached", evening: "Anna Salai street walk + Saravana Bhavan original branch dinner" },
  ],

  Bengaluru: [
    { morning: "Cubbon Park morning walk (300 acres) + Vidhana Soudha (state legislature)", afternoon: "Bangalore Palace (1887) Windsor-style + Tipu Sultan's Summer Palace (Daria Daulat)", evening: "Brigade Road + Commercial Street night market + Toit Brewpub craft beer" },
    { morning: "ISKCON Temple Rajajinagar — grand South Indian–ISKCON architecture", afternoon: "Lalbagh Botanical Garden (1760) — 240 acres + famous glass house", evening: "Indiranagar 100 Feet Road — pub culture + microbreweries (Arbor, Byg Brewski)" },
    { morning: "Nandi Hills (60 km) — Tipu Sultan's summer fort + sunrise viewpoint", afternoon: "Grover Zampa Winery tour (55 km from city) + Skandagiri hills", evening: "Koramangala food street + Church Street Social + Smally's bistro" },
    { morning: "HAL Aerospace Museum — India's aviation heritage, fighter jets", afternoon: "National Gallery of Modern Art (NGMA) + Jawaharlal Nehru Planetarium", evening: "Ulsoor Lake boating + MG Road walk — Forum Mall, Garuda Mall area" },
    { morning: "Bannerghatta National Park (22 km) — lion/tiger/bear safari", afternoon: "Butterfly Park (world's largest indoor park) inside Bannerghatta", evening: "Jayanagar 4th Block South Indian food trail — masala dosa at Hotel Janatha" },
  ],

  Hyderabad: [
    { morning: "Charminar (1591) — climb to top for views + Laad Bazaar pearl shopping", afternoon: "Mecca Masjid — one of India's largest mosques (1694) + Chowmahalla Palace", evening: "Pista House Haleem dinner + Nimrah Café irani chai + Osmania biscuits" },
    { morning: "Golconda Fort early (sunrise over ramparts, natural acoustics clapping test)", afternoon: "Qutb Shahi Tombs — Persian blue-dome necropolis", evening: "Golconda Fort Sound & Light Show (6:30 PM) — Ramoji production" },
    { morning: "Salar Jung Museum — world's largest one-person art collection", afternoon: "Chowmahalla Palace — Nizam's official residence + royal carriages", evening: "Hussain Sagar Lake — Buddha Statue boat ride + Lumbini Park laser show" },
    { morning: "Ramoji Film City (1666 acres — world's largest film city, Guinness)", afternoon: "Film sets tour + stunt show + backlot experience", evening: "Banjara Hills Café strip + Ohri's restaurant + Paradise Biryani original" },
    { morning: "Birla Mandir hilltop (white marble) + Birla Planetarium", afternoon: "Nehru Zoological Park — tiger safari + lion safari", evening: "Secunderabad old quarter — clock tower + Christian colony heritage walk" },
    { morning: "Paigah Tombs (Mozamjahi Market area) — Nizam's nobles cemetery", afternoon: "HEH the Nizam's Museum inside Purani Haveli + Badshahi Ashurkhana", evening: "Kebabs on the go — Shadab, Al-Akbar — Hyderabadi culinary farewell" },
  ],

  Mysuru: [
    { morning: "Mysore Palace (9 AM) — Amba Vilas palace interior, royal rooms, armour", afternoon: "Chamundi Hills (13 km) — Chamundeshwari Temple + Nandi Bull statue", evening: "Mysore Palace Sunday illumination (7–8 PM, 98,000 bulbs — stunning)" },
    { morning: "Devaraja Market — jasmine flowers, incense, spices, silk", afternoon: "Brindavan Gardens (19 km) — musical fountain show (evenings only)", evening: "KR Circle area — Mysore Pak sweets + silk shopping at KSIC" },
    { morning: "Srirangapatna (16 km) — Tipu Sultan's island fort, Daria Daulat Bagh", afternoon: "Ranganathittu Bird Sanctuary boat ride — open-bill storks, spoonbills, crocodiles", evening: "Karanji Lake Nature Park — butterfly park + lake boating" },
    { morning: "Somnathpur Hoysala Temple (35 km) — 13th c., finest preserved star-shaped temple", afternoon: "Shravanabelagola (80 km) — 57 ft monolithic Gommateshvara Jain statue", evening: "Mysore Dasara Exhibition grounds + Zoo (largest in South India)" },
    { morning: "Nagarhole National Park (80 km) — Kabini River safari, tigers, leopards", afternoon: "Kabini Lake boat cruise — elephants bathing in lake at sunset", evening: "Return Mysuru — Guru Sweet Mart + RRR restaurant traditional Chettinad" },
  ],

  Madurai: [
    { morning: "Meenakshi Amman Temple (5:30 AM) — corridor of 1000 pillars, musical pillars", afternoon: "Thirumalai Nayak Palace (1636) + sound & light show (6:45 PM)", evening: "Meenakshi Temple night ceremony (9:30 PM) — Shiva's procession" },
    { morning: "Gandhi Memorial Museum — India's best Gandhi museum", afternoon: "Vandiyur Mariamman Teppakulam — temple tank, largest in Tamil Nadu", evening: "Tamukkam Palace area + Meenakshi College area + filter coffee" },
    { morning: "Alagar Kovil (21 km) — Vishnu temple in Alagar Hills + forest walk", afternoon: "Pazhamudhircholai (18 km) — Murugan temple in dense forest", evening: "Town Hall area — jigarthanda (unique local drink) + Madurai kari dosai" },
    { morning: "Samanar Hills (18 km) — Jain rock beds and Tamilakam inscriptions", afternoon: "Thiruparankundram (8 km) — Murugan cave temple (Subramaniam)", evening: "Othakadai market — embroidery, Madurai cotton sungudi sarees" },
    { morning: "Rameswaram day trip (170 km) — Ramanathaswamy Temple 22 corridors", afternoon: "Pamban Bridge + Agni Theertham sacred sea bath + Dhanushkodi ruins", evening: "Madurai — Palanisamy mess authentic vegetarian Tamil dinner" },
  ],

  Hampi: [
    { morning: "Virupaksha Temple (7th c., still active) + Hemakuta Hill sunrise over temple", afternoon: "Vittala Temple complex — stone chariot, musical pillars, ornate mandapa", evening: "Matanga Hill sunset — 360° view of entire Hampi basin" },
    { morning: "Royal Enclosure — Lotus Mahal, Elephant Stables (11 domes), Underground Temple", afternoon: "Hazara Rama Temple — 1000 Ramayana panels carved on walls", evening: "Coracle (circular bamboo boat) ride on Tungabhadra River at sunset" },
    { morning: "Anegundi Village (across river) — Kishkinda of Ramayana, Pampa Sarovar", afternoon: "Sanapur Lake / Hippie Island (Virupapur Gaddi) — swimming, kayaking", evening: "Ruin bars at Hampi Bazar + mango-smoothie cafes by the river" },
    { morning: "Daroji Sloth Bear Sanctuary (15 km) — 130+ bears, best at dawn", afternoon: "Tungabhadra Dam (13 km) — largest dam garden + light & sound show", evening: "Hospet town — Mallamma temple + Tungabhadra dam illuminations" },
    { morning: "Kamalapura Museum + Pushkarani stepped tank + Kadlekalu Ganesha", afternoon: "Monkey Temple (Anjaneyaswami Temple) — birthplace of Hanuman, hilltop", evening: "Hampi — final sunset from Achyutaraya Temple gopuram" },
  ],

  Ooty: [
    { morning: "Nilgiri Mountain Railway (Mettupalayam → Ooty) — UNESCO heritage, steam loco", afternoon: "Government Botanical Garden (1848) — 650 plant species, giant fossil tree", evening: "Ooty Lake boating + Ooty town bazaar — homemade chocolate + tea" },
    { morning: "Doddabetta Peak (2636 m) — highest in Nilgiris + telescope house", afternoon: "Emerald Lake (16 km) + Avalanche Lake (25 km) — trout fishing", evening: "Thread Garden (unique embroidered garden) + Rose Garden (world's 2nd largest)" },
    { morning: "Pykara Lake + Pykara Waterfall (21 km) — speedboat + nature walk", afternoon: "Mudumalai National Park (64 km) — elephant safari, gaur, tigers", evening: "Tea factory tour at Chamraj Tea Estate + homemade tea tasting" },
    { morning: "Kalhatty Falls (13 km) + Coonoor day trip — Sim's Park (botanical)", afternoon: "Dolphin's Nose viewpoint (Coonoor) — breathtaking cliff views", evening: "Higginbothams bookshop (oldest in India, 1844) + hot chocolate + cream rolls" },
    { morning: "Kodanad Elephant Training Camp (30 km) — morning elephant bathing", afternoon: "Ooty Heritage Car Museum + Tribal Research Centre", evening: "Collector's Corner restaurant — colonial era bungalow dining" },
  ],

  Coorg: [
    { morning: "Abbey Falls (7 km from Madikeri) — 70 ft falls in coffee estate", afternoon: "Raja's Seat viewpoint — sunset over Kaveri valley + musical fountain (evenings)", evening: "Madikeri Fort + Raja's Tomb (Gaddige) + town bazaar" },
    { morning: "Namdroling Monastery (Bylakuppe, 35 km) — Golden Temple of Tibetan exile settlement", afternoon: "Nisargadhama Island (29 km) — bamboo cottages + hanging bridge + deer park", evening: "Dubare Elephant Camp (34 km) — evening elephant washing ceremony" },
    { morning: "Talacauvery (48 km) — origin of River Cauvery + Brahmagiri Hill trek", afternoon: "Bhagamandala (38 km) — Triveni Sangam + Bhagandeshwara Temple", evening: "Coffee estate homestay evening — bonfire + pandi curry + appam dinner" },
    { morning: "Iruppu Falls (82 km, Brahmagiri Range) — holy waterfall + temple", afternoon: "Nagarhole National Park border (40 km) — jeep safari", evening: "Coorg pepper + cardamom plantation walk with planter family" },
    { morning: "Mandalpatti Peak trekking (jeep + hike) — panoramic coffee estate views", afternoon: "Pushpagiri Wildlife Sanctuary trail", evening: "Kakkabe village — Nalknad Palace ruins + Padi Igguthappa Temple" },
  ],

  Pondicherry: [
    { morning: "French Quarter (White Town) promenade walk + Goubert Avenue (Beach Road)", afternoon: "Sri Aurobindo Ashram — meditation hall + bookstore + samadhi of Aurobindo", evening: "Promenade Beach sunset + Pondicherry Lighthouse + French cafes on MG Road" },
    { morning: "Auroville — Matrimandir (golden dome, meditation centre, book visitor pass)", afternoon: "Auroville visitor centre film + Botanical Garden of Auroville", evening: "Le Club restaurant + Baker Street bakery — French colonial Pondicherry dining" },
    { morning: "Immaculate Conception Cathedral (1791) + Church of Our Lady of Angels", afternoon: "Annamalai University temple + Arulmigu Manakula Vinayagar Temple", evening: "Serenity Beach (8 km north) — sunset + bonfire + seafood night shacks" },
    { morning: "Paradise Beach by boat (ferry from Chunnambar boat house)", afternoon: "Chunnambar backwater kayaking + mangrove trail", evening: "Mission Street food walk — pondicherry masala dosa + crepes" },
    { morning: "Mahe (60 km) — French exclave in Kerala, Mahe River + tranquil village", afternoon: "Karaikal (80 km) — French heritage town + Karaikal Ammaiyar Temple", evening: "Villianur Sri Gokilambal Thirukameswar Temple + Pondicherry Museum" },
  ],

  Tirupati: [
    { morning: "Tirumala Venkateswara Temple — book darshan pass in advance; early slot 3 AM–6 AM least crowded", afternoon: "Varahaswami Temple + Akashaganga Theertham + Papavinasam Waterfall", evening: "Tirumala hilltop — stunning views over Eastern Ghats at sunset" },
    { morning: "Sri Venkateswara National Park wildlife walk (deer, peacocks, reptiles)", afternoon: "Kapila Theertham Temple (at base of hill) + Silathoranam natural arch", evening: "Chandragiri Fort (11 km) — Vijayanagara fort + Raja Mahal museum" },
    { morning: "Talakona Waterfall (50 km) — tallest in AP (270 ft) + forest trail", afternoon: "Sri Venkateswara Zoo + Botanical Gardens", evening: "ISKCON Tirupati + Sri Govindaraja Temple in Tirupati town" },
    { morning: "Srikalahasti (36 km) — Shiva temple, Rahu-Ketu pooja, intricate carvings", afternoon: "Kanipakam Vinayaka Temple (75 km) + Puttur Anjaneya Swami Temple", evening: "Tirupati Laddu prasadam distribution line experience + local meals" },
  ],

  Rameshwaram: [
    { morning: "Ramanathaswamy Temple (4:30 AM aarti) — 22 sacred theerthams (holy wells to bathe)", afternoon: "Agni Theertham (sea bath at temple beach) + 1212 m corridor (world's longest)", evening: "Pamban Bridge walk + evening light on the bridge over the sea" },
    { morning: "Dhanushkodi Ghost Town (18 km) — 1964 cyclone ruins + India's Land's End", afternoon: "Arichal Munai — where Rama's bridge to Lanka began + Adam's Bridge view", evening: "Gandhamadhana Parvatham hilltop temple — Rama's footprints + sea panorama" },
    { morning: "Kalam's birth house (APJ Abdul Kalam's modest childhood home museum)", afternoon: "Kothandaramaswamy Temple (13 km) — survived 1964 storm, on sea shore", evening: "Shri Ramar Padam + Lakshmana Theertham + Panchamukha Hanuman Temple" },
    { morning: "Annai Indira Gandhi Bridge (Pamban) — ferry crossing + sea fishing", afternoon: "Ariyaman Beach (55 km) — clear waters + coral reef boat trip", evening: "Rameshwaram Market — conch shells, coral jewellery, dried fish" },
  ],

  Munnar: [
    { morning: "Top Station (32 km, 1700 m) — Tamil Nadu border, sunrise over tea estates", afternoon: "Eravikulam National Park — Nilgiri Tahr conservation success story", evening: "Munnar town market — homemade chocolate + Munnar Special tea tasting" },
    { morning: "Mattupetty Dam (13 km) + Indo-Swiss Dairy Farm tour", afternoon: "Echo Point (15 km) + Kundala Lake boat ride", evening: "Rajamala — Eravikulam NP base camp + forest sunset walk" },
    { morning: "Attukal Waterfalls (9 km) + Nyayamakad Waterfall", afternoon: "Pallivasal Hydroelectric Station + Chinnakanal Waterfalls", evening: "Lockhart Gap (36 km) — tea estate viewpoint sunset" },
    { morning: "Meesapulimala Trek (2640 m) — 2nd highest peak in Kerala, 6 hr trek", afternoon: "Kolukkumalai Tea Estate (oldest in world, 1905) — jeep ride", evening: "Blossom Hydel Park gardens + Devikulam Lake" },
    { morning: "Anayirankal Dam + Marayoor (15 km) — natural sandalwood forests + dolmens", afternoon: "Thoovanam Waterfalls (Chinnar Wildlife Sanctuary, 60 km) — jeep entry", evening: "Munnar homestay — Kerala Sadhya (banana leaf feast) farewell dinner" },
  ],

  Kanyakumari: [
    { morning: "Sunrise at Triveni Sangam — Bay of Bengal, Indian Ocean, Arabian Sea meet", afternoon: "Vivekananda Rock Memorial — ferry (20 min) + meditation at the memorial", evening: "Thiruvalluvar Statue (133 ft) — Kural-themed monument on rocky island" },
    { morning: "Kanyakumari Temple (morning aarti 4:30 AM) — Goddess Kanyakumari", afternoon: "Padmanabhapuram Palace (55 km) — largest wooden palace in Asia", evening: "Sunset at Sangam (one of very few places in India to see both sunrise & sunset over sea)" },
    { morning: "Suchindram Thanumalayan Temple (13 km) — massive Hanuman statue + musical pillars", afternoon: "Mathur Aqueduct (50 km) — Asia's longest aqueduct over Paraiyar River", evening: "Swami Vivekananda Wandering Memorial + Gandhi Mandapam" },
    { morning: "Thirparappu Falls (56 km) + Pechiparai Dam", afternoon: "Udayagiri Fort (45 km) + Neyyar Dam wildlife sanctuary", evening: "Kanyakumari Beach market — shell crafts, coconut shell items, lighthouse climb" },
  ],

  Kodaikanal: [
    { morning: "Kodaikanal Lake (star-shaped) — cycling around the 5 km perimeter at sunrise", afternoon: "Coaker's Walk — 1 km cliff-edge promenade with valley views on clear days", evening: "Bryant Park botanical garden + market road — homemade chocolates + eucalyptus oil" },
    { morning: "Pillar Rocks (7 km) — three giant granite pillars rising 122 m + valley mist", afternoon: "Green Valley View (Suicide Point) + Silver Cascade Waterfall (8 km)", evening: "Bear Shola Falls + Pambar Falls — forest walks, firefly spotting at dusk" },
    { morning: "Dolphin's Nose viewpoint (8 km) — 6,600 ft ledge, panoramic plains view", afternoon: "Echo Rock + Shembaganur Museum of Natural History", evening: "Kodaikanal Solar Observatory (1899) — public viewing on clear evenings" },
    { morning: "Berijam Lake (21 km) — protected forest permit area, pristine water", afternoon: "Mannavanur Lake (25 km) — horse riding, sheep farms, rolling meadows", evening: "Pine Forest walk — dense shola pines, fog trails, cloud watching" },
    { morning: "Kukkal Caves (25 km) — prehistoric Iron Age cave paintings, tribal heritage", afternoon: "Palani Hills trek — Vandaravu Peak (7,200 ft), endemic flora", evening: "Vattakanal village (4 km) — off-grid stay, bonfires, stargazing at 7,200 ft" },
    { morning: "Fairy Falls + La Saleth Church (1895) — colonial Gothic on a hilltop", afternoon: "Bat Caves hiking trail + Guna Caves (Devils Kitchen) through pine forest", evening: "Kodaikanal Lake boat rowing at sunset + hot chocolate at Pastry Corner" },
  ],

  Visakhapatnam: [
    { morning: "RK Beach sunrise walk + INS Kurusura Submarine Museum", afternoon: "Kailasagiri Hill (300 m) — cable car + giant Shiva-Parvati statue", evening: "Beach Road night walk + Rushikonda Beach bonfires" },
    { morning: "Borra Caves (92 km) — largest cave system in India, billion-year-old stalactites", afternoon: "Araku Valley (115 km) — scenic train ride (Kirandul passenger) through 58 tunnels", evening: "Araku tribal museum + bamboo chicken dinner in tribal hut restaurant" },
    { morning: "Simhachalam Temple (20 km) — Varaha Narasimha Swamy, 11th c. temple", afternoon: "Vizag Steel Plant tour (world's only shore-based steel plant, India's showcase)", evening: "Jagadamba Junction street food — pesarattu, Vizag-style biryani, jillebi" },
    { morning: "Yarada Beach (15 km) — secluded, lighthouse trail + dolphin sighting possible", afternoon: "Tenneti Park cliff walk + Dwaraka bus stand area heritage", evening: "Dolphin's Nose lighthouse (paid) — 174 m rock outcrop + sea panorama" },
    { morning: "Lambasingi (100 km) — AP's only hill station 'Kashmir of AP', misty valleys", afternoon: "Sankaram Buddhist ruins (65 km) — 2nd c. BCE Buddhist monastery remains", evening: "Vizag Vizianagaram district Thotagarh wildlife sanctuary birding" },
  ],
};

function generateItinerary(destination, days, fromCity) {
  const destinationName = normalizeName(destination);
  const fromNorm = normalizeName(fromCity).toLowerCase();
  // Maximum 10 days per destination
  const safeDays = Math.max(1, Math.min(10, Number(days) || 1));

  const plan = destinationPlans[destinationName];

  const result = [];
  for (let i = 0; i < safeDays; i += 1) {
    if (plan && plan[i]) {
      // Rich structured day from destinationPlans
      const p = plan[i];
      result.push({
        day: i + 1,
        title: `Day ${i + 1}`,
        items: [
          "🌅 Morning — " + p.morning,
          "☀️ Afternoon — " + p.afternoon,
          "🌙 Evening — " + p.evening,
        ],
      });
    } else {
      // Fallback if requested days exceed available plan entries
      result.push({
        day: i + 1,
        title: `Day ${i + 1} — Leisure`,
        items: [
          "🌅 Morning — Explore local neighbourhood and markets",
          "☀️ Afternoon — Visit any remaining sights or revisit favourites",
          "🌙 Evening — Local restaurant dinner + souvenir shopping",
        ],
      });
    }
  }

  const allTravel = travelOptions[destinationName] || [];

  // Filter by source city if provided — match against the `from` field (case-insensitive)
  let filteredTravel = allTravel;
  if (fromNorm) {
    const matched = allTravel.filter(function(opt) {
      return opt.from.toLowerCase().includes(fromNorm) ||
             fromNorm.includes(opt.from.toLowerCase().split(' ')[0].replace(/[^a-z]/g, ''));
    });
    filteredTravel = matched.length ? matched : allTravel; // fall back to all if no match
  }

  return {
    destination: destinationName,
    days: safeDays,
    daysPlan: result,
    travelOptions: filteredTravel,
    allTravelOptions: allTravel,
  };
}

module.exports = {
  generateItinerary,
};
