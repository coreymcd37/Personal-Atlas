import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GLOBE_R, alignUp, latLngToVector3 } from "@/lib/globe-math";
import { WONDERS, type Wonder } from "@/data/places";

export type ModelId =
  | "eiffel"
  | "pyramid"
  | "taj"
  | "liberty"
  | "colosseum"
  | "opera"
  | "bridge"
  | "fuji"
  | "wall"
  | "burj"
  | "christ"
  | "clock"
  | "pisa"
  | "moai"
  | "dome"
  | "twins"
  | "marina"
  | "step"
  | "henge"
  | "monolith"
  | "peaks"
  | "spire"
  | "torii"
  | "pagoda"
  | "arch"
  | "sign"
  | "rushmore"
  | "falls"
  | "buddha"
  | "angkor"
  | "palace"
  | "cross";

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

function cyl(
  rt: number,
  rb: number,
  h: number,
  x: number,
  y: number,
  z: number,
  seg = 7,
) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg);
  g.translate(x, y + h / 2, z);
  return g;
}

function sph(r: number, x: number, y: number, z: number, sy = 1) {
  const g = new THREE.SphereGeometry(r, 10, 8);
  if (sy !== 1) g.scale(1, sy, 1);
  g.translate(x, y, z);
  return g;
}

function merged(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  if (!g) throw new Error("Could not build a landmark");
  return g;
}

function eiffel() {
  const parts: THREE.BufferGeometry[] = [];
  const h = 0.86;
  for (const [sx, sz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as const) {
    const g = new THREE.BoxGeometry(0.05, h, 0.05);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + h / 2) / h;
      const k = 1 - t * 0.8;
      pos.setX(i, pos.getX(i) * 0.35 + sx * 0.2 * k);
      pos.setZ(i, pos.getZ(i) * 0.35 + sz * 0.2 * k);
    }
    g.translate(0, h / 2, 0);
    parts.push(g);
  }
  parts.push(box(0.22, 0.028, 0.22, 0, 0.3, 0), box(0.11, 0.022, 0.11, 0, 0.56, 0), cyl(0.008, 0.02, 0.28, 0, 0.7, 0, 5));
  return { stone: merged(parts) };
}

function pyramid() {
  return {
    stone: merged([
      cyl(0.012, 0.28, 0.36, -0.02, 0, 0.02, 4),
      cyl(0.01, 0.2, 0.28, 0.36, 0, 0.06, 4),
      cyl(0.008, 0.15, 0.2, -0.32, 0, 0.16, 4),
      box(0.26, 0.08, 0.1, 0.62, 0, 0.22),
      box(0.09, 0.1, 0.08, 0.76, 0.05, 0.22),
    ]),
  };
}

function taj() {
  return {
    stone: merged([
      box(0.78, 0.07, 0.78),
      box(0.34, 0.18, 0.34, 0, 0.07, 0),
      sph(0.16, 0, 0.4, 0, 1.2),
      cyl(0.015, 0.028, 0.14, 0, 0.5, 0, 6),
      cyl(0.02, 0.035, 0.46, 0.32, 0.07, 0.32, 6),
      cyl(0.02, 0.035, 0.46, -0.32, 0.07, 0.32, 6),
      cyl(0.02, 0.035, 0.46, 0.32, 0.07, -0.32, 6),
      cyl(0.02, 0.035, 0.46, -0.32, 0.07, -0.32, 6),
    ]),
  };
}

function liberty() {
  return {
    stone: merged([
      box(0.22, 0.08, 0.22),
      box(0.16, 0.1, 0.16, 0, 0.08, 0),
      cyl(0.045, 0.07, 0.28, 0, 0.18, 0, 8),
      sph(0.055, 0, 0.52, 0),
      box(0.02, 0.16, 0.02, 0.1, 0.34, 0),
      sph(0.03, 0.1, 0.54, 0, 1.3),
      cyl(0.004, 0.004, 0.08, -0.02, 0.56, 0, 4),
      cyl(0.004, 0.004, 0.07, 0.03, 0.57, 0, 4),
      cyl(0.004, 0.004, 0.07, 0, 0.58, 0.03, 4),
    ]),
  };
}

function colosseum() {
  const ring = new THREE.TorusGeometry(0.22, 0.07, 8, 18);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 0.1, 0);
  return { stone: merged([box(0.56, 0.04, 0.56), ring]) };
}

function opera() {
  return {
    stone: merged([
      box(0.55, 0.05, 0.32),
      sph(0.12, -0.16, 0.1, 0, 0.7),
      sph(0.16, 0.02, 0.12, 0, 0.62),
      sph(0.11, 0.18, 0.1, 0.02, 0.75),
    ]),
  };
}

function bridge() {
  return {
    stone: merged([
      box(0.7, 0.03, 0.08, 0, 0.16, 0),
      box(0.04, 0.32, 0.04, -0.22, 0, 0),
      box(0.04, 0.32, 0.04, 0.22, 0, 0),
      box(0.1, 0.02, 0.07, -0.22, 0.32, 0),
      box(0.1, 0.02, 0.07, 0.22, 0.32, 0),
      box(0.5, 0.012, 0.012, 0, 0.28, 0.03),
    ]),
  };
}

function fuji() {
  return {
    stone: merged([cyl(0.02, 0.34, 0.55, 0, 0, 0, 10)]),
    snow: merged([cyl(0.01, 0.12, 0.16, 0, 0.42, 0, 8)]),
  };
}

function wall() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.11;
    const z = Math.sin(i * 0.9) * 0.08;
    parts.push(box(0.1, 0.08 + (i % 2) * 0.03, 0.045, x, 0, z));
  }
  return { stone: merged(parts) };
}

function burj() {
  return {
    stone: merged([
      cyl(0.04, 0.07, 0.22, 0, 0, 0, 6),
      cyl(0.025, 0.04, 0.22, 0, 0.22, 0, 6),
      cyl(0.012, 0.025, 0.22, 0, 0.44, 0, 6),
      cyl(0.004, 0.01, 0.2, 0, 0.66, 0, 5),
    ]),
  };
}

function christ() {
  return {
    stone: merged([
      cyl(0.02, 0.16, 0.08, 0, 0, 0, 8),
      box(0.06, 0.22, 0.04, 0, 0.08, 0),
      box(0.2, 0.035, 0.035, 0, 0.24, 0),
      sph(0.035, 0, 0.34, 0),
    ]),
  };
}

function clock() {
  return {
    stone: merged([
      box(0.1, 0.42, 0.1),
      cyl(0.045, 0.045, 0.02, 0, 0.28, 0.05, 10),
      cyl(0.01, 0.06, 0.12, 0, 0.42, 0, 4),
    ]),
  };
}

function pisa() {
  const g = clock().stone;
  g.translate(0, -0.2, 0);
  g.rotateZ(0.22);
  g.translate(0, 0.2, 0);
  return { stone: g };
}

function moai() {
  return {
    stone: merged([
      box(0.16, 0.28, 0.1, 0, 0, 0),
      box(0.18, 0.08, 0.12, 0, 0.26, 0),
      box(0.04, 0.08, 0.04, 0, 0.16, 0.06),
    ]),
  };
}

function dome() {
  return {
    stone: merged([
      box(0.36, 0.1, 0.28),
      cyl(0.1, 0.12, 0.12, 0, 0.1, 0, 10),
      sph(0.11, 0, 0.28, 0, 0.85),
      cyl(0.015, 0.02, 0.22, 0.16, 0.1, 0.1, 5),
      cyl(0.015, 0.02, 0.22, -0.16, 0.1, 0.1, 5),
    ]),
  };
}

function twins() {
  return {
    stone: merged([
      cyl(0.02, 0.045, 0.55, -0.08, 0, 0, 6),
      cyl(0.02, 0.045, 0.55, 0.08, 0, 0, 6),
      box(0.16, 0.02, 0.03, 0, 0.34, 0),
      cyl(0.006, 0.012, 0.12, -0.08, 0.55, 0, 5),
      cyl(0.006, 0.012, 0.12, 0.08, 0.55, 0, 5),
    ]),
  };
}

function marina() {
  return {
    stone: merged([
      box(0.05, 0.4, 0.05, -0.14, 0, 0),
      box(0.05, 0.4, 0.05, 0, 0, 0),
      box(0.05, 0.4, 0.05, 0.14, 0, 0),
      box(0.42, 0.035, 0.1, 0, 0.4, 0),
    ]),
  };
}

function step() {
  return {
    stone: merged([
      box(0.42, 0.08, 0.42, 0, 0, 0),
      box(0.3, 0.08, 0.3, 0, 0.08, 0),
      box(0.2, 0.08, 0.2, 0, 0.16, 0),
      box(0.1, 0.08, 0.1, 0, 0.24, 0),
    ]),
  };
}

function henge() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    parts.push(box(0.035, 0.14, 0.03, Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16));
    if (i % 2 === 0) {
      const b = a + Math.PI / 8;
      parts.push(box(0.08, 0.025, 0.03, Math.cos(b) * 0.16, 0.14, Math.sin(b) * 0.16));
    }
  }
  return { stone: merged(parts) };
}

function monolith() {
  return { stone: merged([sph(0.22, 0, 0.08, 0, 0.45)]) };
}

function peaks() {
  return {
    stone: merged([
      cyl(0.02, 0.16, 0.36, 0, 0, 0, 6),
      cyl(0.015, 0.12, 0.26, 0.16, 0, 0.06, 6),
      cyl(0.012, 0.1, 0.2, -0.14, 0, 0.08, 6),
    ]),
    snow: merged([
      cyl(0.008, 0.05, 0.08, 0, 0.3, 0, 5),
      cyl(0.006, 0.035, 0.06, 0.16, 0.22, 0.06, 5),
    ]),
  };
}

function spire() {
  return {
    stone: merged([
      box(0.08, 0.08, 0.08),
      cyl(0.012, 0.04, 0.55, 0, 0.08, 0, 7),
      cyl(0.004, 0.01, 0.22, 0, 0.63, 0, 5),
    ]),
  };
}

function torii() {
  return {
    stone: merged([
      box(0.035, 0.28, 0.035, -0.1, 0, 0),
      box(0.035, 0.28, 0.035, 0.1, 0, 0),
      box(0.3, 0.03, 0.04, 0, 0.26, 0),
      box(0.26, 0.018, 0.03, 0, 0.22, 0),
    ]),
  };
}

function pagoda() {
  return {
    stone: merged([
      box(0.2, 0.08, 0.2),
      box(0.26, 0.025, 0.26, 0, 0.08, 0),
      box(0.14, 0.08, 0.14, 0, 0.105, 0),
      box(0.2, 0.02, 0.2, 0, 0.185, 0),
      box(0.08, 0.1, 0.08, 0, 0.205, 0),
      cyl(0.01, 0.02, 0.08, 0, 0.3, 0, 5),
    ]),
  };
}

function arch() {
  return {
    stone: merged([
      box(0.34, 0.28, 0.06),
      box(0.1, 0.16, 0.07, 0, 0, 0.01),
      box(0.16, 0.04, 0.07, 0, 0.22, 0),
    ]),
  };
}

function sign() {
  return {
    stone: merged([
      box(0.46, 0.08, 0.02, 0, 0.16, 0),
      box(0.02, 0.16, 0.02, -0.16, 0, 0),
      box(0.02, 0.16, 0.02, 0.16, 0, 0),
    ]),
  };
}

function rushmore() {
  return {
    stone: merged([
      box(0.42, 0.2, 0.16),
      sph(0.055, -0.12, 0.2, 0.06),
      sph(0.05, -0.02, 0.22, 0.07),
      sph(0.05, 0.08, 0.2, 0.06),
      sph(0.045, 0.16, 0.18, 0.05),
    ]),
  };
}

function falls() {
  return {
    stone: merged([box(0.28, 0.16, 0.12, 0, 0, -0.04), box(0.28, 0.05, 0.2, 0, 0, 0.08)]),
    snow: merged([box(0.16, 0.14, 0.02, 0, 0.01, 0.04)]),
  };
}

function buddha() {
  return {
    stone: merged([
      box(0.36, 0.05, 0.24),
      box(0.26, 0.07, 0.18, 0, 0.05, 0),
      sph(0.11, 0, 0.24, 0, 1.2),
      sph(0.06, 0, 0.38, 0.02),
      sph(0.022, 0, 0.45, 0.02),
    ]),
  };
}

function angkor() {
  const parts: THREE.BufferGeometry[] = [
    box(0.5, 0.05, 0.32),
    box(0.42, 0.035, 0.24, 0, 0.05, 0),
  ];
  const tower = (x: number, z: number, h: number) => {
    parts.push(box(0.08, h, 0.08, x, 0.085, z));
    parts.push(cyl(0.012, 0.05, h * 0.55, x, 0.085 + h, z, 5));
  };
  tower(0, 0, 0.32);
  tower(-0.14, 0.09, 0.18);
  tower(0.14, 0.09, 0.18);
  tower(-0.14, -0.09, 0.15);
  tower(0.14, -0.09, 0.15);
  return { stone: merged(parts) };
}

function palace() {
  return {
    stone: merged([
      box(0.5, 0.14, 0.18),
      box(0.18, 0.1, 0.18, 0, 0.14, 0),
      box(0.54, 0.028, 0.22, 0, 0.14, 0),
      cyl(0.028, 0.028, 0.1, -0.18, 0.14, 0, 6),
      cyl(0.028, 0.028, 0.1, 0.18, 0.14, 0, 6),
    ]),
  };
}

function cross() {
  return {
    stone: merged([
      cyl(0.09, 0.11, 0.04, 0, 0, 0, 8),
      box(0.028, 0.3, 0.028, 0, 0.04, 0),
      box(0.16, 0.028, 0.028, 0, 0.2, 0),
    ]),
  };
}

const BUILDERS: Record<ModelId, () => { stone: THREE.BufferGeometry; snow?: THREE.BufferGeometry }> = {
  eiffel,
  pyramid,
  taj,
  liberty,
  colosseum,
  opera,
  bridge,
  fuji,
  wall,
  burj,
  christ,
  clock,
  pisa,
  moai,
  dome,
  twins,
  marina,
  step,
  henge,
  monolith,
  peaks,
  spire,
  torii,
  pagoda,
  arch,
  sign,
  rushmore,
  falls,
  buddha,
  angkor,
  palace,
  cross,
};

const up = new THREE.Vector3();
const quat = new THREE.Quaternion();
const pos = new THREE.Vector3();
const scl = new THREE.Vector3();

function place(geo: THREE.BufferGeometry, wonder: Wonder) {
  latLngToVector3(wonder.lat, wonder.lng, GLOBE_R * 1.012, pos);
  up.copy(pos).normalize();
  alignUp(up, quat);
  scl.set(wonder.scale, wonder.scale, wonder.scale);
  geo.applyMatrix4(new THREE.Matrix4().compose(pos, quat, scl));
  return geo;
}

export function buildLandmarkGeometry() {
  const stone: THREE.BufferGeometry[] = [];
  const snow: THREE.BufferGeometry[] = [];
  for (const wonder of WONDERS) {
    const built = BUILDERS[wonder.model]();
    stone.push(place(built.stone, wonder));
    if (built.snow) snow.push(place(built.snow, wonder));
  }
  const stoneGeo = mergeGeometries(stone);
  const snowGeo = snow.length ? mergeGeometries(snow) : null;
  for (const g of stone) g.dispose();
  for (const g of snow) g.dispose();
  if (!stoneGeo) throw new Error("Could not place landmarks");
  return { stone: stoneGeo, snow: snowGeo };
}

export function exclamationMatrices() {
  const stem = new THREE.Matrix4();
  const dot = new THREE.Matrix4();
  const halo = new THREE.Matrix4();
  const stems: THREE.Matrix4[] = [];
  const dots: THREE.Matrix4[] = [];
  const halos: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (const wonder of WONDERS) {
    latLngToVector3(wonder.lat, wonder.lng, GLOBE_R + 0.085, p);
    n.copy(p).normalize();
    alignUp(n, q);
    stem.compose(p, q, scl.set(1, 1, 1));
    const top = p.clone().addScaledVector(n, 0.034);
    dot.compose(top, q, scl.set(1, 1, 1));
    halo.compose(top, q, scl.set(2.4, 2.4, 2.4));
    stems.push(stem.clone());
    dots.push(dot.clone());
    halos.push(halo.clone());
  }
  return { stems, dots, halos };
}
