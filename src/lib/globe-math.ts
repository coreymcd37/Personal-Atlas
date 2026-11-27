import * as THREE from "three";

export const GLOBE_R = 2;
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const tmp = new THREE.Vector3();

export function latLngToVector3(
  lat: number,
  lng: number,
  radius = GLOBE_R,
  target = tmp,
) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  const sinPhi = Math.sin(phi);
  return target.set(
    -radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta),
  );
}

export function vectorToLatLng(v: THREE.Vector3) {
  const n = tmp.copy(v).normalize();
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)) * RAD;
  const theta = Math.atan2(n.z, -n.x);
  let lng = theta * RAD - 180;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

export function latLngToThetaPhi(lat: number, lng: number) {
  return {
    phi: (90 - lat) * DEG,
    theta: (lng + 180) * DEG,
  };
}

export function angularDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const p1 = lat1 * DEG;
  const p2 = lat2 * DEG;
  const dp = (lat2 - lat1) * DEG;
  const dl = (lng2 - lng1) * DEG;
  const a =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2 * RAD;
}

export function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export function slerpVectors(a: THREE.Vector3, b: THREE.Vector3, t: number, target: THREE.Vector3) {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-4) return target.copy(a);
  const s = Math.sin(omega);
  return target
    .copy(a)
    .multiplyScalar(Math.sin((1 - t) * omega) / s)
    .addScaledVector(b, Math.sin(t * omega) / s);
}

export function alignUp(normal: THREE.Vector3, target: THREE.Quaternion) {
  return target.setFromUnitVectors(_up, normal);
}

const _up = new THREE.Vector3(0, 1, 0);

export function publicUrl(path: string) {
  if (typeof window === "undefined") return path;
  const host = window.location.hostname.toLowerCase();
  const pathBased =
    host === "preview.grok.genai.mil" ||
    host === "preview.grok.mil" ||
    host === "preview.grokgsac.com";
  if (!pathBased) return path;
  const match = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i.exec(window.location.pathname);
  return `${match?.[0] ?? ""}${path}`;
}
