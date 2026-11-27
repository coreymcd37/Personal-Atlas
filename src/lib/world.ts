import * as THREE from "three";
import { latLngToVector3 } from "@/lib/globe-math";

export type Country = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  continent: string;
  pop: number;
};

type Ring = number[][];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

export type WorldData = {
  countries: Country[];
  borders: Float32Array;
  paint: { countries: Country[]; polys: MultiPolygon[] };
};

const HIDE_MARKER = new Set([
  "S. Geo. and the Is.",
  "Br. Indian Ocean Ter.",
  "Saint Helena",
  "Pitcairn Is.",
  "Anguilla",
  "Jersey",
  "Guernsey",
  "Isle of Man",
  "Niue",
  "Cook Is.",
  "St. Pierre and Miquelon",
  "Wallis and Futuna Is.",
  "St-Martin",
  "St-Barthélemy",
  "French Southern Lands",
  "Åland",
  "Indian Ocean Ter.",
  "Heard I. and McDonald Is.",
  "Norfolk Island",
  "Ashmore and Cartier Is.",
  "Siachen Glacier",
  "Sint Maarten",
  "N. Mariana Is.",
  "U.S. Virgin Is.",
  "American Samoa",
  "British Virgin Is.",
  "Turks and Caicos Is.",
  "Montserrat",
]);

type RawCountry = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  continent: string;
  pop: number;
};

function circleRing(lng: number, lat: number) {
  const ring: number[][] = [];
  for (let k = 0; k <= 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ring.push([lng + Math.cos(a) * 0.28, lat + Math.sin(a) * 0.2]);
  }
  return ring;
}

function hasArea(polys: MultiPolygon) {
  for (const poly of polys) {
    for (const ring of poly) if (ring.length > 3) return true;
  }
  return false;
}

export function buildWorld(raw: { countries: RawCountry[]; polys: MultiPolygon[] }): WorldData {
  const countries: Country[] = [];
  const paintPolys: MultiPolygon[] = [];
  const paintCountries: Country[] = [];
  const positions: number[] = [];
  const v = new THREE.Vector3();

  raw.countries.forEach((c, index) => {
    let polys = raw.polys[index] ?? [];
    if (!hasArea(polys)) polys = [[circleRing(c.lng, c.lat)]];
    const country: Country = {
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      continent: c.continent,
      pop: c.pop,
    };
    paintCountries.push(country);
    paintPolys.push(polys);

    for (const poly of polys) {
      for (const ring of poly) {
        for (let i = 0; i < ring.length - 1; i++) {
          const a = ring[i];
          const b = ring[i + 1];
          if (!a || !b) continue;
          if (Math.abs(a[0] - b[0]) > 35) continue;
          latLngToVector3(a[1], a[0], 1, v);
          const ax = v.x;
          const ay = v.y;
          const az = v.z;
          latLngToVector3(b[1], b[0], 1, v);
          const dx = ax - v.x;
          const dy = ay - v.y;
          const dz = az - v.z;
          if (dx * dx + dy * dy + dz * dz > 0.08) continue;
          positions.push(ax, ay, az, v.x, v.y, v.z);
        }
      }
    }

    if (!HIDE_MARKER.has(c.name)) countries.push(country);
  });

  return {
    countries,
    borders: new Float32Array(positions),
    paint: { countries: paintCountries, polys: paintPolys },
  };
}

function landColor(name: string) {
  if (name === "Antarctica") return "hsl(206 12% 34%)";
  if (name === "Greenland") return "hsl(204 14% 32%)";
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hue = 198 + (Math.abs(h) % 14);
  const lit = 19 + (Math.abs(h >>> 4) % 8);
  const sat = 16 + (Math.abs(h >>> 8) % 8);
  return `hsl(${hue} ${sat}% ${lit}%)`;
}

function traceRing(
  ctx: CanvasRenderingContext2D,
  ring: number[][],
  w: number,
  h: number,
) {
  let prev = ring[0]?.[0] ?? 0;
  for (let i = 0; i < ring.length; i++) {
    const lng = ring[i][0];
    const lat = ring[i][1];
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    if (i === 0 || Math.abs(lng - prev) > 35) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    prev = lng;
  }
}

export function paintEarth(world: WorldData) {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the globe");

  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#163044");
  ocean.addColorStop(0.12, "#0b1a28");
  ocean.addColorStop(0.5, "#0c2233");
  ocean.addColorStop(0.88, "#0b1a28");
  ocean.addColorStop(1, "#1a3144");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  const { countries, polys } = world.paint;
  countries.forEach((country, index) => {
    ctx.beginPath();
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(ctx, ring, w, h);
    }
    ctx.fillStyle = landColor(country.name);
    ctx.fill("evenodd");
  });

  ctx.beginPath();
  countries.forEach((_, index) => {
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(ctx, ring, w, h);
    }
  });
  ctx.strokeStyle = "rgba(186, 214, 230, 0.55)";
  ctx.lineWidth = 1.15;
  ctx.stroke();

  const labels = countries
    .filter((c) => c.pop > 12_000_000 && c.name !== "Antarctica")
    .sort((a, b) => b.pop - a.pop);
  const occupied: { x: number; y: number; hw: number }[] = [];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(226, 236, 244, 0.78)";
  for (const country of labels) {
    const size = Math.round(Math.min(28, 13 + Math.log10(country.pop) * 2.1));
    ctx.font = `600 ${size}px Georgia, "Liberation Serif", serif`;
    const textW = ctx.measureText(country.name).width;
    const x = ((country.lng + 180) / 360) * w;
    const y = ((90 - country.lat) / 180) * h;
    const hw = textW / 2 + 6;
    if (occupied.some((o) => Math.abs(o.x - x) < o.hw + hw && Math.abs(o.y - y) < size)) continue;
    occupied.push({ x, y, hw });
    ctx.fillText(country.name, x, y);
  }

  const bump = document.createElement("canvas");
  bump.width = 1024;
  bump.height = 512;
  const bctx = bump.getContext("2d");
  if (!bctx) throw new Error("Could not draw relief");
  bctx.fillStyle = "#1a1a1a";
  bctx.fillRect(0, 0, bump.width, bump.height);
  bctx.fillStyle = "#c8c8c8";
  countries.forEach((_, index) => {
    bctx.beginPath();
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(bctx, ring, bump.width, bump.height);
    }
    bctx.fill("evenodd");
  });

  const albedo = new THREE.CanvasTexture(canvas);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.anisotropy = 8;
  albedo.needsUpdate = true;
  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.needsUpdate = true;
  return { albedo, bumpMap };
}

const CITIES: [number, number, number][] = [
  [40.7, -74.0, 1.4], [34.05, -118.24, 1.3], [41.88, -87.63, 1.1], [29.76, -95.37, 0.9],
  [33.45, -112.07, 0.7], [37.77, -122.42, 0.9], [25.76, -80.19, 0.8], [47.6, -122.33, 0.7],
  [19.43, -99.13, 1.3], [23.13, -82.38, 0.6], [-23.55, -46.63, 1.3], [-34.6, -58.38, 1.0],
  [-22.9, -43.2, 0.9], [4.7, -74.07, 0.8], [-12.05, -77.04, 0.7], [-33.45, -70.66, 0.6],
  [51.5, -0.12, 1.4], [48.86, 2.35, 1.2], [52.52, 13.4, 0.9], [41.9, 12.5, 0.8],
  [40.42, -3.7, 1.0], [55.75, 37.62, 1.3], [59.93, 30.34, 0.8], [50.45, 30.52, 0.8],
  [41.01, 28.97, 1.1], [30.04, 31.24, 1.2], [33.57, -7.59, 0.7], [36.75, 3.06, 0.6],
  [6.52, 3.38, 1.2], [5.6, -0.19, 0.6], [-1.29, 36.82, 0.7], [-26.2, 28.05, 0.9],
  [-33.92, 18.42, 0.6], [25.2, 55.27, 1.0], [24.47, 54.37, 0.7], [21.49, 39.19, 0.6],
  [28.61, 77.21, 1.4], [19.08, 72.88, 1.4], [13.08, 80.27, 0.9], [22.57, 88.36, 1.1],
  [12.97, 77.59, 1.0], [31.52, 74.36, 0.9], [24.86, 67.01, 0.9], [23.81, 90.41, 1.0],
  [13.75, 100.5, 1.1], [1.35, 103.82, 0.8], [3.14, 101.69, 0.8], [14.6, 120.98, 1.1],
  [-6.2, 106.85, 1.2], [35.68, 139.76, 1.5], [34.69, 135.5, 1.1], [35.17, 129.07, 0.9],
  [37.57, 126.98, 1.2], [39.9, 116.4, 1.5], [31.23, 121.47, 1.4], [23.13, 113.26, 1.2],
  [30.57, 114.3, 0.9], [22.3, 114.17, 1.0], [25.03, 121.57, 0.9], [-33.87, 151.21, 1.0],
  [-37.81, 144.96, 0.8], [35.69, 51.39, 1.1], [33.31, 44.37, 0.7], [24.71, 46.67, 0.8],
  [43.65, -79.38, 0.8], [45.5, -73.57, 0.6], [59.33, 18.07, 0.5], [60.17, 24.94, 0.5],
];

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function paintNight(world: WorldData) {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the night globe");

  ctx.fillStyle = "#02050a";
  ctx.fillRect(0, 0, w, h);

  const { countries, polys } = world.paint;
  countries.forEach((country, index) => {
    ctx.beginPath();
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(ctx, ring, w, h);
    }
    ctx.fillStyle = "#101820";
    ctx.fill("evenodd");
  });

  const mw = 720;
  const mh = 360;
  const mask = document.createElement("canvas");
  mask.width = mw;
  mask.height = mh;
  const mctx = mask.getContext("2d", { willReadFrequently: true });
  if (!mctx) throw new Error("Could not draw the night globe");
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, mw, mh);
  mctx.fillStyle = "#fff";
  countries.forEach((_, index) => {
    mctx.beginPath();
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(mctx, ring, mw, mh);
    }
    mctx.fill("evenodd");
  });
  const pixels = mctx.getImageData(0, 0, mw, mh).data;
  const onLand = (lng: number, lat: number) => {
    if (lat > 84 || lat < -58) return false;
    const x = Math.min(mw - 1, Math.max(0, Math.floor(((lng + 180) / 360) * mw)));
    const y = Math.min(mh - 1, Math.max(0, Math.floor(((90 - lat) / 180) * mh)));
    return pixels[(y * mw + x) * 4] > 140;
  };

  const lights = document.createElement("canvas");
  lights.width = w;
  lights.height = h;
  const lctx = lights.getContext("2d");
  if (!lctx) throw new Error("Could not draw the night globe");
  const rand = mulberry(19);
  const dot = (lng: number, lat: number, radius: number, color: string) => {
    const x = ((lng + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    lctx.fillStyle = color;
    lctx.beginPath();
    lctx.arc(x, y, radius, 0, Math.PI * 2);
    lctx.fill();
  };

  for (const [index, country] of countries.entries()) {
    if (country.name === "Antarctica" || country.pop < 80000) continue;
    let minLng = 180;
    let maxLng = -180;
    let minLat = 90;
    let maxLat = -90;
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) {
        for (const pair of ring) {
          minLng = Math.min(minLng, pair[0]);
          maxLng = Math.max(maxLng, pair[0]);
          minLat = Math.min(minLat, pair[1]);
          maxLat = Math.max(maxLat, pair[1]);
        }
      }
    }
    const span = maxLng - minLng;
    const count = Math.min(640, Math.round(18 * (country.pop / 1_000_000) ** 0.62) + 6);
    let placed = 0;
    for (let i = 0; i < count * 3 && placed < count; i++) {
      let lat: number;
      let lng: number;
      if (span > 80 || span < 0.2) {
        const spread = Math.min(18, 4 + Math.log10(country.pop + 10));
        lat = country.lat + (rand() - 0.5) * spread;
        lng = country.lng + (rand() - 0.5) * spread * 1.3;
      } else {
        lat = minLat + rand() * (maxLat - minLat);
        lng = minLng + rand() * span;
      }
      if (!onLand(lng, lat)) continue;
      const warm = rand() > 0.18;
      dot(lng, lat, rand() > 0.92 ? 2.2 : 1.15, warm ? "#ffe7b0" : "#d7e7ff");
      placed += 1;
    }
  }

  for (const [lat, lng, scale] of CITIES) {
    if (!onLand(lng, lat)) {
      dot(lng, lat, 2.4 * scale, "#fff1cc");
      continue;
    }
    dot(lng, lat, 3.1 * scale, "#fff6d8");
    dot(lng, lat, 1.3 * scale, "#ffffff");
  }

  ctx.filter = "blur(2.4px)";
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(lights, 0, 0);
  ctx.filter = "none";
  ctx.drawImage(lights, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  ctx.beginPath();
  countries.forEach((_, index) => {
    for (const poly of polys[index] ?? []) {
      for (const ring of poly) traceRing(ctx, ring, w, h);
    }
  });
  ctx.strokeStyle = "rgba(120, 150, 170, 0.22)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function cloudTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Could not draw clouds");
  ctx.clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * c.width;
    const y = c.height * (0.18 + Math.random() * 0.64);
    const rw = 30 + Math.random() * 90;
    const rh = 8 + Math.random() * 18;
    const g = ctx.createRadialGradient(x, y, 2, x, y, rw);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}
