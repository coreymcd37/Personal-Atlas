import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  GLOBE_R,
  alignUp,
  latLngToThetaPhi,
  latLngToVector3,
  lerpAngle,
  publicUrl,
  vectorToLatLng,
} from "@/lib/globe-math";
import { cloudTexture, paintNight, type Country, type WorldData } from "@/lib/world";
import { buildFootsteps, buildJumpLines } from "@/data/footprints";
import { COUNTRIES, LIVED, WONDERS, type Selection } from "@/data/places";
import { buildLandmarkGeometry } from "@/components/globe/landmarks";
import { pickAt } from "@/lib/pick";

const UP = new THREE.Vector3(0, 1, 0);
const MIN_R = 2.32;
const MAX_R = 11;

function pxToWorld(camera: THREE.PerspectiveCamera, distance: number, pixels: number, viewportHeight: number) {
  const fov = (camera.fov * Math.PI) / 180;
  return (pixels / Math.max(1, viewportHeight)) * 2 * Math.tan(fov / 2) * Math.max(0.2, distance);
}
const HOME = { lat: 36, lng: -106, distance: 7.35 };

function footprintGeometry() {
  const oval = (rx: number, ry: number, x: number, y: number) => {
    const shape = new THREE.Shape();
    shape.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, 0);
    return new THREE.ShapeGeometry(shape, 14);
  };
  const geo = mergeGeometries([
    oval(0.15, 0.2, 0, -0.26),
    oval(0.17, 0.22, 0.02, 0.06),
    oval(0.085, 0.1, 0.15, 0.36),
    oval(0.052, 0.072, 0.03, 0.42),
    oval(0.046, 0.064, -0.05, 0.4),
    oval(0.04, 0.055, -0.11, 0.34),
    oval(0.034, 0.046, -0.15, 0.26),
  ]);
  if (!geo) throw new Error("footprint");
  geo.scale(0.02, 0.02, 1);
  geo.rotateX(Math.PI / 2);
  return geo;
}

function Atmosphere({ night }: { night: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: night
          ? `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fres = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.4);
            vec3 glow = vec3(1.0, 0.72, 0.38);
            gl_FragColor = vec4(glow, fres * 0.42);
          }
        `
          : `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fres = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.8);
            gl_FragColor = vec4(0.25, 0.62, 0.98, fres * 0.95);
          }
        `,
      }),
    [night],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh scale={1.11}>
      <sphereGeometry args={[GLOBE_R, 64, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Earth({
  world,
  map,
  night,
  bump,
}: {
  world: WorldData;
  map: THREE.Texture;
  night?: boolean;
  bump?: THREE.Texture;
}) {
  const borders = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(world.borders, 3));
    return geo;
  }, [world]);
  const graticule = useMemo(() => {
    const pts: number[] = [];
    const v = new THREE.Vector3();
    const push = (lat: number, lng: number) => {
      latLngToVector3(lat, lng, 1, v);
      pts.push(v.x, v.y, v.z);
    };
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += 4) {
        push(lat, lng);
        push(lat, lng + 4);
      }
    }
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -80; lat < 80; lat += 4) {
        push(lat, lng);
        push(lat + 4, lng);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);
  useEffect(
    () => () => {
      borders.dispose();
      graticule.dispose();
    },
    [borders, graticule],
  );

  const material = useMemo(() => {
    if (night || !bump) return new THREE.MeshBasicMaterial({ map });
    const relief = new THREE.MeshStandardMaterial({
      map,
      bumpMap: bump,
      bumpScale: 0.085,
      roughness: 0.78,
      metalness: 0.03,
    });
    relief.onBeforeCompile = (shader) => {
      shader.uniforms.uDetail = { value: 0 };
      relief.userData.shader = shader;
      shader.fragmentShader =
        `
        uniform float uDetail;
        float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float nse(vec2 p){
          vec2 i=floor(p); vec2 f=fract(p);
          float a=hsh(i); float b=hsh(i+vec2(1.0,0.0));
          float c=hsh(i+vec2(0.0,1.0)); float d=hsh(i+vec2(1.0,1.0));
          vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }
        float fbm(vec2 p){
          float v=0.0; float a=0.5;
          for(int i=0;i<3;i++){ v+=a*nse(p); p=p*2.13+1.7; a*=0.5; }
          return v;
        }
      ` +
        shader.fragmentShader
          .replace(
            "#include <roughnessmap_fragment>",
            `#include <roughnessmap_fragment>
            float landMask = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            roughnessFactor = mix(0.22, 0.92, landMask);`,
          )
          .replace(
            "#include <normal_fragment_maps>",
            `#include <normal_fragment_maps>
            float landN = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            vec2 uvD = vMapUv * vec2(280.0, 140.0);
            float e = 0.0032;
            float h0 = fbm(uvD);
            float hx = fbm(uvD + vec2(e, 0.0));
            float hy = fbm(uvD + vec2(0.0, e));
            vec3 nFine = normalize(vec3((h0 - hx) * 9.0, (h0 - hy) * 9.0, 1.0));
            normal = normalize(mix(normal, nFine, uDetail * landN * 0.78));`,
          )
          .replace(
            "#include <color_fragment>",
            `#include <color_fragment>
            float landC = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            float ridge = fbm(vMapUv * vec2(280.0, 140.0));
            diffuseColor.rgb += (ridge - 0.48) * uDetail * landC * vec3(0.11, 0.09, 0.045);`,
          );
    };
    return relief;
  }, [bump, map, night]);

  useFrame(({ camera }) => {
    const shader = material.userData.shader as { uniforms: { uDetail: { value: number } } } | undefined;
    if (!shader) return;
    shader.uniforms.uDetail.value = THREE.MathUtils.smoothstep(4.8, 2.7, camera.position.length());
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      <mesh material={material}>
        <sphereGeometry args={[GLOBE_R, 128, 96]} />
      </mesh>
      <lineSegments geometry={borders} scale={GLOBE_R * 1.003}>
        <lineBasicMaterial color={night ? "#1c2834" : "#16324a"} transparent opacity={night ? 0.35 : 0.42} />
      </lineSegments>
      <lineSegments geometry={borders} scale={GLOBE_R * 1.006}>
        <lineBasicMaterial color={night ? "#8fd0ff" : "#f4fbff"} transparent opacity={night ? 0.16 : 0.55} />
      </lineSegments>
      {night ? null : (
        <lineSegments geometry={graticule} scale={GLOBE_R * 1.002}>
          <lineBasicMaterial color="#d5e6f4" transparent opacity={0.14} />
        </lineSegments>
      )}
    </group>
  );
}

function NightEarth({ world }: { world: WorldData }) {
  const map = useMemo(() => paintNight(world), [world]);
  useEffect(() => () => map.dispose(), [map]);
  return <Earth world={world} map={map} night />;
}

function DayEarth({ world }: { world: WorldData }) {
  const gl = useThree((state) => state.gl);
  const map = useLoader(THREE.TextureLoader, publicUrl("/geo/earth-day.jpg"));
  const bump = useLoader(THREE.TextureLoader, publicUrl("/geo/earth-bump.png"));
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = gl.capabilities.getMaxAnisotropy();
    map.minFilter = THREE.LinearMipmapLinearFilter;
    bump.colorSpace = THREE.NoColorSpace;
    bump.anisotropy = 8;
    map.needsUpdate = true;
    bump.needsUpdate = true;
  }, [bump, gl, map]);
  return <Earth world={world} map={map} bump={bump} />;
}

function Clouds({ night }: { night?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => cloudTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.05) * 0.015;
  });
  return (
    <mesh ref={ref} scale={1.02}>
      <sphereGeometry args={[GLOBE_R, 48, 32]} />
      <meshBasicMaterial map={tex} transparent opacity={night ? 0.05 : 0.22} depthWrite={false} color={night ? "#9bb0c4" : "#ffffff"} />
    </mesh>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      const theta = rand(i + 1) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 19) - 1);
      const r = 38;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#f7f4ea" size={0.055} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            vec3 zenith = vec3(0.28, 0.58, 0.9);
            vec3 mid = vec3(0.1, 0.4, 0.74);
            vec3 deep = vec3(0.04, 0.22, 0.52);
            vec3 col = mix(deep, mid, smoothstep(-0.8, 0.15, h));
            col = mix(col, zenith, smoothstep(0.05, 0.85, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh scale={46} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Jumps() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(buildJumpLines(), 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#f6e7c8" transparent opacity={0.7} />
    </lineSegments>
  );
}

function CountryMarks({ countries }: { countries: Country[] }) {
  const core = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    countries.forEach((country, index) => {
      latLngToVector3(country.lat, country.lng, GLOBE_R * 1.01, dummy.position);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      core.current?.setMatrixAt(index, dummy.matrix);
      dummy.scale.setScalar(2.3);
      dummy.updateMatrix();
      glow.current?.setMatrixAt(index, dummy.matrix);
    });
    if (core.current) core.current.instanceMatrix.needsUpdate = true;
    if (glow.current) glow.current.instanceMatrix.needsUpdate = true;
  }, [countries]);
  return (
    <group>
      <instancedMesh ref={glow} args={[undefined, undefined, countries.length]} frustumCulled={false}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#9ec3dc" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={core} args={[undefined, undefined, countries.length]} frustumCulled={false}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#f4f8fb" />
      </instancedMesh>
    </group>
  );
}

function Footprints() {
  const poses = useMemo(() => {
    const steps = buildFootsteps();
    const n = new THREE.Vector3();
    const next = new THREE.Vector3();
    const travel = new THREE.Vector3();
    const side = new THREE.Vector3();
    const local = new THREE.Vector3();
    const qAlign = new THREE.Quaternion();
    const qYaw = new THREE.Quaternion();
    const list: { position: THREE.Vector3; quaternion: THREE.Quaternion; side: THREE.Vector3; mirror: number }[] = [];
    for (let i = 0; i < steps.length; i++) {
      const cur = steps[i];
      const toward = steps[i < steps.length - 1 ? i + 1 : i - 1] ?? cur;
      latLngToVector3(cur.lat, cur.lng, 1, n).normalize();
      latLngToVector3(toward.lat, toward.lng, 1, next).normalize();
      travel.copy(next).sub(n);
      travel.addScaledVector(n, -travel.dot(n));
      if (travel.lengthSq() < 1e-8) travel.set(0, 0, 1);
      else travel.normalize();
      alignUp(n, qAlign);
      local.copy(travel).applyQuaternion(qAlign.clone().invert());
      qYaw.setFromAxisAngle(UP, Math.atan2(local.x, local.z));
      const position = latLngToVector3(cur.lat, cur.lng, GLOBE_R * 1.006, new THREE.Vector3());
      list.push({
        position,
        quaternion: qAlign.clone().multiply(qYaw),
        side: new THREE.Vector3().crossVectors(n, travel).normalize(),
        mirror: cur.left ? -1 : 1,
      });
    }
    return list;
  }, []);
  const geo = useMemo(() => footprintGeometry(), []);
  const glowGeo = useMemo(() => geo.clone(), [geo]);
  const base = useMemo(() => {
    geo.computeBoundingBox();
    const size = geo.boundingBox?.getSize(new THREE.Vector3()) ?? new THREE.Vector3(0.02, 0.02, 0.02);
    return Math.max(size.x, size.z, 0.001);
  }, [geo]);
  const core = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => () => {
    geo.dispose();
    glowGeo.dispose();
  }, [geo, glowGeo]);
  useFrame(({ camera, size }) => {
    const mesh = core.current;
    const glow = halo.current;
    if (!mesh || !glow) return;
    const persp = camera as THREE.PerspectiveCamera;
    for (let i = 0; i < poses.length; i++) {
      const pose = poses[i];
      const dist = persp.position.distanceTo(pose.position);
      const world = pxToWorld(persp, dist, 18, size.height);
      const s = world / base;
      dummy.position.copy(pose.position).addScaledVector(pose.side, pose.mirror * world * 0.42);
      dummy.quaternion.copy(pose.quaternion);
      dummy.scale.set(pose.mirror * s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      dummy.scale.set(pose.mirror * s * 1.22, s, s * 1.22);
      dummy.updateMatrix();
      glow.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={halo} args={[glowGeo, undefined, poses.length]} frustumCulled={false}>
        <meshBasicMaterial color="#d9cbb6" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} />
      </instancedMesh>
      <instancedMesh ref={core} args={[geo, undefined, poses.length]} frustumCulled={false}>
        <meshBasicMaterial color="#f7f3ec" side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-3} />
      </instancedMesh>
    </group>
  );
}

function Landmarks({ night }: { night?: boolean }) {
  const geos = useMemo(() => buildLandmarkGeometry(), []);
  useEffect(
    () => () => {
      geos.stone.dispose();
      geos.snow?.dispose();
    },
    [geos],
  );
  return (
    <group>
      <mesh geometry={geos.stone}>
        <meshStandardMaterial
          color={night ? "#2a241c" : "#f4efe6"}
          roughness={0.42}
          metalness={0.04}
          emissive={night ? "#ffd7a1" : "#4a4036"}
          emissiveIntensity={night ? 0.55 : 0.28}
        />
      </mesh>
      {geos.snow ? (
        <mesh geometry={geos.snow}>
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.02} emissive="#f7f4ee" emissiveIntensity={0.2} />
        </mesh>
      ) : null}
    </group>
  );
}

function LivedBeacons() {
  const group = useRef<THREE.Group>(null);
  const ring = useMemo(() => {
    const g = new THREE.TorusGeometry(0.05, 0.0032, 8, 36);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => ring.dispose(), [ring]);
  useFrame(({ camera, clock, size }) => {
    const t = clock.elapsedTime;
    const persp = camera as THREE.PerspectiveCamera;
    group.current?.children.forEach((child, index) => {
      const pulse = 1 + Math.sin(t * 1.7 + index) * 0.07;
      const dist = persp.position.distanceTo(child.position);
      const s = (pxToWorld(persp, dist, 22, size.height) / 0.1) * pulse;
      child.scale.setScalar(s);
    });
  });
  return (
    <group ref={group}>
      {LIVED.map((place) => {
        const position = latLngToVector3(place.lat, place.lng, GLOBE_R * 1.004, new THREE.Vector3());
        const quaternion = alignUp(position.clone().normalize(), new THREE.Quaternion());
        return (
          <group key={place.id} position={position} quaternion={quaternion}>
            <mesh geometry={ring}>
              <meshBasicMaterial color="#f3f7fb" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FocusRing({ selection }: { selection: Selection | null }) {
  const mesh = useRef<THREE.Mesh>(null);
  const sel = useRef(selection);
  sel.current = selection;
  const geo = useMemo(() => {
    const g = new THREE.TorusGeometry(0.07, 0.003, 8, 48);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ camera, clock, size }) => {
    const m = mesh.current;
    const current = sel.current;
    if (!m) return;
    if (!current) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const p = latLngToVector3(current.lat, current.lng, GLOBE_R * 1.008, _p);
    m.position.copy(p);
    m.quaternion.copy(alignUp(_n.copy(p).normalize(), _q));
    const persp = camera as THREE.PerspectiveCamera;
    const dist = persp.position.distanceTo(p);
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.05;
    m.scale.setScalar((pxToWorld(persp, dist, 42, size.height) / 0.14) * pulse);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.color.set(current.kind === "trail" ? "#3c92d8" : "#f4f8fb");
  });
  return (
    <mesh ref={mesh} geometry={geo} visible={false}>
      <meshBasicMaterial color="#f4f8fb" transparent opacity={0.95} />
    </mesh>
  );
}

const _p = new THREE.Vector3();
const _n = new THREE.Vector3();
const _q = new THREE.Quaternion();

function makeLabelTexture(text: string) {
  const canvas = document.createElement("canvas");
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("label");
  probe.font = '600 64px Georgia, "Liberation Serif", serif';
  const textW = Math.ceil(probe.measureText(text).width);
  canvas.width = textW + 48;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("label");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 64px Georgia, "Liberation Serif", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(8, 16, 28, 0.72)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(244, 248, 252, 0.98)";
  ctx.fillText(text, canvas.width / 2, 50);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return { tex, aspect: canvas.width / canvas.height };
}

function Labels({ selectedId }: { selectedId?: string }) {
  const group = useRef<THREE.Group>(null);
  const sprites = useRef(new Map<string, THREE.Sprite>());
  const textures = useRef(new Map<string, { tex: THREE.CanvasTexture; aspect: number }>());
  const acc = useRef(5);
  const sig = useRef("");
  useEffect(
    () => () => {
      textures.current.forEach((entry) => entry.tex.dispose());
      textures.current.clear();
    },
    [],
  );
  useFrame(({ camera, size }) => {
    const parent = group.current;
    if (!parent) return;
    const persp = camera as THREE.PerspectiveCamera;
    acc.current += 1;
    if (acc.current >= 6) {
      acc.current = 0;
      const radius = camera.position.length();
      const camN = _n.copy(camera.position).normalize();
      const close = radius < 3.6;
      type Item = { key: string; name: string; lat: number; lng: number; score: number };
      const items: Item[] = [];
      for (const place of COUNTRIES) {
        const facing = latLngToVector3(place.lat, place.lng, 1, _p).dot(camN);
        if (facing < 0.2 && place.id !== selectedId) continue;
        items.push({
          key: place.id,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          score: facing * 3 + (place.id === selectedId ? 8 : 0),
        });
      }
      if (close) {
        for (const wonder of WONDERS) {
          const facing = latLngToVector3(wonder.lat, wonder.lng, 1, _p).dot(camN);
          if (facing < 0.55 && selectedId !== `wonder-${wonder.id}`) continue;
          items.push({
            key: `w-${wonder.id}`,
            name: wonder.name,
            lat: wonder.lat,
            lng: wonder.lng,
            score: facing * 0.7 + (selectedId === `wonder-${wonder.id}` ? 8 : 0),
          });
        }
      }
      items.sort((a, b) => b.score - a.score);
      const accepted: Item[] = [];
      const sep = close ? 0.12 : 0.2;
      const limit = close ? 8 : 5;
      for (const item of items) {
        latLngToVector3(item.lat, item.lng, GLOBE_R, _p);
        const projected = _p.clone().project(camera);
        if (projected.z > 1) continue;
        if (accepted.some((other) => {
          latLngToVector3(other.lat, other.lng, GLOBE_R, _v2);
          const o = _v2.project(camera);
          return Math.hypot(o.x - projected.x, o.y - projected.y) < sep;
        })) continue;
        accepted.push(item);
        if (accepted.length >= limit) break;
      }
      const nextSig = accepted.map((item) => item.key).join("|");
      if (nextSig !== sig.current) {
        sig.current = nextSig;
        const keep = new Set(accepted.map((item) => item.key));
        for (const [key, sprite] of sprites.current) {
          if (!keep.has(key)) {
            parent.remove(sprite);
            sprites.current.delete(key);
          }
        }
        for (const item of accepted) {
          let sprite = sprites.current.get(item.key);
          if (!sprite) {
            let cached = textures.current.get(item.name);
            if (!cached) {
              cached = makeLabelTexture(item.name);
              textures.current.set(item.name, cached);
            }
            const material = new THREE.SpriteMaterial({
              map: cached.tex,
              transparent: true,
              depthWrite: false,
              depthTest: false,
            });
            sprite = new THREE.Sprite(material);
            sprite.renderOrder = 3;
            sprite.userData.aspect = cached.aspect;
            sprites.current.set(item.key, sprite);
            parent.add(sprite);
          }
          const base = latLngToVector3(item.lat, item.lng, GLOBE_R * 1.012, new THREE.Vector3());
          sprite.userData.base = base;
          sprite.userData.normal = base.clone().normalize();
        }
      }
    }
    for (const sprite of sprites.current.values()) {
      const base = sprite.userData.base as THREE.Vector3 | undefined;
      const normal = sprite.userData.normal as THREE.Vector3 | undefined;
      const aspect = (sprite.userData.aspect as number) || 4;
      if (!base || !normal) continue;
      const dist = persp.position.distanceTo(base);
      const h = pxToWorld(persp, dist, 26, size.height);
      sprite.scale.set(h * aspect, h, 1);
      sprite.position.copy(base).addScaledVector(normal, pxToWorld(persp, dist, 16, size.height));
    }
  });
  return <group ref={group} />;
}

const _v2 = new THREE.Vector3();

function CameraRig({
  world,
  focus,
  spin,
  reduced,
  onPick,
  onHover,
}: {
  world: WorldData;
  focus: { lat: number; lng: number; distance: number; nonce: number };
  spin: boolean;
  reduced: boolean;
  onPick: (selection: Selection | null, point?: { x: number; y: number }) => void;
  onHover: (hover: { name: string; kind: string; x: number; y: number } | null) => void;
}) {
  const { camera, gl } = useThree();
  const home = latLngToThetaPhi(HOME.lat, HOME.lng);
  const sph = useRef({ theta: home.theta, phi: home.phi, radius: HOME.distance });
  const tween = useRef<{
    fromT: number;
    fromP: number;
    fromR: number;
    toT: number;
    toP: number;
    toR: number;
    t0: number;
    dur: number;
  } | null>(null);
  const idle = useRef(performance.now());
  const dragging = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const moved = useRef(0);
  const vel = useRef({ theta: 0, phi: 0 });
  const earth = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (focus.nonce === 0) return;
    const to = latLngToThetaPhi(focus.lat, focus.lng);
    const s = sph.current;
    tween.current = {
      fromT: s.theta,
      fromP: s.phi,
      fromR: s.radius,
      toT: to.theta,
      toP: to.phi,
      toR: focus.distance,
      t0: performance.now(),
      dur: reduced ? 220 : 1100,
    };
    idle.current = performance.now();
  }, [focus.nonce, focus.lat, focus.lng, focus.distance, reduced]);

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const readAt = (clientX: number, clientY: number) => {
      if (!earth.current) return null;
      const rect = el.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(earth.current, false);
      if (!hits[0]) return null;
      return vectorToLatLng(hits[0].point);
    };
    const read = (event: PointerEvent) => readAt(event.clientX, event.clientY);

    let lastTap = 0;
    let lastX = 0;
    let lastY = 0;
    let pending = 0;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      window.clearTimeout(pending);
      vel.current.theta = 0;
      vel.current.phi = 0;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size === 2) {
        const pts = [...pointers.current.values()];
        pinch.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        dragging.current = false;
        return;
      }
      dragging.current = true;
      moved.current = 0;
      tween.current = null;
      idle.current = performance.now();
      el.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      const prev = pointers.current.get(event.pointerId);
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size >= 2 && pinch.current) {
        const pts = [...pointers.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = dist / pinch.current;
        sph.current.radius = THREE.MathUtils.clamp(sph.current.radius / ratio, MIN_R, MAX_R);
        pinch.current = dist;
        tween.current = null;
        idle.current = performance.now();
        return;
      }
      if (!dragging.current || !prev) {
        const ll = read(event);
        if (!ll) {
          onHover(null);
          return;
        }
        const sel = pickAt(ll.lat, ll.lng, sph.current.radius, world.countries);
        onHover(sel ? { name: sel.name, kind: sel.kind, x: event.clientX, y: event.clientY } : null);
        return;
      }
      const dx = event.clientX - prev.x;
      const dy = event.clientY - prev.y;
      moved.current += Math.abs(dx) + Math.abs(dy);
      const s = sph.current;
      const k = 0.0031 * (s.radius / 6.2);
      s.theta -= dx * k;
      s.phi = THREE.MathUtils.clamp(s.phi - dy * k, 0.18, Math.PI - 0.18);
      vel.current.theta = -dx * k;
      vel.current.phi = -dy * k;
      idle.current = performance.now();
    };
    const onUp = (event: PointerEvent) => {
      const wasDrag = moved.current > 7;
      pointers.current.delete(event.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      dragging.current = pointers.current.size > 0;
      idle.current = performance.now();
      if (wasDrag) return;
      const ll = read(event);
      if (!ll) return;
      const now = performance.now();
      const quick = now - lastTap < 320 && Math.hypot(event.clientX - lastX, event.clientY - lastY) < 28;
      lastTap = now;
      lastX = event.clientX;
      lastY = event.clientY;
      if (quick) {
        window.clearTimeout(pending);
        vel.current.theta = 0;
        vel.current.phi = 0;
        const to = latLngToThetaPhi(ll.lat, ll.lng);
        const s = sph.current;
        const zoomIn = s.radius > 3.5;
        tween.current = {
          fromT: s.theta,
          fromP: s.phi,
          fromR: s.radius,
          toT: to.theta,
          toP: to.phi,
          toR: zoomIn ? Math.max(MIN_R, s.radius * 0.62) : Math.max(MIN_R, s.radius * 0.72),
          t0: now,
          dur: reduced ? 180 : 680,
        };
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      pending = window.setTimeout(() => {
        onPick(pickAt(ll.lat, ll.lng, sph.current.radius, world.countries), point);
      }, 280);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      tween.current = null;
      vel.current.theta = 0;
      vel.current.phi = 0;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      const dy = THREE.MathUtils.clamp(event.deltaY * unit, -90, 90);
      const s = sph.current;
      const ll = readAt(event.clientX, event.clientY);
      if (ll && dy < 0) {
        const to = latLngToThetaPhi(ll.lat, ll.lng);
        const pull = Math.min(0.16, Math.abs(dy) / 520);
        s.theta = lerpAngle(s.theta, to.theta, pull);
        s.phi = THREE.MathUtils.lerp(s.phi, to.phi, pull);
      }
      s.radius = THREE.MathUtils.clamp(s.radius * Math.exp(dy * 0.0016), MIN_R, MAX_R);
      idle.current = performance.now();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(pending);
    };
  }, [camera, gl, onHover, onPick, reduced, world.countries]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const s = sph.current;
    const twn = tween.current;
    if (twn) {
      const t = Math.min(1, (performance.now() - twn.t0) / twn.dur);
      const k = t * t * (3 - 2 * t);
      s.theta = lerpAngle(twn.fromT, twn.toT, k);
      s.phi = twn.fromP + (twn.toP - twn.fromP) * k;
      s.radius = twn.fromR + (twn.toR - twn.fromR) * k;
      if (t >= 1) tween.current = null;
      vel.current.theta = 0;
      vel.current.phi = 0;
    } else if (!dragging.current) {
      const v = vel.current;
      if (Math.abs(v.theta) > 0.00002 || Math.abs(v.phi) > 0.00002) {
        s.theta += v.theta;
        s.phi = THREE.MathUtils.clamp(s.phi + v.phi, 0.18, Math.PI - 0.18);
        v.theta *= 0.9;
        v.phi *= 0.9;
      } else if (spin && performance.now() - idle.current > 4200) {
        s.theta += d * 0.045;
      }
    }
    const r = s.radius;
    camera.position.set(
      -r * Math.sin(s.phi) * Math.cos(s.theta),
      r * Math.cos(s.phi),
      r * Math.sin(s.phi) * Math.sin(s.theta),
    );
    camera.lookAt(0, 0, 0);
  });

  return (
    <mesh ref={earth}>
      <sphereGeometry args={[GLOBE_R, 64, 48]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export function GlobeScene({
  world,
  focus,
  selection,
  spin,
  reduced,
  night,
  onPick,
  onHover,
}: {
  world: WorldData;
  focus: { lat: number; lng: number; distance: number; nonce: number };
  selection: Selection | null;
  spin: boolean;
  reduced: boolean;
  night: boolean;
  onPick: (selection: Selection | null, point?: { x: number; y: number }) => void;
  onHover: (hover: { name: string; kind: string; x: number; y: number } | null) => void;
}) {
  return (
    <>
      <color attach="background" args={[night ? "#03050a" : "#5eace8"]} />
      {night ? (
        <>
          <ambientLight intensity={0.05} color="#141820" />
          <hemisphereLight args={["#ffc98a", "#05070c", 0.16]} />
          <Stars />
        </>
      ) : (
        <>
          <ambientLight intensity={0.72} color="#fff6ee" />
          <hemisphereLight args={["#fff4e4", "#2a5f96", 0.38]} />
          <directionalLight position={[5.5, 2.4, 3.2]} intensity={1.25} color="#fff8ee" />
          <Sky />
        </>
      )}
      <Suspense fallback={null}>
        {night ? <NightEarth world={world} /> : <DayEarth world={world} />}
      </Suspense>
      <Clouds night={night} />
      <Jumps />
      <Footprints />
      <Landmarks night={night} />
      <LivedBeacons />
      <FocusRing selection={selection} />
      <Labels selectedId={selection?.id} />
      <Atmosphere night={night} />
      <CameraRig
        world={world}
        focus={focus}
        spin={spin}
        reduced={reduced}
        onPick={onPick}
        onHover={onHover}
      />
    </>
  );
}
