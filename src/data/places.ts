import type { ModelId } from "@/components/globe/landmarks";

export type Selection = {
  id: string;
  kind: "lived" | "trail" | "wonder" | "country";
  name: string;
  detail: string;
  meta?: string;
  lat: number;
  lng: number;
  distance: number;
};

export type LivedPlace = Selection & { kind: "lived" };
export type TrailPlace = Selection & { kind: "trail"; rank: 1 | 2 | 3 };

export const LIVED: LivedPlace[] = [
  {
    id: "lived-america",
    kind: "lived",
    name: "America",
    meta: "32 years",
    lat: 39.5,
    lng: -98.35,
    distance: 4.85,
    detail:
      "Home for 32 years. The steps start in Houston, cross New Mexico and Minnesota, and later return through Nevada, the Four Corners, California, and end in Tempe.",
  },
  {
    id: "lived-phuket",
    kind: "lived",
    name: "Phuket, Thailand",
    meta: "12 years",
    lat: 7.89,
    lng: 98.39,
    distance: 2.78,
    detail: "Twelve years on Phuket — the longest chapter away from America.",
  },
  {
    id: "lived-chiangmai",
    kind: "lived",
    name: "Chiang Mai",
    meta: "1 year",
    lat: 18.79,
    lng: 98.98,
    distance: 2.78,
    detail: "A year in Chiang Mai, in the north of Thailand.",
  },
  {
    id: "lived-russia",
    kind: "lived",
    name: "Russia",
    meta: "1 year",
    lat: 55.75,
    lng: 37.62,
    distance: 3.7,
    detail: "A year in Russia — Moscow, Saint Petersburg, Sochi, Novgorod, and Obninsk.",
  },
  {
    id: "lived-philippines",
    kind: "lived",
    name: "Philippines",
    meta: "Over ½ year",
    lat: 12.2,
    lng: 122.4,
    distance: 3.85,
    detail: "More than half a year across the islands — Manila, Cebu, and Bohol.",
  },
];

export const COUNTRIES: TrailPlace[] = [
  { id: "c-us", kind: "trail", rank: 1, name: "United States", meta: "32 years", lat: 39.5, lng: -98.5, distance: 5.4, detail: "Home for 32 years. Steps cross Texas, the Southwest, the Pacific coast, and New York." },
  { id: "c-mexico", kind: "trail", rank: 1, name: "Mexico", meta: "Steps", lat: 31.7, lng: -106.4, distance: 3.4, detail: "Across the border at Juarez, then back toward the Four Corners." },
  { id: "c-taiwan", kind: "trail", rank: 1, name: "Taiwan", meta: "Steps", lat: 23.7, lng: 121.0, distance: 3.3, detail: "Down the island, then a jump toward Thailand." },
  { id: "c-thailand", kind: "trail", rank: 1, name: "Thailand", meta: "13 years", lat: 13.0, lng: 100.5, distance: 3.6, detail: "Chiang Mai, Bangkok, the east coast, Ranong, and twelve years on Phuket." },
  { id: "c-malaysia", kind: "trail", rank: 1, name: "Malaysia", meta: "Steps", lat: 3.8, lng: 102.0, distance: 3.5, detail: "Kuala Lumpur and a few of the big cities down the peninsula." },
  { id: "c-singapore", kind: "trail", rank: 1, name: "Singapore", meta: "Steps", lat: 1.35, lng: 103.82, distance: 2.9, detail: "A handful of stops at the tip of the peninsula." },
  { id: "c-philippines", kind: "trail", rank: 1, name: "Philippines", meta: "Over ½ year", lat: 12.0, lng: 122.5, distance: 4.0, detail: "More than half a year — Manila, Cebu, and Bohol." },
  { id: "c-uae", kind: "trail", rank: 1, name: "United Arab Emirates", meta: "Steps", lat: 25.2, lng: 55.27, distance: 3.1, detail: "Dubai, between the Philippines and Russia." },
  { id: "c-russia", kind: "trail", rank: 1, name: "Russia", meta: "1 year", lat: 58.0, lng: 40.0, distance: 4.6, detail: "A year based around Moscow, Saint Petersburg, Sochi, Novgorod, and Obninsk." },
  { id: "c-finland", kind: "trail", rank: 1, name: "Finland", meta: "Steps", lat: 61.0, lng: 25.0, distance: 3.4, detail: "Helsinki and a short way inland, then the jump to Japan." },
  { id: "c-japan", kind: "trail", rank: 1, name: "Japan", meta: "Steps", lat: 36.2, lng: 138.0, distance: 3.8, detail: "Tokyo through Kyoto and Osaka, on to Hiroshima." },
  { id: "c-china", kind: "trail", rank: 1, name: "China", meta: "Steps", lat: 35.0, lng: 105.0, distance: 4.4, detail: "Beijing first, then the interior and the east and south coasts." },
];

export const TRAIL: TrailPlace[] = [
  { id: "trail-houston", kind: "trail", rank: 1, name: "Houston", meta: "Start", lat: 29.76, lng: -95.37, distance: 3.15, detail: "Where the steps begin, on the Gulf coast of Texas." },
  { id: "trail-farmington", kind: "trail", rank: 2, name: "Farmington", meta: "New Mexico", lat: 36.73, lng: -108.22, distance: 3.05, detail: "A return point in northwest New Mexico, between the desert towns." },
  { id: "trail-gallup", kind: "trail", rank: 2, name: "Gallup", meta: "New Mexico", lat: 35.53, lng: -108.74, distance: 3.0, detail: "A stop on the way across New Mexico, before the turn north." },
  { id: "trail-minnesota", kind: "trail", rank: 1, name: "Minnesota", meta: "Steps", lat: 44.98, lng: -93.27, distance: 3.3, detail: "The northern reach of the American steps, then back toward New Mexico." },
  { id: "trail-cuba", kind: "trail", rank: 3, name: "Cuba", meta: "New Mexico", lat: 36.02, lng: -106.96, distance: 2.95, detail: "A small New Mexico town the steps pass through twice." },
  { id: "trail-bloomfield", kind: "trail", rank: 3, name: "Bloomfield", meta: "New Mexico", lat: 36.71, lng: -107.98, distance: 2.9, detail: "Just east of Farmington, a short stretch of the same valley." },
  { id: "trail-vegas", kind: "trail", rank: 1, name: "Las Vegas", meta: "Nevada", lat: 36.17, lng: -115.14, distance: 3.0, detail: "The Nevada stop, crossed once on the way into Colorado and again later." },
  { id: "trail-henderson", kind: "trail", rank: 3, name: "Henderson", meta: "Nevada", lat: 36.04, lng: -114.98, distance: 2.85, detail: "The neighbor city just southeast of Las Vegas." },
  { id: "trail-durango", kind: "trail", rank: 2, name: "Durango", meta: "Colorado", lat: 37.28, lng: -107.88, distance: 2.95, detail: "A mountain-town stop in southwest Colorado." },
  { id: "trail-denver", kind: "trail", rank: 1, name: "Denver", meta: "Colorado", lat: 39.74, lng: -104.99, distance: 3.15, detail: "The Colorado capital, between the springs and the road back south." },
  { id: "trail-springs", kind: "trail", rank: 2, name: "Colorado Springs", meta: "Colorado", lat: 38.83, lng: -104.82, distance: 3.0, detail: "On the Front Range, between Durango and Denver." },
  { id: "trail-juarez", kind: "trail", rank: 2, name: "Juarez", meta: "Mexico", lat: 31.69, lng: -106.42, distance: 3.05, detail: "Across the border, then back toward the Four Corners." },
  { id: "trail-four", kind: "trail", rank: 2, name: "Four Corners", meta: "Steps", lat: 37.0, lng: -109.05, distance: 3.15, detail: "Where four states meet. The steps cross it more than once." },
  { id: "trail-taiwan", kind: "trail", rank: 1, name: "Taiwan", meta: "Steps", lat: 23.7, lng: 120.96, distance: 3.2, detail: "Down the island, before the jump to northern Thailand." },
  { id: "trail-chiangmai", kind: "trail", rank: 1, name: "Chiang Mai", meta: "Thailand", lat: 18.79, lng: 98.99, distance: 2.9, detail: "A year in the north, then steps south toward Bangkok." },
  { id: "trail-bangkok", kind: "trail", rank: 1, name: "Bangkok", meta: "Thailand", lat: 13.76, lng: 100.5, distance: 2.95, detail: "Through the capital, then east and on down to the islands." },
  { id: "trail-phuket", kind: "trail", rank: 1, name: "Phuket", meta: "Island", lat: 7.89, lng: 98.39, distance: 2.85, detail: "Twelve years on the island, with jumps out to the ones around it." },
  { id: "trail-kl", kind: "trail", rank: 1, name: "Kuala Lumpur", meta: "Malaysia", lat: 3.14, lng: 101.69, distance: 2.9, detail: "The Malaysian capital, with a few big cities along the peninsula." },
  { id: "trail-singapore", kind: "trail", rank: 1, name: "Singapore", meta: "Steps", lat: 1.35, lng: 103.82, distance: 2.7, detail: "A handful of stops at the tip of the peninsula." },
  { id: "trail-ranong", kind: "trail", rank: 2, name: "Ranong", meta: "Thailand", lat: 9.96, lng: 98.63, distance: 2.8, detail: "A couple of places on the Andaman coast, then back to Phuket." },
  { id: "trail-manila", kind: "trail", rank: 1, name: "Manila", meta: "Philippines", lat: 14.6, lng: 120.98, distance: 2.9, detail: "The start of the Philippine steps, before the jump to Cebu." },
  { id: "trail-cebu", kind: "trail", rank: 2, name: "Cebu", meta: "Philippines", lat: 10.32, lng: 123.89, distance: 2.8, detail: "The middle island, between Manila and Bohol." },
  { id: "trail-bohol", kind: "trail", rank: 2, name: "Bohol", meta: "Philippines", lat: 9.85, lng: 124.14, distance: 2.75, detail: "The last Philippine island on this trail, then a jump to Dubai." },
  { id: "trail-dubai", kind: "trail", rank: 1, name: "Dubai", meta: "Steps", lat: 25.2, lng: 55.27, distance: 2.9, detail: "Along the coast, between the Philippines and Russia." },
  { id: "trail-moscow", kind: "trail", rank: 1, name: "Moscow", meta: "Russia", lat: 55.76, lng: 37.62, distance: 3.15, detail: "The Russian capital. A year based here, before the road west and south." },
  { id: "trail-petersburg", kind: "trail", rank: 1, name: "Saint Petersburg", meta: "Russia", lat: 59.93, lng: 30.34, distance: 3.05, detail: "The northern capital, visited on the way out and again before Finland." },
  { id: "trail-sochi", kind: "trail", rank: 2, name: "Sochi", meta: "Russia", lat: 43.6, lng: 39.73, distance: 3.0, detail: "Down to the Black Sea, then back toward the northwest." },
  { id: "trail-novgorod", kind: "trail", rank: 2, name: "Novgorod", meta: "Russia", lat: 58.52, lng: 31.28, distance: 2.95, detail: "Veliky Novgorod, on the return toward Saint Petersburg." },
  { id: "trail-obninsk", kind: "trail", rank: 3, name: "Obninsk", meta: "Russia", lat: 55.11, lng: 36.59, distance: 2.9, detail: "A smaller stop southwest of Moscow, before the road back north." },
  { id: "trail-finland", kind: "trail", rank: 1, name: "Finland", meta: "Steps", lat: 60.17, lng: 24.94, distance: 3.2, detail: "Helsinki and a short way inland, then the jump to Japan." },
  { id: "trail-japan", kind: "trail", rank: 1, name: "Japan", meta: "Steps", lat: 35.68, lng: 139.76, distance: 3.5, detail: "From Tokyo through Kyoto and Osaka, on to Hiroshima." },
  { id: "trail-china", kind: "trail", rank: 1, name: "China", meta: "Steps", lat: 39.91, lng: 116.41, distance: 4.1, detail: "Beijing first, then the interior and the east and south coasts." },
  { id: "trail-nyc", kind: "trail", rank: 1, name: "New York", meta: "Steps", lat: 40.71, lng: -74.01, distance: 2.95, detail: "A stop on the Atlantic, then a jump back to California." },
  { id: "trail-flagstaff", kind: "trail", rank: 2, name: "Flagstaff", meta: "Arizona", lat: 35.2, lng: -111.65, distance: 3.0, detail: "The high-country stop between Nevada, Utah, and the later run west." },
  { id: "trail-moab", kind: "trail", rank: 2, name: "Moab", meta: "Utah", lat: 38.57, lng: -109.55, distance: 2.95, detail: "Up into red-rock Utah, then on to Silverton." },
  { id: "trail-silverton", kind: "trail", rank: 2, name: "Silverton", meta: "Colorado", lat: 37.81, lng: -107.66, distance: 2.9, detail: "A high town in the San Juan Mountains, then down to the Four Corners." },
  { id: "trail-la", kind: "trail", rank: 1, name: "Los Angeles", meta: "California", lat: 34.05, lng: -118.24, distance: 2.95, detail: "The California return, then north to San Francisco and back down the coast." },
  { id: "trail-sf", kind: "trail", rank: 1, name: "San Francisco", meta: "California", lat: 37.77, lng: -122.42, distance: 2.9, detail: "The bay, a few towns around it, then the coast south." },
  { id: "trail-sd", kind: "trail", rank: 2, name: "San Diego", meta: "California", lat: 32.72, lng: -117.16, distance: 2.9, detail: "The end of the coastline, before the road east to Phoenix." },
  { id: "trail-phoenix", kind: "trail", rank: 1, name: "Phoenix", meta: "Arizona", lat: 33.45, lng: -112.07, distance: 2.95, detail: "Across the desert from San Diego. Tempe is the next, and last, stop." },
  { id: "trail-tempe", kind: "trail", rank: 1, name: "Tempe", meta: "End", lat: 33.43, lng: -111.94, distance: 2.8, detail: "The trail ends here for now, just east of Phoenix." },
];

export type Wonder = {
  id: string;
  name: string;
  detail: string;
  lat: number;
  lng: number;
  model: ModelId;
  scale: number;
};

export const WONDERS: Wonder[] = [
  { id: "buddha", name: "Big Buddha", detail: "The seated figure on the hill above Phuket.", lat: 7.828, lng: 98.313, model: "buddha", scale: 0.16 },
  { id: "wat-arun", name: "Wat Arun", detail: "The temple of dawn on the river in Bangkok.", lat: 13.744, lng: 100.489, model: "pagoda", scale: 0.14 },
  { id: "doi-suthep", name: "Doi Suthep", detail: "The golden temple on the mountain above Chiang Mai.", lat: 18.805, lng: 98.921, model: "pagoda", scale: 0.13 },
  { id: "angkor", name: "Angkor Wat", detail: "The great temple just east of Thailand, near Siem Reap.", lat: 13.413, lng: 103.867, model: "angkor", scale: 0.17 },
  { id: "petronas", name: "Petronas Towers", detail: "The twin towers in Kuala Lumpur.", lat: 3.158, lng: 101.712, model: "twins", scale: 0.15 },
  { id: "mbs", name: "Marina Bay Sands", detail: "The three towers and the sky park in Singapore.", lat: 1.283, lng: 103.861, model: "marina", scale: 0.11 },
  { id: "taipei", name: "Taipei 101", detail: "The tiered tower in Taipei.", lat: 25.034, lng: 121.565, model: "spire", scale: 0.14 },
  { id: "hills", name: "Chocolate Hills", detail: "The green cones of Bohol.", lat: 9.91, lng: 124.17, model: "peaks", scale: 0.14 },
  { id: "intramuros", name: "Intramuros", detail: "The old walled city in Manila.", lat: 14.589, lng: 120.975, model: "arch", scale: 0.13 },
  { id: "magellan", name: "Magellan's Cross", detail: "The cross pavilion in Cebu City.", lat: 10.293, lng: 123.902, model: "cross", scale: 0.13 },
  { id: "burj", name: "Burj Khalifa", detail: "The tower above downtown Dubai.", lat: 25.197, lng: 55.274, model: "burj", scale: 0.12 },
  { id: "kremlin", name: "St. Basil's", detail: "The colored domes on Red Square in Moscow.", lat: 55.753, lng: 37.623, model: "dome", scale: 0.14 },
  { id: "hermitage", name: "The Hermitage", detail: "The palace on the Neva in Saint Petersburg.", lat: 59.94, lng: 30.314, model: "palace", scale: 0.11 },
  { id: "sochi-peaks", name: "Caucasus", detail: "The mountains rising behind Sochi.", lat: 43.7, lng: 40.2, model: "peaks", scale: 0.14 },
  { id: "helsinki", name: "Helsinki Cathedral", detail: "The white church on Senate Square.", lat: 60.17, lng: 24.952, model: "dome", scale: 0.13 },
  { id: "fuji", name: "Mount Fuji", detail: "The cone west of Tokyo.", lat: 35.361, lng: 138.728, model: "fuji", scale: 0.13 },
  { id: "torii", name: "Itsukushima", detail: "The great gate standing in the water near Hiroshima.", lat: 34.296, lng: 132.32, model: "torii", scale: 0.14 },
  { id: "wall", name: "Great Wall", detail: "The wall in the hills north of Beijing.", lat: 40.43, lng: 116.57, model: "wall", scale: 0.12 },
  { id: "forbidden", name: "Forbidden City", detail: "The palace at the center of Beijing.", lat: 39.916, lng: 116.397, model: "pagoda", scale: 0.14 },
  { id: "shanghai", name: "The Bund", detail: "The towers along the river in Shanghai.", lat: 31.24, lng: 121.49, model: "twins", scale: 0.14 },
  { id: "liberty", name: "Statue of Liberty", detail: "The figure in New York Harbor.", lat: 40.6892, lng: -74.0445, model: "liberty", scale: 0.14 },
  { id: "hollywood", name: "Hollywood Sign", detail: "The letters in the hills above Los Angeles.", lat: 34.1341, lng: -118.3215, model: "sign", scale: 0.13 },
  { id: "golden-gate", name: "Golden Gate", detail: "The bridge at the mouth of San Francisco Bay.", lat: 37.8199, lng: -122.4783, model: "bridge", scale: 0.12 },
  { id: "grand-canyon", name: "Grand Canyon", detail: "The gorge north of Flagstaff.", lat: 36.1, lng: -112.14, model: "monolith", scale: 0.12 },
  { id: "monument", name: "Monument Valley", detail: "The buttes near the Four Corners.", lat: 36.998, lng: -110.098, model: "monolith", scale: 0.11 },
  { id: "vegas-sign", name: "Welcome to Las Vegas", detail: "The sign at the south end of the Strip.", lat: 36.082, lng: -115.173, model: "sign", scale: 0.08 },
  { id: "yosemite", name: "Yosemite", detail: "The granite valley east of the California coast.", lat: 37.745, lng: -119.593, model: "peaks", scale: 0.11 },
];
