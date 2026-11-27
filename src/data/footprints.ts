import * as THREE from "three";
import { GLOBE_R, angularDistance, latLngToVector3, slerpVectors, vectorToLatLng } from "@/lib/globe-math";

const va = new THREE.Vector3();
const vb = new THREE.Vector3();
const vs = new THREE.Vector3();

type LL = [number, number];

function expand(points: LL[], stepDeg: number) {
  const out: { lat: number; lng: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    latLngToVector3(points[i][0], points[i][1], 1, va).normalize();
    latLngToVector3(points[i + 1][0], points[i + 1][1], 1, vb).normalize();
    const ang = va.angleTo(vb) * (180 / Math.PI);
    const n = Math.max(1, Math.round(ang / stepDeg));
    for (let s = 0; s < n; s++) {
      slerpVectors(va, vb, s / n, vs);
      out.push(vectorToLatLng(vs));
    }
  }
  const last = points[points.length - 1];
  out.push({ lat: last[0], lng: last[1] });
  return out;
}

function localWalk(lat: number, lng: number, n = 4, spread = 0.08): LL[] {
  const pts: LL[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / Math.max(1, n - 1)) * 1.4 - 0.4;
    pts.push([lat + Math.cos(a) * spread, lng + Math.sin(a) * spread * 1.15]);
  }
  return pts;
}

const WALKS: { step: number; points: LL[] }[] = [
  {
    step: 2.8,
    points: [
      [29.76, -95.37],
      [31.69, -106.42],
      [37.0, -109.05],
      [39.5, -105],
      [47, -100],
      [39, -98],
    ],
  },
  { step: 2.4, points: [[25.04, 121.56], [23.5, 121.0], [22.6, 120.3]] },
  {
    step: 2.6,
    points: [
      [18.79, 98.99],
      [13.75, 100.5],
      [7.89, 98.39],
      [3.14, 101.69],
      [1.35, 103.82],
    ],
  },
  { step: 2.4, points: [[14.6, 120.98], [10.3, 123.9], [9.85, 124.14]] },
  { step: 2.2, points: [[25.27, 55.33], [25.08, 55.14]] },
  {
    step: 2.8,
    points: [
      [55.76, 37.62],
      [59.93, 30.34],
      [43.6, 39.73],
      [60.17, 24.94],
    ],
  },
  { step: 2.6, points: [[35.68, 139.76], [35.0, 135.76], [34.39, 132.46]] },
  { step: 2.8, points: [[39.91, 116.41], [31.23, 121.47], [23.13, 113.26]] },
  {
    step: 2.8,
    points: [
      [40.71, -74.01],
      [39.0, -105],
      [34.05, -118.24],
      [37.77, -122.42],
      [32.72, -117.16],
      [33.45, -112.07],
    ],
  },
];

const JUMPS: { a: LL; b: LL; lift: number }[] = [
  { a: [37.0, -109.05], b: [25.04, 121.56], lift: 0.62 },
  { a: [22.63, 120.3], b: [18.79, 98.99], lift: 0.38 },
  { a: [7.89, 98.39], b: [7.74, 98.78], lift: 0.16 },
  { a: [7.89, 98.39], b: [8.16, 98.63], lift: 0.14 },
  { a: [7.89, 98.39], b: [8.0, 98.59], lift: 0.13 },
  { a: [7.89, 98.39], b: [7.6, 98.37], lift: 0.12 },
  { a: [7.89, 98.39], b: [7.74, 98.36], lift: 0.1 },
  { a: [7.89, 98.39], b: [7.53, 99.04], lift: 0.18 },
  { a: [7.89, 98.39], b: [5.41, 100.33], lift: 0.28 },
  { a: [1.29, 103.85], b: [9.96, 98.63], lift: 0.34 },
  { a: [9.96, 98.63], b: [7.89, 98.39], lift: 0.18 },
  { a: [7.89, 98.39], b: [14.6, 120.98], lift: 0.42 },
  { a: [14.6, 120.98], b: [10.32, 123.89], lift: 0.28 },
  { a: [10.32, 123.89], b: [9.85, 124.14], lift: 0.14 },
  { a: [9.85, 124.14], b: [25.2, 55.27], lift: 0.55 },
  { a: [25.08, 55.14], b: [55.76, 37.62], lift: 0.5 },
  { a: [61.5, 23.77], b: [35.68, 139.76], lift: 0.55 },
  { a: [34.39, 132.46], b: [39.91, 116.41], lift: 0.36 },
  { a: [23.13, 113.26], b: [40.75, -73.99], lift: 0.72 },
  { a: [40.75, -73.99], b: [34.05, -118.24], lift: 0.48 },
];

export type Footstep = { lat: number; lng: number; left: boolean };

export function buildFootsteps(): Footstep[] {
  const raw = WALKS.flatMap((route) => expand(route.points, route.step));
  const kept: { lat: number; lng: number }[] = [];
  for (const point of raw) {
    const prev = kept[kept.length - 1];
    if (prev && angularDistance(prev.lat, prev.lng, point.lat, point.lng) < 2.15) continue;
    kept.push(point);
  }
  return kept.map((point, i) => ({ ...point, left: i % 2 === 0 }));
}

export function buildJumpLines(): Float32Array {
  const pts: number[] = [];
  const samples = 28;
  for (const jump of JUMPS) {
    latLngToVector3(jump.a[0], jump.a[1], 1, va).normalize();
    latLngToVector3(jump.b[0], jump.b[1], 1, vb).normalize();
    let prev: THREE.Vector3 | null = null;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      slerpVectors(va, vb, t, vs);
      const lift = Math.sin(t * Math.PI) * jump.lift;
      vs.multiplyScalar(GLOBE_R + 0.02 + lift);
      if (prev) pts.push(prev.x, prev.y, prev.z, vs.x, vs.y, vs.z);
      prev = vs.clone();
    }
  }
  return new Float32Array(pts);
}
