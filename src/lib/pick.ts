import { angularDistance } from "@/lib/globe-math";
import { COUNTRIES, LIVED, WONDERS, type Selection, type Wonder } from "@/data/places";
import type { Country } from "@/lib/world";

const WIDE = new Set([
  "Russia",
  "Canada",
  "United States",
  "China",
  "Brazil",
  "Australia",
  "Antarctica",
  "Kazakhstan",
  "India",
  "Argentina",
  "Algeria",
]);

export function countrySelection(country: Country): Selection {
  return {
    id: `country-${country.id}`,
    kind: "country",
    name: country.name,
    detail: `${country.continent}. Border outlined, name on the map, marker on the land.`,
    meta: country.continent,
    lat: country.lat,
    lng: country.lng,
    distance: WIDE.has(country.name) ? 4.4 : country.pop > 40_000_000 ? 3.45 : 2.95,
  };
}

export function wonderSelection(wonder: Wonder): Selection {
  return {
    id: `wonder-${wonder.id}`,
    kind: "wonder",
    name: wonder.name,
    detail: wonder.detail,
    meta: "Landmark",
    lat: wonder.lat,
    lng: wonder.lng,
    distance: 2.7,
  };
}

export function pickAt(
  lat: number,
  lng: number,
  camRadius: number,
  _countries: Country[],
): Selection | null {
  const hit = Math.min(2.6, Math.max(0.72, (camRadius - 2) / 1.45));
  let bestScore = Infinity;
  let best: Selection | null = null;
  const consider = (lat2: number, lng2: number, max: number, sel: Selection, bias: number) => {
    const d = angularDistance(lat, lng, lat2, lng2);
    const limit = max * hit;
    if (d > limit) return;
    const score = (d / limit) * bias;
    if (score < bestScore) {
      bestScore = score;
      best = sel;
    }
  };
  for (const wonder of WONDERS) consider(wonder.lat, wonder.lng, 1.5, wonderSelection(wonder), 0.7);
  for (const place of COUNTRIES) consider(place.lat, place.lng, 8, place, 0.85);
  for (const place of LIVED) consider(place.lat, place.lng, 1.2, place, 1.15);
  return best;
}
