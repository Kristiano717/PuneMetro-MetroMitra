"use strict";
(() => {
  const purple = [
    "PCMC", "Sant Tukaram Nagar", "Bhosari (Nashik Phata)", "Kasarwadi",
    "Phugewadi", "Dapodi", "Bopodi", "Khadki", "Range Hill", "Shivaji Nagar",
    "District Court (Civil Court)", "Kasba Peth", "Mahatma Phule Mandai", "Swargate"
  ];
  const aqua = [
    "Vanaz", "Anand Nagar", "Paud Phata", "S.N.D.T. College", "Garware College",
    "Deccan Gymkhana", "Chhatrapati Sambhaji Udyan", "PMC",
    "District Court (Civil Court)", "R.T.O. Pune", "Pune Railway Station",
    "Ruby Hall Clinic", "Bund Garden", "Yerawada", "Kalyani Nagar", "Ramwadi"
  ];
  const aliases = {
    "PCMC": ["pimpri", "chinchwad"],
    "Bhosari (Nashik Phata)": ["bhosari", "nashik phata"],
    "District Court (Civil Court)": ["district court", "civil court", "shivajinagar court"],
    "Mahatma Phule Mandai": ["mandai", "mahatma phule market"],
    "S.N.D.T. College": ["sndt", "s n d t"],
    "Chhatrapati Sambhaji Udyan": ["sambhaji udyan", "deccan"],
    "R.T.O. Pune": ["rto", "r t o"],
    "Pune Railway Station": ["pune station", "railway station", "pune junction", "pune railway"],
    "Ruby Hall Clinic": ["ruby hall"],
    "Yerawada": ["yerwada"]
  };
  const lines = [
    {id:"purple", name:"Purple Line", color:"#7251a5", stations:purple, ends:["PCMC","Swargate"]},
    {id:"aqua", name:"Aqua Line", color:"#188b8b", stations:aqua, ends:["Vanaz","Ramwadi"]}
  ];
  const allNames = [...new Set([...purple, ...aqua])];
  const stations = allNames.map(name => {
    const servedBy = lines.filter(line => line.stations.includes(name));
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      lines: servedBy.map(line => line.id),
      aliases: aliases[name] || []
    };
  });
  const byName = new Map(stations.map(station => [station.name, station]));
  const byId = new Map(stations.map(station => [station.id, station]));
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  function stationFrom(value) {
    if (!value) return null;
    const query = normalize(typeof value === "string" ? value : value.name || value.label || "");
    if (!query) return null;
    return stations.find(station => normalize(station.name) === query || station.aliases.some(alias => normalize(alias) === query)) || null;
  }
  function search(query) {
    const q = normalize(query);
    if (q.length < 2) return [];
    return stations
      .map(station => ({station, score: [station.name, ...station.aliases].reduce((best, word) => {
        const n = normalize(word);
        return Math.max(best, n.startsWith(q) ? 3 : n.includes(q) ? 1 : 0);
      }, 0)}))
      .filter(item => item.score > 0)
      .sort((a,b) => b.score - a.score || a.station.name.localeCompare(b.station.name))
      .slice(0, 7)
      .map(({station}) => ({
        placeId: "metro:" + station.id,
        label: station.name,
        address: "Pune Metro · " + station.lines.map(id => lines.find(line => line.id === id).name).join(" / ")
      }));
  }
  function stationForPlace(place) {
    if (!place) return null;
    if (place.placeId && place.placeId.startsWith("metro:")) return byId.get(place.placeId.slice(6)) || null;
    return stationFrom(place.label);
  }
  function segment(lineId, from, to) {
    const line = lines.find(candidate => candidate.id === lineId);
    const start = line.stations.indexOf(from.name), finish = line.stations.indexOf(to.name);
    if (start < 0 || finish < 0) return null;
    const step = start <= finish ? 1 : -1;
    const names = line.stations.slice(Math.min(start, finish), Math.max(start, finish) + 1);
    if (step < 0) names.reverse();
    return {line:line.name, lineId, color:line.color, from:from.name, to:to.name, direction:line.stations[step > 0 ? line.stations.length - 1 : 0], stops:names};
  }
  function route(originValue, destinationValue) {
    const origin = stationForPlace(originValue), destination = stationForPlace(destinationValue);
    if (!origin || !destination || origin.id === destination.id) return null;
    const candidates = [];
    for (const lineId of origin.lines) {
      if (destination.lines.includes(lineId)) {
        const direct = segment(lineId, origin, destination);
        if (direct) candidates.push([direct]);
      }
    }
    const interchange = byName.get("District Court (Civil Court)");
    for (const fromLine of origin.lines) for (const toLine of destination.lines) {
      if (fromLine === toLine) continue;
      const first = segment(fromLine, origin, interchange), second = segment(toLine, interchange, destination);
      if (first && second) candidates.push([first, second]);
    }
    candidates.sort((a,b) => a.reduce((n,s) => n + s.stops.length, 0) - b.reduce((n,s) => n + s.stops.length, 0));
    if (!candidates.length) return null;
    return {origin, destination, segments:candidates[0], stationCount:candidates[0].reduce((n,s) => n + s.stops.length - 1, 0)};
  }
  window.MetroMitraOffline = {lines, stations, search, stationFrom, stationForPlace, route};
})();
