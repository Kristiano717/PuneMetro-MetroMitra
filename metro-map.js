"use strict";
(() => {
  const root = document.getElementById("metro-map");
  const fallback = document.getElementById("map-fallback");
  const data = window.MetroMitraOffline;
  if (!root || !data) return;
  if (!window.L) {
    fallback.textContent = "Map library could not load. Use the official Pune Metro route map below.";
    return;
  }
  const map = L.map(root, {zoomControl:false, scrollWheelZoom:true, preferCanvas:true, minZoom:10, maxZoom:19});
  const satellite = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution:"Imagery © Esri, Maxar, Earthstar Geographics and the GIS User Community"});
  const streets = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution:"Map data © Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCAN, METI, and the GIS User Community"});
  satellite.addTo(map);
  L.control.zoom({position:"topright"}).addTo(map);
  const stationByName = new Map(data.stations.map(station => [station.name, station]));
  const wholeNetwork = L.featureGroup().addTo(map);
  const routeLayers = [];
  const markerLayer = L.featureGroup().addTo(map);
  const lineLayers = new Map();
  const labels = [];
  for (const line of data.lines) {
    const points = line.stations.map(name => stationByName.get(name)).filter(station => station && station.coordinates).map(station => station.coordinates);
    const casing = L.polyline(points, {color:"#fff", weight:11, opacity:.93, lineCap:"round", lineJoin:"round"}).addTo(wholeNetwork);
    const stroke = L.polyline(points, {color:line.color, weight:6, opacity:.97, lineCap:"round", lineJoin:"round"}).addTo(wholeNetwork);
    lineLayers.set(line.id, [casing, stroke]);
  }
  for (const station of data.stations) {
    if (!station.coordinates) continue;
    const colors = station.lines.map(id => data.lines.find(line => line.id === id).color);
    const interchange = colors.length > 1;
    const marker = L.circleMarker(station.coordinates, {
      radius:interchange?8:5,
      color:interchange?"#fff":colors[0],
      weight:interchange?3:2.5,
      fillColor:colors[0],
      fillOpacity:1,
      className:interchange?"metro-interchange":"metro-station-dot"
    }).bindPopup(`<strong>${station.name}</strong><br>${station.lines.map(id => data.lines.find(line => line.id === id).name).join(" · ")}`);
    marker.addTo(markerLayer);
    const tooltip = marker.bindTooltip(station.name, {permanent:false,direction:"top",offset:[0,-5],className:"station-label",opacity:1});
    labels.push(tooltip);
  }
  const bounds = wholeNetwork.getBounds().pad(.075);
  map.fitBounds(bounds, {animate:false});
  function syncLabels() {
    const showLabels = map.getZoom() >= 15;
    for (const marker of labels) {
      if (showLabels && !map.hasLayer(marker.getTooltip())) marker.openTooltip();
      else if (!showLabels && marker.getTooltip() && map.hasLayer(marker.getTooltip())) marker.closeTooltip();
    }
  }
  map.on("zoomend", syncLabels);
  map.whenReady(syncLabels);
  map.whenReady(() => { fallback.hidden = true; setTimeout(() => map.invalidateSize(),100); });
  document.getElementById("map-reset").addEventListener("click", () => { map.fitBounds(bounds, {padding:[30,30]}); clearHighlight(); });
  const styleButton = document.getElementById("map-style");
  if (styleButton) styleButton.addEventListener("click", () => {
    const useSatellite = styleButton.dataset.style !== "street";
    if (useSatellite) { map.removeLayer(satellite); streets.addTo(map); styleButton.dataset.style="street"; styleButton.textContent="Satellite view"; }
    else { map.removeLayer(streets); satellite.addTo(map); styleButton.dataset.style="satellite"; styleButton.textContent="Street view"; }
  });
  function clearHighlight() {
    routeLayers.splice(0).forEach(layer => map.removeLayer(layer));
    for (const layer of lineLayers.values()) for (const part of layer) part.setStyle({opacity:.97});
  }
  function highlight(segments) {
    clearHighlight();
    if (!Array.isArray(segments) || !segments.length) return;
    for (const layer of lineLayers.values()) for (const part of layer) part.setStyle({opacity:.25});
    const tripBounds = L.latLngBounds([]);
    for (const segment of segments) {
      const points = (segment.stops || []).map(name => stationByName.get(name)).filter(station => station && station.coordinates).map(station => station.coordinates);
      if (points.length < 2) continue;
      routeLayers.push(L.polyline(points, {color:"#fff",weight:15,opacity:.95,lineCap:"round",lineJoin:"round"}).addTo(map));
      routeLayers.push(L.polyline(points, {color:segment.color || "#123e32",weight:9,opacity:1,lineCap:"round",lineJoin:"round"}).addTo(map));
      points.forEach(point => tripBounds.extend(point));
    }
    if (tripBounds.isValid()) map.fitBounds(tripBounds.pad(.25), {maxZoom:14});
  }
  window.MetroMitraMap = {map, highlight, reset:clearHighlight};
  setTimeout(() => map.invalidateSize(),250);
})();
