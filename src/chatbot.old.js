function toText(value) {
  return typeof value === "string" ? value : "";
}

function normalize(value) {
  return toText(value).trim().toLowerCase();
}

function pickDestinations(destinations) {
  return Array.isArray(destinations) ? destinations.map((d) => d.name) : [];
}

function getChatReply({ message, destinations }) {
  const text = normalize(message);
  if (!text) return "Ask me about flights, hotels, buses, or an itinerary.";

  if (/(^hi$|^hello$|^hey$|good morning|good evening)/i.test(text)) {
    return "Hi! I can help with dummy flight/hotel/bus options and create an itinerary by days.";
  }

  if (text.includes("help")) {
    return "Try: 'itinerary for Goa 3 days', 'show flights Delhi to Goa', 'hotels in Jaipur', or 'buses Delhi to Agra'.";
  }

  const destNames = pickDestinations(destinations);
  if (text.includes("destinations") || text.includes("places")) {
    return `Famous places available: ${destNames.join(", ")}.`;
  }

  if (text.includes("itinerary")) {
    return "Open the Itinerary page and choose a destination + number of days (e.g., Goa, 3).";
  }

  if (text.includes("flight")) {
    return "Open Flights and optionally filter by 'from' and 'to' (e.g., from Delhi to Goa).";
  }

  if (text.includes("hotel")) {
    return "Open Hotels and pick a city (e.g., Goa, Jaipur, Delhi, Kerala).";
  }

  if (text.includes("bus")) {
    return "Open Buses and optionally filter by 'from' and 'to' (e.g., Delhi to Agra).";
  }

  return "I didn't catch that. Ask about flights, hotels, buses, or say 'itinerary for <place> <days> days'.";
}

module.exports = {
  getChatReply,
};
