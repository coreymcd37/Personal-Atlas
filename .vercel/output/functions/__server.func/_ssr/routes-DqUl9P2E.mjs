import { i as __toESM } from "../_runtime.mjs";
import { C as SphereGeometry, D as TorusGeometry, E as TextureLoader, M as require_react, O as Vector2, S as ShapeGeometry, T as SpriteMaterial, _ as Quaternion, a as BoxGeometry, b as ShaderMaterial, c as CanvasTexture, d as LinearMipmapLinearFilter, f as MathUtils, g as Object3D, h as MeshStandardMaterial, i as useThree, j as require_jsx_runtime, k as Vector3, l as CylinderGeometry, m as MeshBasicMaterial, n as useFrame, o as BufferAttribute, p as Matrix4, r as useLoader, s as BufferGeometry, t as Canvas, u as Float32BufferAttribute, v as Raycaster, w as Sprite, x as Shape, y as SRGBColorSpace } from "../_libs/@react-three/fiber+[...].mjs";
import { a as RotateCcw, c as KeyRound, i as Search, l as ChevronUp, n as Sun, o as Play, r as Square, s as Moon, u as ChevronDown } from "../_libs/lucide-react.mjs";
import { t as mergeGeometries } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DqUl9P2E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEG = Math.PI / 180;
var RAD = 180 / Math.PI;
var tmp = new Vector3();
function latLngToVector3(lat, lng, radius = 2, target = tmp) {
	const phi = (90 - lat) * DEG;
	const theta = (lng + 180) * DEG;
	const sinPhi = Math.sin(phi);
	return target.set(-radius * sinPhi * Math.cos(theta), radius * Math.cos(phi), radius * sinPhi * Math.sin(theta));
}
function vectorToLatLng(v) {
	const n = tmp.copy(v).normalize();
	const lat = 90 - Math.acos(MathUtils.clamp(n.y, -1, 1)) * RAD;
	let lng = Math.atan2(n.z, -n.x) * RAD - 180;
	if (lng > 180) lng -= 360;
	if (lng < -180) lng += 360;
	return {
		lat,
		lng
	};
}
function latLngToThetaPhi(lat, lng) {
	return {
		phi: (90 - lat) * DEG,
		theta: (lng + 180) * DEG
	};
}
function angularDistance(lat1, lng1, lat2, lng2) {
	const p1 = lat1 * DEG;
	const p2 = lat2 * DEG;
	const dp = (lat2 - lat1) * DEG;
	const dl = (lng2 - lng1) * DEG;
	const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
	return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2 * RAD;
}
function lerpAngle(a, b, t) {
	let d = b - a;
	while (d > Math.PI) d -= Math.PI * 2;
	while (d < -Math.PI) d += Math.PI * 2;
	return a + d * t;
}
function slerpVectors(a, b, t, target) {
	const dot = MathUtils.clamp(a.dot(b), -1, 1);
	const omega = Math.acos(dot);
	if (omega < 1e-4) return target.copy(a);
	const s = Math.sin(omega);
	return target.copy(a).multiplyScalar(Math.sin((1 - t) * omega) / s).addScaledVector(b, Math.sin(t * omega) / s);
}
function alignUp(normal, target) {
	return target.setFromUnitVectors(_up, normal);
}
var _up = new Vector3(0, 1, 0);
function publicUrl(path) {
	if (typeof window === "undefined") return path;
	const host = window.location.hostname.toLowerCase();
	if (!(host === "preview.grok.genai.mil" || host === "preview.grok.mil" || host === "preview.grokgsac.com")) return path;
	return `${/^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i.exec(window.location.pathname)?.[0] ?? ""}${path}`;
}
var HIDE_MARKER = /* @__PURE__ */ new Set([
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
	"Montserrat"
]);
function circleRing(lng, lat) {
	const ring = [];
	for (let k = 0; k <= 12; k++) {
		const a = k / 12 * Math.PI * 2;
		ring.push([lng + Math.cos(a) * .28, lat + Math.sin(a) * .2]);
	}
	return ring;
}
function hasArea(polys) {
	for (const poly of polys) for (const ring of poly) if (ring.length > 3) return true;
	return false;
}
function buildWorld(raw) {
	const countries = [];
	const paintPolys = [];
	const paintCountries = [];
	const positions = [];
	const v = new Vector3();
	raw.countries.forEach((c, index) => {
		let polys = raw.polys[index] ?? [];
		if (!hasArea(polys)) polys = [[circleRing(c.lng, c.lat)]];
		const country = {
			id: c.id,
			name: c.name,
			lat: c.lat,
			lng: c.lng,
			continent: c.continent,
			pop: c.pop
		};
		paintCountries.push(country);
		paintPolys.push(polys);
		for (const poly of polys) for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
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
			if (dx * dx + dy * dy + dz * dz > .08) continue;
			positions.push(ax, ay, az, v.x, v.y, v.z);
		}
		if (!HIDE_MARKER.has(c.name)) countries.push(country);
	});
	return {
		countries,
		borders: new Float32Array(positions),
		paint: {
			countries: paintCountries,
			polys: paintPolys
		}
	};
}
function traceRing(ctx, ring, w, h) {
	let prev = ring[0]?.[0] ?? 0;
	for (let i = 0; i < ring.length; i++) {
		const lng = ring[i][0];
		const lat = ring[i][1];
		const x = (lng + 180) / 360 * w;
		const y = (90 - lat) / 180 * h;
		if (i === 0 || Math.abs(lng - prev) > 35) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
		prev = lng;
	}
}
var CITIES = [
	[
		40.7,
		-74,
		1.4
	],
	[
		34.05,
		-118.24,
		1.3
	],
	[
		41.88,
		-87.63,
		1.1
	],
	[
		29.76,
		-95.37,
		.9
	],
	[
		33.45,
		-112.07,
		.7
	],
	[
		37.77,
		-122.42,
		.9
	],
	[
		25.76,
		-80.19,
		.8
	],
	[
		47.6,
		-122.33,
		.7
	],
	[
		19.43,
		-99.13,
		1.3
	],
	[
		23.13,
		-82.38,
		.6
	],
	[
		-23.55,
		-46.63,
		1.3
	],
	[
		-34.6,
		-58.38,
		1
	],
	[
		-22.9,
		-43.2,
		.9
	],
	[
		4.7,
		-74.07,
		.8
	],
	[
		-12.05,
		-77.04,
		.7
	],
	[
		-33.45,
		-70.66,
		.6
	],
	[
		51.5,
		-.12,
		1.4
	],
	[
		48.86,
		2.35,
		1.2
	],
	[
		52.52,
		13.4,
		.9
	],
	[
		41.9,
		12.5,
		.8
	],
	[
		40.42,
		-3.7,
		1
	],
	[
		55.75,
		37.62,
		1.3
	],
	[
		59.93,
		30.34,
		.8
	],
	[
		50.45,
		30.52,
		.8
	],
	[
		41.01,
		28.97,
		1.1
	],
	[
		30.04,
		31.24,
		1.2
	],
	[
		33.57,
		-7.59,
		.7
	],
	[
		36.75,
		3.06,
		.6
	],
	[
		6.52,
		3.38,
		1.2
	],
	[
		5.6,
		-.19,
		.6
	],
	[
		-1.29,
		36.82,
		.7
	],
	[
		-26.2,
		28.05,
		.9
	],
	[
		-33.92,
		18.42,
		.6
	],
	[
		25.2,
		55.27,
		1
	],
	[
		24.47,
		54.37,
		.7
	],
	[
		21.49,
		39.19,
		.6
	],
	[
		28.61,
		77.21,
		1.4
	],
	[
		19.08,
		72.88,
		1.4
	],
	[
		13.08,
		80.27,
		.9
	],
	[
		22.57,
		88.36,
		1.1
	],
	[
		12.97,
		77.59,
		1
	],
	[
		31.52,
		74.36,
		.9
	],
	[
		24.86,
		67.01,
		.9
	],
	[
		23.81,
		90.41,
		1
	],
	[
		13.75,
		100.5,
		1.1
	],
	[
		1.35,
		103.82,
		.8
	],
	[
		3.14,
		101.69,
		.8
	],
	[
		14.6,
		120.98,
		1.1
	],
	[
		-6.2,
		106.85,
		1.2
	],
	[
		35.68,
		139.76,
		1.5
	],
	[
		34.69,
		135.5,
		1.1
	],
	[
		35.17,
		129.07,
		.9
	],
	[
		37.57,
		126.98,
		1.2
	],
	[
		39.9,
		116.4,
		1.5
	],
	[
		31.23,
		121.47,
		1.4
	],
	[
		23.13,
		113.26,
		1.2
	],
	[
		30.57,
		114.3,
		.9
	],
	[
		22.3,
		114.17,
		1
	],
	[
		25.03,
		121.57,
		.9
	],
	[
		-33.87,
		151.21,
		1
	],
	[
		-37.81,
		144.96,
		.8
	],
	[
		35.69,
		51.39,
		1.1
	],
	[
		33.31,
		44.37,
		.7
	],
	[
		24.71,
		46.67,
		.8
	],
	[
		43.65,
		-79.38,
		.8
	],
	[
		45.5,
		-73.57,
		.6
	],
	[
		59.33,
		18.07,
		.5
	],
	[
		60.17,
		24.94,
		.5
	]
];
function mulberry(seed) {
	let s = seed >>> 0;
	return () => {
		s = s * 1664525 + 1013904223 >>> 0;
		return s / 4294967296;
	};
}
function paintNight(world) {
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
		for (const poly of polys[index] ?? []) for (const ring of poly) traceRing(ctx, ring, w, h);
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
		for (const poly of polys[index] ?? []) for (const ring of poly) traceRing(mctx, ring, mw, mh);
		mctx.fill("evenodd");
	});
	const pixels = mctx.getImageData(0, 0, mw, mh).data;
	const onLand = (lng, lat) => {
		if (lat > 84 || lat < -58) return false;
		const x = Math.min(719, Math.max(0, Math.floor((lng + 180) / 360 * mw)));
		const y = Math.min(359, Math.max(0, Math.floor((90 - lat) / 180 * mh)));
		return pixels[(y * mw + x) * 4] > 140;
	};
	const lights = document.createElement("canvas");
	lights.width = w;
	lights.height = h;
	const lctx = lights.getContext("2d");
	if (!lctx) throw new Error("Could not draw the night globe");
	const rand = mulberry(19);
	const dot = (lng, lat, radius, color) => {
		const x = (lng + 180) / 360 * w;
		const y = (90 - lat) / 180 * h;
		lctx.fillStyle = color;
		lctx.beginPath();
		lctx.arc(x, y, radius, 0, Math.PI * 2);
		lctx.fill();
	};
	for (const [index, country] of countries.entries()) {
		if (country.name === "Antarctica" || country.pop < 8e4) continue;
		let minLng = 180;
		let maxLng = -180;
		let minLat = 90;
		let maxLat = -90;
		for (const poly of polys[index] ?? []) for (const ring of poly) for (const pair of ring) {
			minLng = Math.min(minLng, pair[0]);
			maxLng = Math.max(maxLng, pair[0]);
			minLat = Math.min(minLat, pair[1]);
			maxLat = Math.max(maxLat, pair[1]);
		}
		const span = maxLng - minLng;
		const count = Math.min(640, Math.round(18 * (country.pop / 1e6) ** .62) + 6);
		let placed = 0;
		for (let i = 0; i < count * 3 && placed < count; i++) {
			let lat;
			let lng;
			if (span > 80 || span < .2) {
				const spread = Math.min(18, 4 + Math.log10(country.pop + 10));
				lat = country.lat + (rand() - .5) * spread;
				lng = country.lng + (rand() - .5) * spread * 1.3;
			} else {
				lat = minLat + rand() * (maxLat - minLat);
				lng = minLng + rand() * span;
			}
			if (!onLand(lng, lat)) continue;
			const warm = rand() > .18;
			dot(lng, lat, rand() > .92 ? 2.2 : 1.15, warm ? "#ffe7b0" : "#d7e7ff");
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
		for (const poly of polys[index] ?? []) for (const ring of poly) traceRing(ctx, ring, w, h);
	});
	ctx.strokeStyle = "rgba(120, 150, 170, 0.22)";
	ctx.lineWidth = .8;
	ctx.stroke();
	const tex = new CanvasTexture(canvas);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
function cloudTexture() {
	const c = document.createElement("canvas");
	c.width = 1024;
	c.height = 512;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("Could not draw clouds");
	ctx.clearRect(0, 0, c.width, c.height);
	for (let i = 0; i < 90; i++) {
		const x = Math.random() * c.width;
		const y = c.height * (.18 + Math.random() * .64);
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
	const tex = new CanvasTexture(c);
	tex.needsUpdate = true;
	return tex;
}
var va = new Vector3();
var vb = new Vector3();
var vs = new Vector3();
function expand(points, stepDeg) {
	const out = [];
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
	out.push({
		lat: last[0],
		lng: last[1]
	});
	return out;
}
var WALKS = [
	{
		step: 2.8,
		points: [
			[29.76, -95.37],
			[31.69, -106.42],
			[37, -109.05],
			[39.5, -105],
			[47, -100],
			[39, -98]
		]
	},
	{
		step: 2.4,
		points: [
			[25.04, 121.56],
			[23.5, 121],
			[22.6, 120.3]
		]
	},
	{
		step: 2.6,
		points: [
			[18.79, 98.99],
			[13.75, 100.5],
			[7.89, 98.39],
			[3.14, 101.69],
			[1.35, 103.82]
		]
	},
	{
		step: 2.4,
		points: [
			[14.6, 120.98],
			[10.3, 123.9],
			[9.85, 124.14]
		]
	},
	{
		step: 2.2,
		points: [[25.27, 55.33], [25.08, 55.14]]
	},
	{
		step: 2.8,
		points: [
			[55.76, 37.62],
			[59.93, 30.34],
			[43.6, 39.73],
			[60.17, 24.94]
		]
	},
	{
		step: 2.6,
		points: [
			[35.68, 139.76],
			[35, 135.76],
			[34.39, 132.46]
		]
	},
	{
		step: 2.8,
		points: [
			[39.91, 116.41],
			[31.23, 121.47],
			[23.13, 113.26]
		]
	},
	{
		step: 2.8,
		points: [
			[40.71, -74.01],
			[39, -105],
			[34.05, -118.24],
			[37.77, -122.42],
			[32.72, -117.16],
			[33.45, -112.07]
		]
	}
];
var JUMPS = [
	{
		a: [37, -109.05],
		b: [25.04, 121.56],
		lift: .62
	},
	{
		a: [22.63, 120.3],
		b: [18.79, 98.99],
		lift: .38
	},
	{
		a: [7.89, 98.39],
		b: [7.74, 98.78],
		lift: .16
	},
	{
		a: [7.89, 98.39],
		b: [8.16, 98.63],
		lift: .14
	},
	{
		a: [7.89, 98.39],
		b: [8, 98.59],
		lift: .13
	},
	{
		a: [7.89, 98.39],
		b: [7.6, 98.37],
		lift: .12
	},
	{
		a: [7.89, 98.39],
		b: [7.74, 98.36],
		lift: .1
	},
	{
		a: [7.89, 98.39],
		b: [7.53, 99.04],
		lift: .18
	},
	{
		a: [7.89, 98.39],
		b: [5.41, 100.33],
		lift: .28
	},
	{
		a: [1.29, 103.85],
		b: [9.96, 98.63],
		lift: .34
	},
	{
		a: [9.96, 98.63],
		b: [7.89, 98.39],
		lift: .18
	},
	{
		a: [7.89, 98.39],
		b: [14.6, 120.98],
		lift: .42
	},
	{
		a: [14.6, 120.98],
		b: [10.32, 123.89],
		lift: .28
	},
	{
		a: [10.32, 123.89],
		b: [9.85, 124.14],
		lift: .14
	},
	{
		a: [9.85, 124.14],
		b: [25.2, 55.27],
		lift: .55
	},
	{
		a: [25.08, 55.14],
		b: [55.76, 37.62],
		lift: .5
	},
	{
		a: [61.5, 23.77],
		b: [35.68, 139.76],
		lift: .55
	},
	{
		a: [34.39, 132.46],
		b: [39.91, 116.41],
		lift: .36
	},
	{
		a: [23.13, 113.26],
		b: [40.75, -73.99],
		lift: .72
	},
	{
		a: [40.75, -73.99],
		b: [34.05, -118.24],
		lift: .48
	}
];
function buildFootsteps() {
	const raw = WALKS.flatMap((route) => expand(route.points, route.step));
	const kept = [];
	for (const point of raw) {
		const prev = kept[kept.length - 1];
		if (prev && angularDistance(prev.lat, prev.lng, point.lat, point.lng) < 2.15) continue;
		kept.push(point);
	}
	return kept.map((point, i) => ({
		...point,
		left: i % 2 === 0
	}));
}
function buildJumpLines() {
	const pts = [];
	const samples = 28;
	for (const jump of JUMPS) {
		latLngToVector3(jump.a[0], jump.a[1], 1, va).normalize();
		latLngToVector3(jump.b[0], jump.b[1], 1, vb).normalize();
		let prev = null;
		for (let i = 0; i <= samples; i++) {
			const t = i / samples;
			slerpVectors(va, vb, t, vs);
			const lift = Math.sin(t * Math.PI) * jump.lift;
			vs.multiplyScalar(2.02 + lift);
			if (prev) pts.push(prev.x, prev.y, prev.z, vs.x, vs.y, vs.z);
			prev = vs.clone();
		}
	}
	return new Float32Array(pts);
}
var LIVED = [
	{
		id: "lived-america",
		kind: "lived",
		name: "America",
		meta: "32 years",
		lat: 39.5,
		lng: -98.35,
		distance: 4.85,
		detail: "Home for 32 years. The steps start in Houston, cross New Mexico and Minnesota, and later return through Nevada, the Four Corners, California, and end in Tempe."
	},
	{
		id: "lived-phuket",
		kind: "lived",
		name: "Phuket, Thailand",
		meta: "12 years",
		lat: 7.89,
		lng: 98.39,
		distance: 2.78,
		detail: "Twelve years on Phuket — the longest chapter away from America."
	},
	{
		id: "lived-chiangmai",
		kind: "lived",
		name: "Chiang Mai",
		meta: "1 year",
		lat: 18.79,
		lng: 98.98,
		distance: 2.78,
		detail: "A year in Chiang Mai, in the north of Thailand."
	},
	{
		id: "lived-russia",
		kind: "lived",
		name: "Russia",
		meta: "1 year",
		lat: 55.75,
		lng: 37.62,
		distance: 3.7,
		detail: "A year in Russia — Moscow, Saint Petersburg, Sochi, Novgorod, and Obninsk."
	},
	{
		id: "lived-philippines",
		kind: "lived",
		name: "Philippines",
		meta: "Over ½ year",
		lat: 12.2,
		lng: 122.4,
		distance: 3.85,
		detail: "More than half a year across the islands — Manila, Cebu, and Bohol."
	}
];
var COUNTRIES = [
	{
		id: "c-us",
		kind: "trail",
		rank: 1,
		name: "United States",
		meta: "32 years",
		lat: 39.5,
		lng: -98.5,
		distance: 5.4,
		detail: "Home for 32 years. Steps cross Texas, the Southwest, the Pacific coast, and New York."
	},
	{
		id: "c-mexico",
		kind: "trail",
		rank: 1,
		name: "Mexico",
		meta: "Steps",
		lat: 31.7,
		lng: -106.4,
		distance: 3.4,
		detail: "Across the border at Juarez, then back toward the Four Corners."
	},
	{
		id: "c-taiwan",
		kind: "trail",
		rank: 1,
		name: "Taiwan",
		meta: "Steps",
		lat: 23.7,
		lng: 121,
		distance: 3.3,
		detail: "Down the island, then a jump toward Thailand."
	},
	{
		id: "c-thailand",
		kind: "trail",
		rank: 1,
		name: "Thailand",
		meta: "13 years",
		lat: 13,
		lng: 100.5,
		distance: 3.6,
		detail: "Chiang Mai, Bangkok, the east coast, Ranong, and twelve years on Phuket."
	},
	{
		id: "c-malaysia",
		kind: "trail",
		rank: 1,
		name: "Malaysia",
		meta: "Steps",
		lat: 3.8,
		lng: 102,
		distance: 3.5,
		detail: "Kuala Lumpur and a few of the big cities down the peninsula."
	},
	{
		id: "c-singapore",
		kind: "trail",
		rank: 1,
		name: "Singapore",
		meta: "Steps",
		lat: 1.35,
		lng: 103.82,
		distance: 2.9,
		detail: "A handful of stops at the tip of the peninsula."
	},
	{
		id: "c-philippines",
		kind: "trail",
		rank: 1,
		name: "Philippines",
		meta: "Over ½ year",
		lat: 12,
		lng: 122.5,
		distance: 4,
		detail: "More than half a year — Manila, Cebu, and Bohol."
	},
	{
		id: "c-uae",
		kind: "trail",
		rank: 1,
		name: "United Arab Emirates",
		meta: "Steps",
		lat: 25.2,
		lng: 55.27,
		distance: 3.1,
		detail: "Dubai, between the Philippines and Russia."
	},
	{
		id: "c-russia",
		kind: "trail",
		rank: 1,
		name: "Russia",
		meta: "1 year",
		lat: 58,
		lng: 40,
		distance: 4.6,
		detail: "A year based around Moscow, Saint Petersburg, Sochi, Novgorod, and Obninsk."
	},
	{
		id: "c-finland",
		kind: "trail",
		rank: 1,
		name: "Finland",
		meta: "Steps",
		lat: 61,
		lng: 25,
		distance: 3.4,
		detail: "Helsinki and a short way inland, then the jump to Japan."
	},
	{
		id: "c-japan",
		kind: "trail",
		rank: 1,
		name: "Japan",
		meta: "Steps",
		lat: 36.2,
		lng: 138,
		distance: 3.8,
		detail: "Tokyo through Kyoto and Osaka, on to Hiroshima."
	},
	{
		id: "c-china",
		kind: "trail",
		rank: 1,
		name: "China",
		meta: "Steps",
		lat: 35,
		lng: 105,
		distance: 4.4,
		detail: "Beijing first, then the interior and the east and south coasts."
	}
];
var WONDERS = [
	{
		id: "buddha",
		name: "Big Buddha",
		detail: "The seated figure on the hill above Phuket.",
		lat: 7.828,
		lng: 98.313,
		model: "buddha",
		scale: .16
	},
	{
		id: "wat-arun",
		name: "Wat Arun",
		detail: "The temple of dawn on the river in Bangkok.",
		lat: 13.744,
		lng: 100.489,
		model: "pagoda",
		scale: .14
	},
	{
		id: "doi-suthep",
		name: "Doi Suthep",
		detail: "The golden temple on the mountain above Chiang Mai.",
		lat: 18.805,
		lng: 98.921,
		model: "pagoda",
		scale: .13
	},
	{
		id: "angkor",
		name: "Angkor Wat",
		detail: "The great temple just east of Thailand, near Siem Reap.",
		lat: 13.413,
		lng: 103.867,
		model: "angkor",
		scale: .17
	},
	{
		id: "petronas",
		name: "Petronas Towers",
		detail: "The twin towers in Kuala Lumpur.",
		lat: 3.158,
		lng: 101.712,
		model: "twins",
		scale: .15
	},
	{
		id: "mbs",
		name: "Marina Bay Sands",
		detail: "The three towers and the sky park in Singapore.",
		lat: 1.283,
		lng: 103.861,
		model: "marina",
		scale: .11
	},
	{
		id: "taipei",
		name: "Taipei 101",
		detail: "The tiered tower in Taipei.",
		lat: 25.034,
		lng: 121.565,
		model: "spire",
		scale: .14
	},
	{
		id: "hills",
		name: "Chocolate Hills",
		detail: "The green cones of Bohol.",
		lat: 9.91,
		lng: 124.17,
		model: "peaks",
		scale: .14
	},
	{
		id: "intramuros",
		name: "Intramuros",
		detail: "The old walled city in Manila.",
		lat: 14.589,
		lng: 120.975,
		model: "arch",
		scale: .13
	},
	{
		id: "magellan",
		name: "Magellan's Cross",
		detail: "The cross pavilion in Cebu City.",
		lat: 10.293,
		lng: 123.902,
		model: "cross",
		scale: .13
	},
	{
		id: "burj",
		name: "Burj Khalifa",
		detail: "The tower above downtown Dubai.",
		lat: 25.197,
		lng: 55.274,
		model: "burj",
		scale: .12
	},
	{
		id: "kremlin",
		name: "St. Basil's",
		detail: "The colored domes on Red Square in Moscow.",
		lat: 55.753,
		lng: 37.623,
		model: "dome",
		scale: .14
	},
	{
		id: "hermitage",
		name: "The Hermitage",
		detail: "The palace on the Neva in Saint Petersburg.",
		lat: 59.94,
		lng: 30.314,
		model: "palace",
		scale: .11
	},
	{
		id: "sochi-peaks",
		name: "Caucasus",
		detail: "The mountains rising behind Sochi.",
		lat: 43.7,
		lng: 40.2,
		model: "peaks",
		scale: .14
	},
	{
		id: "helsinki",
		name: "Helsinki Cathedral",
		detail: "The white church on Senate Square.",
		lat: 60.17,
		lng: 24.952,
		model: "dome",
		scale: .13
	},
	{
		id: "fuji",
		name: "Mount Fuji",
		detail: "The cone west of Tokyo.",
		lat: 35.361,
		lng: 138.728,
		model: "fuji",
		scale: .13
	},
	{
		id: "torii",
		name: "Itsukushima",
		detail: "The great gate standing in the water near Hiroshima.",
		lat: 34.296,
		lng: 132.32,
		model: "torii",
		scale: .14
	},
	{
		id: "wall",
		name: "Great Wall",
		detail: "The wall in the hills north of Beijing.",
		lat: 40.43,
		lng: 116.57,
		model: "wall",
		scale: .12
	},
	{
		id: "forbidden",
		name: "Forbidden City",
		detail: "The palace at the center of Beijing.",
		lat: 39.916,
		lng: 116.397,
		model: "pagoda",
		scale: .14
	},
	{
		id: "shanghai",
		name: "The Bund",
		detail: "The towers along the river in Shanghai.",
		lat: 31.24,
		lng: 121.49,
		model: "twins",
		scale: .14
	},
	{
		id: "liberty",
		name: "Statue of Liberty",
		detail: "The figure in New York Harbor.",
		lat: 40.6892,
		lng: -74.0445,
		model: "liberty",
		scale: .14
	},
	{
		id: "hollywood",
		name: "Hollywood Sign",
		detail: "The letters in the hills above Los Angeles.",
		lat: 34.1341,
		lng: -118.3215,
		model: "sign",
		scale: .13
	},
	{
		id: "golden-gate",
		name: "Golden Gate",
		detail: "The bridge at the mouth of San Francisco Bay.",
		lat: 37.8199,
		lng: -122.4783,
		model: "bridge",
		scale: .12
	},
	{
		id: "grand-canyon",
		name: "Grand Canyon",
		detail: "The gorge north of Flagstaff.",
		lat: 36.1,
		lng: -112.14,
		model: "monolith",
		scale: .12
	},
	{
		id: "monument",
		name: "Monument Valley",
		detail: "The buttes near the Four Corners.",
		lat: 36.998,
		lng: -110.098,
		model: "monolith",
		scale: .11
	},
	{
		id: "vegas-sign",
		name: "Welcome to Las Vegas",
		detail: "The sign at the south end of the Strip.",
		lat: 36.082,
		lng: -115.173,
		model: "sign",
		scale: .08
	},
	{
		id: "yosemite",
		name: "Yosemite",
		detail: "The granite valley east of the California coast.",
		lat: 37.745,
		lng: -119.593,
		model: "peaks",
		scale: .11
	}
];
function box(w, h, d, x = 0, y = 0, z = 0) {
	const g = new BoxGeometry(w, h, d);
	g.translate(x, y + h / 2, z);
	return g;
}
function cyl(rt, rb, h, x, y, z, seg = 7) {
	const g = new CylinderGeometry(rt, rb, h, seg);
	g.translate(x, y + h / 2, z);
	return g;
}
function sph(r, x, y, z, sy = 1) {
	const g = new SphereGeometry(r, 10, 8);
	if (sy !== 1) g.scale(1, sy, 1);
	g.translate(x, y, z);
	return g;
}
function merged(parts) {
	const g = mergeGeometries(parts);
	for (const p of parts) p.dispose();
	if (!g) throw new Error("Could not build a landmark");
	return g;
}
function eiffel() {
	const parts = [];
	const h = .86;
	for (const [sx, sz] of [
		[1, 1],
		[1, -1],
		[-1, 1],
		[-1, -1]
	]) {
		const g = new BoxGeometry(.05, h, .05);
		const pos = g.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const k = 1 - (pos.getY(i) + h / 2) / h * .8;
			pos.setX(i, pos.getX(i) * .35 + sx * .2 * k);
			pos.setZ(i, pos.getZ(i) * .35 + sz * .2 * k);
		}
		g.translate(0, h / 2, 0);
		parts.push(g);
	}
	parts.push(box(.22, .028, .22, 0, .3, 0), box(.11, .022, .11, 0, .56, 0), cyl(.008, .02, .28, 0, .7, 0, 5));
	return { stone: merged(parts) };
}
function pyramid() {
	return { stone: merged([
		cyl(.012, .28, .36, -.02, 0, .02, 4),
		cyl(.01, .2, .28, .36, 0, .06, 4),
		cyl(.008, .15, .2, -.32, 0, .16, 4),
		box(.26, .08, .1, .62, 0, .22),
		box(.09, .1, .08, .76, .05, .22)
	]) };
}
function taj() {
	return { stone: merged([
		box(.78, .07, .78),
		box(.34, .18, .34, 0, .07, 0),
		sph(.16, 0, .4, 0, 1.2),
		cyl(.015, .028, .14, 0, .5, 0, 6),
		cyl(.02, .035, .46, .32, .07, .32, 6),
		cyl(.02, .035, .46, -.32, .07, .32, 6),
		cyl(.02, .035, .46, .32, .07, -.32, 6),
		cyl(.02, .035, .46, -.32, .07, -.32, 6)
	]) };
}
function liberty() {
	return { stone: merged([
		box(.22, .08, .22),
		box(.16, .1, .16, 0, .08, 0),
		cyl(.045, .07, .28, 0, .18, 0, 8),
		sph(.055, 0, .52, 0),
		box(.02, .16, .02, .1, .34, 0),
		sph(.03, .1, .54, 0, 1.3),
		cyl(.004, .004, .08, -.02, .56, 0, 4),
		cyl(.004, .004, .07, .03, .57, 0, 4),
		cyl(.004, .004, .07, 0, .58, .03, 4)
	]) };
}
function colosseum() {
	const ring = new TorusGeometry(.22, .07, 8, 18);
	ring.rotateX(Math.PI / 2);
	ring.translate(0, .1, 0);
	return { stone: merged([box(.56, .04, .56), ring]) };
}
function opera() {
	return { stone: merged([
		box(.55, .05, .32),
		sph(.12, -.16, .1, 0, .7),
		sph(.16, .02, .12, 0, .62),
		sph(.11, .18, .1, .02, .75)
	]) };
}
function bridge() {
	return { stone: merged([
		box(.7, .03, .08, 0, .16, 0),
		box(.04, .32, .04, -.22, 0, 0),
		box(.04, .32, .04, .22, 0, 0),
		box(.1, .02, .07, -.22, .32, 0),
		box(.1, .02, .07, .22, .32, 0),
		box(.5, .012, .012, 0, .28, .03)
	]) };
}
function fuji() {
	return {
		stone: merged([cyl(.02, .34, .55, 0, 0, 0, 10)]),
		snow: merged([cyl(.01, .12, .16, 0, .42, 0, 8)])
	};
}
function wall() {
	const parts = [];
	for (let i = 0; i < 7; i++) {
		const x = (i - 3) * .11;
		const z = Math.sin(i * .9) * .08;
		parts.push(box(.1, .08 + i % 2 * .03, .045, x, 0, z));
	}
	return { stone: merged(parts) };
}
function burj() {
	return { stone: merged([
		cyl(.04, .07, .22, 0, 0, 0, 6),
		cyl(.025, .04, .22, 0, .22, 0, 6),
		cyl(.012, .025, .22, 0, .44, 0, 6),
		cyl(.004, .01, .2, 0, .66, 0, 5)
	]) };
}
function christ() {
	return { stone: merged([
		cyl(.02, .16, .08, 0, 0, 0, 8),
		box(.06, .22, .04, 0, .08, 0),
		box(.2, .035, .035, 0, .24, 0),
		sph(.035, 0, .34, 0)
	]) };
}
function clock() {
	return { stone: merged([
		box(.1, .42, .1),
		cyl(.045, .045, .02, 0, .28, .05, 10),
		cyl(.01, .06, .12, 0, .42, 0, 4)
	]) };
}
function pisa() {
	const g = clock().stone;
	g.translate(0, -.2, 0);
	g.rotateZ(.22);
	g.translate(0, .2, 0);
	return { stone: g };
}
function moai() {
	return { stone: merged([
		box(.16, .28, .1, 0, 0, 0),
		box(.18, .08, .12, 0, .26, 0),
		box(.04, .08, .04, 0, .16, .06)
	]) };
}
function dome() {
	return { stone: merged([
		box(.36, .1, .28),
		cyl(.1, .12, .12, 0, .1, 0, 10),
		sph(.11, 0, .28, 0, .85),
		cyl(.015, .02, .22, .16, .1, .1, 5),
		cyl(.015, .02, .22, -.16, .1, .1, 5)
	]) };
}
function twins() {
	return { stone: merged([
		cyl(.02, .045, .55, -.08, 0, 0, 6),
		cyl(.02, .045, .55, .08, 0, 0, 6),
		box(.16, .02, .03, 0, .34, 0),
		cyl(.006, .012, .12, -.08, .55, 0, 5),
		cyl(.006, .012, .12, .08, .55, 0, 5)
	]) };
}
function marina() {
	return { stone: merged([
		box(.05, .4, .05, -.14, 0, 0),
		box(.05, .4, .05, 0, 0, 0),
		box(.05, .4, .05, .14, 0, 0),
		box(.42, .035, .1, 0, .4, 0)
	]) };
}
function step() {
	return { stone: merged([
		box(.42, .08, .42, 0, 0, 0),
		box(.3, .08, .3, 0, .08, 0),
		box(.2, .08, .2, 0, .16, 0),
		box(.1, .08, .1, 0, .24, 0)
	]) };
}
function henge() {
	const parts = [];
	for (let i = 0; i < 8; i++) {
		const a = i / 8 * Math.PI * 2;
		parts.push(box(.035, .14, .03, Math.cos(a) * .16, 0, Math.sin(a) * .16));
		if (i % 2 === 0) {
			const b = a + Math.PI / 8;
			parts.push(box(.08, .025, .03, Math.cos(b) * .16, .14, Math.sin(b) * .16));
		}
	}
	return { stone: merged(parts) };
}
function monolith() {
	return { stone: merged([sph(.22, 0, .08, 0, .45)]) };
}
function peaks() {
	return {
		stone: merged([
			cyl(.02, .16, .36, 0, 0, 0, 6),
			cyl(.015, .12, .26, .16, 0, .06, 6),
			cyl(.012, .1, .2, -.14, 0, .08, 6)
		]),
		snow: merged([cyl(.008, .05, .08, 0, .3, 0, 5), cyl(.006, .035, .06, .16, .22, .06, 5)])
	};
}
function spire() {
	return { stone: merged([
		box(.08, .08, .08),
		cyl(.012, .04, .55, 0, .08, 0, 7),
		cyl(.004, .01, .22, 0, .63, 0, 5)
	]) };
}
function torii() {
	return { stone: merged([
		box(.035, .28, .035, -.1, 0, 0),
		box(.035, .28, .035, .1, 0, 0),
		box(.3, .03, .04, 0, .26, 0),
		box(.26, .018, .03, 0, .22, 0)
	]) };
}
function pagoda() {
	return { stone: merged([
		box(.2, .08, .2),
		box(.26, .025, .26, 0, .08, 0),
		box(.14, .08, .14, 0, .105, 0),
		box(.2, .02, .2, 0, .185, 0),
		box(.08, .1, .08, 0, .205, 0),
		cyl(.01, .02, .08, 0, .3, 0, 5)
	]) };
}
function arch() {
	return { stone: merged([
		box(.34, .28, .06),
		box(.1, .16, .07, 0, 0, .01),
		box(.16, .04, .07, 0, .22, 0)
	]) };
}
function sign() {
	return { stone: merged([
		box(.46, .08, .02, 0, .16, 0),
		box(.02, .16, .02, -.16, 0, 0),
		box(.02, .16, .02, .16, 0, 0)
	]) };
}
function rushmore() {
	return { stone: merged([
		box(.42, .2, .16),
		sph(.055, -.12, .2, .06),
		sph(.05, -.02, .22, .07),
		sph(.05, .08, .2, .06),
		sph(.045, .16, .18, .05)
	]) };
}
function falls() {
	return {
		stone: merged([box(.28, .16, .12, 0, 0, -.04), box(.28, .05, .2, 0, 0, .08)]),
		snow: merged([box(.16, .14, .02, 0, .01, .04)])
	};
}
function buddha() {
	return { stone: merged([
		box(.36, .05, .24),
		box(.26, .07, .18, 0, .05, 0),
		sph(.11, 0, .24, 0, 1.2),
		sph(.06, 0, .38, .02),
		sph(.022, 0, .45, .02)
	]) };
}
function angkor() {
	const parts = [box(.5, .05, .32), box(.42, .035, .24, 0, .05, 0)];
	const tower = (x, z, h) => {
		parts.push(box(.08, h, .08, x, .085, z));
		parts.push(cyl(.012, .05, h * .55, x, .085 + h, z, 5));
	};
	tower(0, 0, .32);
	tower(-.14, .09, .18);
	tower(.14, .09, .18);
	tower(-.14, -.09, .15);
	tower(.14, -.09, .15);
	return { stone: merged(parts) };
}
function palace() {
	return { stone: merged([
		box(.5, .14, .18),
		box(.18, .1, .18, 0, .14, 0),
		box(.54, .028, .22, 0, .14, 0),
		cyl(.028, .028, .1, -.18, .14, 0, 6),
		cyl(.028, .028, .1, .18, .14, 0, 6)
	]) };
}
function cross() {
	return { stone: merged([
		cyl(.09, .11, .04, 0, 0, 0, 8),
		box(.028, .3, .028, 0, .04, 0),
		box(.16, .028, .028, 0, .2, 0)
	]) };
}
var BUILDERS = {
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
	cross
};
var up = new Vector3();
var quat = new Quaternion();
var pos = new Vector3();
var scl = new Vector3();
function place(geo, wonder) {
	latLngToVector3(wonder.lat, wonder.lng, 2.024, pos);
	up.copy(pos).normalize();
	alignUp(up, quat);
	scl.set(wonder.scale, wonder.scale, wonder.scale);
	geo.applyMatrix4(new Matrix4().compose(pos, quat, scl));
	return geo;
}
function buildLandmarkGeometry() {
	const stone = [];
	const snow = [];
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
	return {
		stone: stoneGeo,
		snow: snowGeo
	};
}
function wonderSelection(wonder) {
	return {
		id: `wonder-${wonder.id}`,
		kind: "wonder",
		name: wonder.name,
		detail: wonder.detail,
		meta: "Landmark",
		lat: wonder.lat,
		lng: wonder.lng,
		distance: 2.7
	};
}
function pickAt(lat, lng, camRadius, _countries) {
	const hit = Math.min(2.6, Math.max(.72, (camRadius - 2) / 1.45));
	let bestScore = Infinity;
	let best = null;
	const consider = (lat2, lng2, max, sel, bias) => {
		const d = angularDistance(lat, lng, lat2, lng2);
		const limit = max * hit;
		if (d > limit) return;
		const score = d / limit * bias;
		if (score < bestScore) {
			bestScore = score;
			best = sel;
		}
	};
	for (const wonder of WONDERS) consider(wonder.lat, wonder.lng, 1.5, wonderSelection(wonder), .7);
	for (const place of COUNTRIES) consider(place.lat, place.lng, 8, place, .85);
	for (const place of LIVED) consider(place.lat, place.lng, 1.2, place, 1.15);
	return best;
}
var UP = new Vector3(0, 1, 0);
var MIN_R = 2.32;
var MAX_R = 11;
function pxToWorld(camera, distance, pixels, viewportHeight) {
	const fov = camera.fov * Math.PI / 180;
	return pixels / Math.max(1, viewportHeight) * 2 * Math.tan(fov / 2) * Math.max(.2, distance);
}
var HOME$1 = {
	lat: 36,
	lng: -106,
	distance: 7.35
};
function footprintGeometry() {
	const oval = (rx, ry, x, y) => {
		const shape = new Shape();
		shape.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, 0);
		return new ShapeGeometry(shape, 14);
	};
	const geo = mergeGeometries([
		oval(.15, .2, 0, -.26),
		oval(.17, .22, .02, .06),
		oval(.085, .1, .15, .36),
		oval(.052, .072, .03, .42),
		oval(.046, .064, -.05, .4),
		oval(.04, .055, -.11, .34),
		oval(.034, .046, -.15, .26)
	]);
	if (!geo) throw new Error("footprint");
	geo.scale(.02, .02, 1);
	geo.rotateX(Math.PI / 2);
	return geo;
}
function Atmosphere({ night }) {
	const material = (0, import_react.useMemo)(() => new ShaderMaterial({
		transparent: true,
		side: 1,
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
		fragmentShader: night ? `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fres = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.4);
            vec3 glow = vec3(1.0, 0.72, 0.38);
            gl_FragColor = vec4(glow, fres * 0.42);
          }
        ` : `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float fres = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.8);
            gl_FragColor = vec4(0.25, 0.62, 0.98, fres * 0.95);
          }
        `
	}), [night]);
	(0, import_react.useEffect)(() => () => material.dispose(), [material]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		scale: 1.11,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			2,
			64,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
			object: material,
			attach: "material"
		})]
	});
}
function Earth({ world, map, night, bump }) {
	const borders = (0, import_react.useMemo)(() => {
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(world.borders, 3));
		return geo;
	}, [world]);
	const graticule = (0, import_react.useMemo)(() => {
		const pts = [];
		const v = new Vector3();
		const push = (lat, lng) => {
			latLngToVector3(lat, lng, 1, v);
			pts.push(v.x, v.y, v.z);
		};
		for (let lat = -60; lat <= 60; lat += 30) for (let lng = -180; lng < 180; lng += 4) {
			push(lat, lng);
			push(lat, lng + 4);
		}
		for (let lng = -180; lng < 180; lng += 30) for (let lat = -80; lat < 80; lat += 4) {
			push(lat, lng);
			push(lat + 4, lng);
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new Float32BufferAttribute(pts, 3));
		return geo;
	}, []);
	(0, import_react.useEffect)(() => () => {
		borders.dispose();
		graticule.dispose();
	}, [borders, graticule]);
	const material = (0, import_react.useMemo)(() => {
		if (night || !bump) return new MeshBasicMaterial({ map });
		const relief = new MeshStandardMaterial({
			map,
			bumpMap: bump,
			bumpScale: .085,
			roughness: .78,
			metalness: .03
		});
		relief.onBeforeCompile = (shader) => {
			shader.uniforms.uDetail = { value: 0 };
			relief.userData.shader = shader;
			shader.fragmentShader = `
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
      ` + shader.fragmentShader.replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
            float landMask = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            roughnessFactor = mix(0.22, 0.92, landMask);`).replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
            float landN = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            vec2 uvD = vMapUv * vec2(280.0, 140.0);
            float e = 0.0032;
            float h0 = fbm(uvD);
            float hx = fbm(uvD + vec2(e, 0.0));
            float hy = fbm(uvD + vec2(0.0, e));
            vec3 nFine = normalize(vec3((h0 - hx) * 9.0, (h0 - hy) * 9.0, 1.0));
            normal = normalize(mix(normal, nFine, uDetail * landN * 0.78));`).replace("#include <color_fragment>", `#include <color_fragment>
            float landC = smoothstep(0.02, 0.18, diffuseColor.g - diffuseColor.b * 0.42);
            float ridge = fbm(vMapUv * vec2(280.0, 140.0));
            diffuseColor.rgb += (ridge - 0.48) * uDetail * landC * vec3(0.11, 0.09, 0.045);`);
		};
		return relief;
	}, [
		bump,
		map,
		night
	]);
	useFrame(({ camera }) => {
		const shader = material.userData.shader;
		if (!shader) return;
		shader.uniforms.uDetail.value = MathUtils.smoothstep(4.8, 2.7, camera.position.length());
	});
	(0, import_react.useEffect)(() => () => material.dispose(), [material]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			material,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				2,
				128,
				96
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineSegments", {
			geometry: borders,
			scale: 2.006,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineBasicMaterial", {
				color: night ? "#1c2834" : "#16324a",
				transparent: true,
				opacity: night ? .35 : .42
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineSegments", {
			geometry: borders,
			scale: 2.012,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineBasicMaterial", {
				color: night ? "#8fd0ff" : "#f4fbff",
				transparent: true,
				opacity: night ? .16 : .55
			})
		}),
		night ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineSegments", {
			geometry: graticule,
			scale: 2.004,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineBasicMaterial", {
				color: "#d5e6f4",
				transparent: true,
				opacity: .14
			})
		})
	] });
}
function NightEarth({ world }) {
	const map = (0, import_react.useMemo)(() => paintNight(world), [world]);
	(0, import_react.useEffect)(() => () => map.dispose(), [map]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {
		world,
		map,
		night: true
	});
}
function DayEarth({ world }) {
	const gl = useThree((state) => state.gl);
	const map = useLoader(TextureLoader, publicUrl("/geo/earth-day.jpg"));
	const bump = useLoader(TextureLoader, publicUrl("/geo/earth-bump.png"));
	(0, import_react.useLayoutEffect)(() => {
		map.colorSpace = SRGBColorSpace;
		map.anisotropy = gl.capabilities.getMaxAnisotropy();
		map.minFilter = LinearMipmapLinearFilter;
		bump.colorSpace = "";
		bump.anisotropy = 8;
		map.needsUpdate = true;
		bump.needsUpdate = true;
	}, [
		bump,
		gl,
		map
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {
		world,
		map,
		bump
	});
}
function Clouds({ night }) {
	const ref = (0, import_react.useRef)(null);
	const tex = (0, import_react.useMemo)(() => cloudTexture(), []);
	(0, import_react.useEffect)(() => () => tex.dispose(), [tex]);
	useFrame((_, delta) => {
		if (ref.current) ref.current.rotation.y += Math.min(delta, .05) * .015;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		ref,
		scale: 1.02,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			2,
			48,
			32
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			map: tex,
			transparent: true,
			opacity: night ? .05 : .22,
			depthWrite: false,
			color: night ? "#9bb0c4" : "#ffffff"
		})]
	});
}
function Stars() {
	const geo = (0, import_react.useMemo)(() => {
		const count = 1600;
		const positions = new Float32Array(count * 3);
		const rand = (n) => {
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
		const g = new BufferGeometry();
		g.setAttribute("position", new BufferAttribute(positions, 3));
		return g;
	}, []);
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: "#f7f4ea",
			size: .055,
			sizeAttenuation: true,
			depthWrite: false
		})
	});
}
function Sky() {
	const material = (0, import_react.useMemo)(() => new ShaderMaterial({
		side: 1,
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
        `
	}), []);
	(0, import_react.useEffect)(() => () => material.dispose(), [material]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		scale: 46,
		frustumCulled: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			32,
			24
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
			object: material,
			attach: "material"
		})]
	});
}
function Jumps() {
	const geo = (0, import_react.useMemo)(() => {
		const g = new BufferGeometry();
		g.setAttribute("position", new BufferAttribute(buildJumpLines(), 3));
		return g;
	}, []);
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineSegments", {
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineBasicMaterial", {
			color: "#f6e7c8",
			transparent: true,
			opacity: .7
		})
	});
}
function Footprints() {
	const poses = (0, import_react.useMemo)(() => {
		const steps = buildFootsteps();
		const n = new Vector3();
		const next = new Vector3();
		const travel = new Vector3();
		new Vector3();
		const local = new Vector3();
		const qAlign = new Quaternion();
		const qYaw = new Quaternion();
		const list = [];
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
			const position = latLngToVector3(cur.lat, cur.lng, 2.012, new Vector3());
			list.push({
				position,
				quaternion: qAlign.clone().multiply(qYaw),
				side: new Vector3().crossVectors(n, travel).normalize(),
				mirror: cur.left ? -1 : 1
			});
		}
		return list;
	}, []);
	const geo = (0, import_react.useMemo)(() => footprintGeometry(), []);
	const glowGeo = (0, import_react.useMemo)(() => geo.clone(), [geo]);
	const base = (0, import_react.useMemo)(() => {
		geo.computeBoundingBox();
		const size = geo.boundingBox?.getSize(new Vector3()) ?? new Vector3(.02, .02, .02);
		return Math.max(size.x, size.z, .001);
	}, [geo]);
	const core = (0, import_react.useRef)(null);
	const halo = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	(0, import_react.useEffect)(() => () => {
		geo.dispose();
		glowGeo.dispose();
	}, [geo, glowGeo]);
	useFrame(({ camera, size }) => {
		const mesh = core.current;
		const glow = halo.current;
		if (!mesh || !glow) return;
		const persp = camera;
		for (let i = 0; i < poses.length; i++) {
			const pose = poses[i];
			const world = pxToWorld(persp, persp.position.distanceTo(pose.position), 18, size.height);
			const s = world / base;
			dummy.position.copy(pose.position).addScaledVector(pose.side, pose.mirror * world * .42);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("instancedMesh", {
		ref: halo,
		args: [
			glowGeo,
			void 0,
			poses.length
		],
		frustumCulled: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#d9cbb6",
			transparent: true,
			opacity: .8,
			depthWrite: false,
			side: 2,
			polygonOffset: true,
			polygonOffsetFactor: -2
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("instancedMesh", {
		ref: core,
		args: [
			geo,
			void 0,
			poses.length
		],
		frustumCulled: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#f7f3ec",
			side: 2,
			polygonOffset: true,
			polygonOffsetFactor: -3
		})
	})] });
}
function Landmarks({ night }) {
	const geos = (0, import_react.useMemo)(() => buildLandmarkGeometry(), []);
	(0, import_react.useEffect)(() => () => {
		geos.stone.dispose();
		geos.snow?.dispose();
	}, [geos]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		geometry: geos.stone,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: night ? "#2a241c" : "#f4efe6",
			roughness: .42,
			metalness: .04,
			emissive: night ? "#ffd7a1" : "#4a4036",
			emissiveIntensity: night ? .55 : .28
		})
	}), geos.snow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		geometry: geos.snow,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#ffffff",
			roughness: .35,
			metalness: .02,
			emissive: "#f7f4ee",
			emissiveIntensity: .2
		})
	}) : null] });
}
function LivedBeacons() {
	const group = (0, import_react.useRef)(null);
	const ring = (0, import_react.useMemo)(() => {
		const g = new TorusGeometry(.05, .0032, 8, 36);
		g.rotateX(Math.PI / 2);
		return g;
	}, []);
	(0, import_react.useEffect)(() => () => ring.dispose(), [ring]);
	useFrame(({ camera, clock, size }) => {
		const t = clock.elapsedTime;
		const persp = camera;
		group.current?.children.forEach((child, index) => {
			const pulse = 1 + Math.sin(t * 1.7 + index) * .07;
			const dist = persp.position.distanceTo(child.position);
			const s = pxToWorld(persp, dist, 22, size.height) / .1 * pulse;
			child.scale.setScalar(s);
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		children: LIVED.map((place) => {
			const position = latLngToVector3(place.lat, place.lng, 2.008, new Vector3());
			const quaternion = alignUp(position.clone().normalize(), new Quaternion());
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				position,
				quaternion,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					geometry: ring,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#f3f7fb" })
				})
			}, place.id);
		})
	});
}
function FocusRing({ selection }) {
	const mesh = (0, import_react.useRef)(null);
	const sel = (0, import_react.useRef)(selection);
	sel.current = selection;
	const geo = (0, import_react.useMemo)(() => {
		const g = new TorusGeometry(.07, .003, 8, 48);
		g.rotateX(Math.PI / 2);
		return g;
	}, []);
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	useFrame(({ camera, clock, size }) => {
		const m = mesh.current;
		const current = sel.current;
		if (!m) return;
		if (!current) {
			m.visible = false;
			return;
		}
		m.visible = true;
		const p = latLngToVector3(current.lat, current.lng, 2.016, _p);
		m.position.copy(p);
		m.quaternion.copy(alignUp(_n.copy(p).normalize(), _q));
		const persp = camera;
		const dist = persp.position.distanceTo(p);
		const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * .05;
		m.scale.setScalar(pxToWorld(persp, dist, 42, size.height) / .14 * pulse);
		m.material.color.set(current.kind === "trail" ? "#3c92d8" : "#f4f8fb");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		ref: mesh,
		geometry: geo,
		visible: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#f4f8fb",
			transparent: true,
			opacity: .95
		})
	});
}
var _p = new Vector3();
var _n = new Vector3();
var _q = new Quaternion();
function makeLabelTexture(text) {
	const canvas = document.createElement("canvas");
	const probe = document.createElement("canvas").getContext("2d");
	if (!probe) throw new Error("label");
	probe.font = "600 64px Georgia, \"Liberation Serif\", serif";
	canvas.width = Math.ceil(probe.measureText(text).width) + 48;
	canvas.height = 96;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("label");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "600 64px Georgia, \"Liberation Serif\", serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = "rgba(8, 16, 28, 0.72)";
	ctx.shadowBlur = 10;
	ctx.fillStyle = "rgba(244, 248, 252, 0.98)";
	ctx.fillText(text, canvas.width / 2, 50);
	const tex = new CanvasTexture(canvas);
	tex.colorSpace = SRGBColorSpace;
	tex.needsUpdate = true;
	return {
		tex,
		aspect: canvas.width / canvas.height
	};
}
function Labels({ selectedId }) {
	const group = (0, import_react.useRef)(null);
	const sprites = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const textures = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const acc = (0, import_react.useRef)(5);
	const sig = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => () => {
		textures.current.forEach((entry) => entry.tex.dispose());
		textures.current.clear();
	}, []);
	useFrame(({ camera, size }) => {
		const parent = group.current;
		if (!parent) return;
		const persp = camera;
		acc.current += 1;
		if (acc.current >= 6) {
			acc.current = 0;
			const radius = camera.position.length();
			const camN = _n.copy(camera.position).normalize();
			const close = radius < 3.6;
			const items = [];
			for (const place of COUNTRIES) {
				const facing = latLngToVector3(place.lat, place.lng, 1, _p).dot(camN);
				if (facing < .2 && place.id !== selectedId) continue;
				items.push({
					key: place.id,
					name: place.name,
					lat: place.lat,
					lng: place.lng,
					score: facing * 3 + (place.id === selectedId ? 8 : 0)
				});
			}
			if (close) for (const wonder of WONDERS) {
				const facing = latLngToVector3(wonder.lat, wonder.lng, 1, _p).dot(camN);
				if (facing < .55 && selectedId !== `wonder-${wonder.id}`) continue;
				items.push({
					key: `w-${wonder.id}`,
					name: wonder.name,
					lat: wonder.lat,
					lng: wonder.lng,
					score: facing * .7 + (selectedId === `wonder-${wonder.id}` ? 8 : 0)
				});
			}
			items.sort((a, b) => b.score - a.score);
			const accepted = [];
			const sep = close ? .12 : .2;
			const limit = close ? 8 : 5;
			for (const item of items) {
				latLngToVector3(item.lat, item.lng, 2, _p);
				const projected = _p.clone().project(camera);
				if (projected.z > 1) continue;
				if (accepted.some((other) => {
					latLngToVector3(other.lat, other.lng, 2, _v2);
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
				for (const [key, sprite] of sprites.current) if (!keep.has(key)) {
					parent.remove(sprite);
					sprites.current.delete(key);
				}
				for (const item of accepted) {
					let sprite = sprites.current.get(item.key);
					if (!sprite) {
						let cached = textures.current.get(item.name);
						if (!cached) {
							cached = makeLabelTexture(item.name);
							textures.current.set(item.name, cached);
						}
						const material = new SpriteMaterial({
							map: cached.tex,
							transparent: true,
							depthWrite: false,
							depthTest: false
						});
						sprite = new Sprite(material);
						sprite.renderOrder = 3;
						sprite.userData.aspect = cached.aspect;
						sprites.current.set(item.key, sprite);
						parent.add(sprite);
					}
					const base = latLngToVector3(item.lat, item.lng, 2.024, new Vector3());
					sprite.userData.base = base;
					sprite.userData.normal = base.clone().normalize();
				}
			}
		}
		for (const sprite of sprites.current.values()) {
			const base = sprite.userData.base;
			const normal = sprite.userData.normal;
			const aspect = sprite.userData.aspect || 4;
			if (!base || !normal) continue;
			const dist = persp.position.distanceTo(base);
			const h = pxToWorld(persp, dist, 26, size.height);
			sprite.scale.set(h * aspect, h, 1);
			sprite.position.copy(base).addScaledVector(normal, pxToWorld(persp, dist, 16, size.height));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { ref: group });
}
var _v2 = new Vector3();
function CameraRig({ world, focus, spin, reduced, onPick, onHover }) {
	const { camera, gl } = useThree();
	const home = latLngToThetaPhi(HOME$1.lat, HOME$1.lng);
	const sph = (0, import_react.useRef)({
		theta: home.theta,
		phi: home.phi,
		radius: HOME$1.distance
	});
	const tween = (0, import_react.useRef)(null);
	const idle = (0, import_react.useRef)(performance.now());
	const dragging = (0, import_react.useRef)(false);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinch = (0, import_react.useRef)(null);
	const moved = (0, import_react.useRef)(0);
	const vel = (0, import_react.useRef)({
		theta: 0,
		phi: 0
	});
	const earth = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
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
			dur: reduced ? 220 : 1100
		};
		idle.current = performance.now();
	}, [
		focus.nonce,
		focus.lat,
		focus.lng,
		focus.distance,
		reduced
	]);
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		const raycaster = new Raycaster();
		const ndc = new Vector2();
		const readAt = (clientX, clientY) => {
			if (!earth.current) return null;
			const rect = el.getBoundingClientRect();
			ndc.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
			raycaster.setFromCamera(ndc, camera);
			const hits = raycaster.intersectObject(earth.current, false);
			if (!hits[0]) return null;
			return vectorToLatLng(hits[0].point);
		};
		const read = (event) => readAt(event.clientX, event.clientY);
		let lastTap = 0;
		let lastX = 0;
		let lastY = 0;
		let pending = 0;
		const onDown = (event) => {
			if (event.pointerType === "mouse" && event.button !== 0) return;
			window.clearTimeout(pending);
			vel.current.theta = 0;
			vel.current.phi = 0;
			pointers.current.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
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
		const onMove = (event) => {
			const prev = pointers.current.get(event.pointerId);
			pointers.current.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			if (pointers.current.size >= 2 && pinch.current) {
				const pts = [...pointers.current.values()];
				const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
				const ratio = dist / pinch.current;
				sph.current.radius = MathUtils.clamp(sph.current.radius / ratio, MIN_R, MAX_R);
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
				onHover(sel ? {
					name: sel.name,
					kind: sel.kind,
					x: event.clientX,
					y: event.clientY
				} : null);
				return;
			}
			const dx = event.clientX - prev.x;
			const dy = event.clientY - prev.y;
			moved.current += Math.abs(dx) + Math.abs(dy);
			const s = sph.current;
			const k = .0031 * (s.radius / 6.2);
			s.theta -= dx * k;
			s.phi = MathUtils.clamp(s.phi - dy * k, .18, Math.PI - .18);
			vel.current.theta = -dx * k;
			vel.current.phi = -dy * k;
			idle.current = performance.now();
		};
		const onUp = (event) => {
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
					toR: zoomIn ? Math.max(MIN_R, s.radius * .62) : Math.max(MIN_R, s.radius * .72),
					t0: now,
					dur: reduced ? 180 : 680
				};
				return;
			}
			const point = {
				x: event.clientX,
				y: event.clientY
			};
			pending = window.setTimeout(() => {
				onPick(pickAt(ll.lat, ll.lng, sph.current.radius, world.countries), point);
			}, 280);
		};
		const onWheel = (event) => {
			event.preventDefault();
			tween.current = null;
			vel.current.theta = 0;
			vel.current.phi = 0;
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
			const dy = MathUtils.clamp(event.deltaY * unit, -90, 90);
			const s = sph.current;
			const ll = readAt(event.clientX, event.clientY);
			if (ll && dy < 0) {
				const to = latLngToThetaPhi(ll.lat, ll.lng);
				const pull = Math.min(.16, Math.abs(dy) / 520);
				s.theta = lerpAngle(s.theta, to.theta, pull);
				s.phi = MathUtils.lerp(s.phi, to.phi, pull);
			}
			s.radius = MathUtils.clamp(s.radius * Math.exp(dy * .0016), MIN_R, MAX_R);
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
	}, [
		camera,
		gl,
		onHover,
		onPick,
		reduced,
		world.countries
	]);
	useFrame((_, delta) => {
		const d = Math.min(delta, .05);
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
			if (Math.abs(v.theta) > 2e-5 || Math.abs(v.phi) > 2e-5) {
				s.theta += v.theta;
				s.phi = MathUtils.clamp(s.phi + v.phi, .18, Math.PI - .18);
				v.theta *= .9;
				v.phi *= .9;
			} else if (spin && performance.now() - idle.current > 4200) s.theta += d * .045;
		}
		const r = s.radius;
		camera.position.set(-r * Math.sin(s.phi) * Math.cos(s.theta), r * Math.cos(s.phi), r * Math.sin(s.phi) * Math.sin(s.theta));
		camera.lookAt(0, 0, 0);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		ref: earth,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			2,
			64,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			transparent: true,
			opacity: 0,
			depthWrite: false
		})]
	});
}
function GlobeScene({ world, focus, selection, spin, reduced, night, onPick, onHover }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [night ? "#03050a" : "#5eace8"]
		}),
		night ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
				intensity: .05,
				color: "#141820"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#ffc98a",
				"#05070c",
				.16
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
				intensity: .72,
				color: "#fff6ee"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#fff4e4",
				"#2a5f96",
				.38
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					5.5,
					2.4,
					3.2
				],
				intensity: 1.25,
				color: "#fff8ee"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sky, {})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: night ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NightEarth, { world }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayEarth, { world })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clouds, { night }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jumps, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footprints, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmarks, { night }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivedBeacons, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusRing, { selection }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Labels, { selectedId: selection?.id }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, { night }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {
			world,
			focus,
			spin,
			reduced,
			onPick,
			onHover
		})
	] });
}
var HOME = {
	lat: 36,
	lng: -106,
	distance: 7.35,
	nonce: 0
};
var GlobeView = (0, import_react.memo)(function GlobeView({ world, focus, selection, spin, reduced, night, onPick, onHover }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
		camera: {
			fov: 38,
			near: .08,
			far: 140,
			position: [
				2.4,
				1.8,
				6.6
			]
		},
		dpr: [1, 1.6],
		gl: {
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeScene, {
			world,
			focus,
			selection,
			spin,
			reduced,
			night,
			onPick,
			onHover
		})
	});
});
var KIND_LABEL = {
	lived: "Lived",
	trail: "Footsteps",
	wonder: "Landmark",
	country: "Country"
};
function Atlas() {
	const [world, setWorld] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [selection, setSelection] = (0, import_react.useState)(null);
	const [focus, setFocus] = (0, import_react.useState)(HOME);
	const [hover, setHover] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(() => typeof window === "undefined" || window.matchMedia("(min-width: 861px)").matches);
	const [anchor, setAnchor] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("light");
	const [keyOpen, setKeyOpen] = (0, import_react.useState)(false);
	const reduced = (0, import_react.useMemo)(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
	const [spin, setSpin] = (0, import_react.useState)(!reduced);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const ctrl = new AbortController();
		setLoadError(null);
		fetch(publicUrl("/geo/world.json"), { signal: ctrl.signal }).then((res) => {
			if (!res.ok) throw new Error("Coastlines did not load");
			return res.json();
		}).then((raw) => {
			setWorld(buildWorld(raw));
		}).catch((err) => {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setLoadError(err instanceof Error ? err.message : "Coastlines did not load");
		});
		return () => ctrl.abort();
	}, [attempt]);
	const fly = (0, import_react.useCallback)((next, point, fromTour = false) => {
		if (!fromTour) setPlaying(false);
		setAnchor(point ?? null);
		setSelection(next);
		setFocus((current) => ({
			lat: next.lat,
			lng: next.lng,
			distance: next.distance,
			nonce: current.nonce + 1
		}));
	}, []);
	const onPick = (0, import_react.useCallback)((next, point) => {
		if (next) fly(next, point ?? null);
	}, [fly]);
	const onHover = (0, import_react.useCallback)((next) => {
		setHover((prev) => {
			if (!next && !prev) return prev;
			if (next && prev && next.name === prev.name && Math.abs(next.x - prev.x) < 3 && Math.abs(next.y - prev.y) < 3) return prev;
			return next;
		});
	}, []);
	const reset = (0, import_react.useCallback)(() => {
		setPlaying(false);
		setSelection(null);
		setAnchor(null);
		setFocus((current) => ({
			...HOME,
			nonce: current.nonce + 1
		}));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		const stops = COUNTRIES;
		let index = 0;
		let timer = 0;
		const step = () => {
			const stop = stops[index];
			if (!stop) {
				setPlaying(false);
				return;
			}
			setAnchor(null);
			setSelection(stop);
			setFocus((current) => ({
				lat: stop.lat,
				lng: stop.lng,
				distance: Math.min(stop.distance, 3.4),
				nonce: current.nonce + 1
			}));
			index += 1;
			timer = window.setTimeout(step, reduced ? 1600 : 2600);
		};
		step();
		return () => window.clearTimeout(timer);
	}, [playing, reduced]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") setSelection(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const q = query.trim().toLowerCase();
	const countryItems = COUNTRIES.filter((place) => !q || place.name.toLowerCase().includes(q));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "stage",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "globe-wrap",
				children: world ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeView, {
					world,
					focus,
					selection,
					spin,
					reduced,
					night: theme === "dark",
					onPick,
					onHover
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "globe-status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: loadError ?? "Drawing coastlines" }), loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-btn",
						onClick: () => setAttempt((n) => n + 1),
						children: "Try again"
					}) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hint",
				children: "Drag the earth to turn it. Scroll or pinch to zoom. Tap a place for a short note."
			}),
			hover ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hover-chip",
				style: {
					left: hover.x + 14,
					top: hover.y + 16
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: KIND_LABEL[hover.kind] ?? hover.kind }), hover.name]
			}) : null,
			selection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "detail",
				style: anchor ? {
					left: Math.min(Math.max(12, anchor.x + 14), window.innerWidth - 332),
					top: Math.min(Math.max(12, anchor.y - 8), window.innerHeight - 220),
					bottom: "auto"
				} : void 0,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: KIND_LABEL[selection.kind]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: selection.name }),
					selection.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "meta",
						children: selection.meta
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selection.detail }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-btn",
						onClick: () => setSelection(null),
						children: "Close"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "key-dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "key-toggle",
					"aria-expanded": keyOpen,
					onClick: () => setKeyOpen((open) => !open),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
						size: 16,
						strokeWidth: 1.75,
						"aria-hidden": "true"
					}), "Key"]
				}), keyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "key-pop",
					role: "dialog",
					"aria-label": "Map key",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Key"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "key key-lived" }), " Lived"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "key key-step" }), " Footsteps"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "key key-mark" }), " Landmark"] })
					] })]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: panelOpen ? "atlas-panel" : "atlas-panel is-closed",
				"aria-hidden": !panelOpen,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "sheet-handle",
						onClick: () => setPanelOpen(false),
						"aria-label": "Drop the panel down",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), "Hide"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "panel-head",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Personal atlas"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Footfall" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lede",
								children: "Outlines stay on every country. Names are only the places you have been."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "head-actions",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "text-btn",
										"aria-pressed": theme === "dark",
										onClick: () => setTheme((value) => value === "dark" ? "light" : "dark"),
										children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
											size: 15,
											strokeWidth: 1.75,
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
											size: 15,
											strokeWidth: 1.75,
											"aria-hidden": "true"
										}), theme === "dark" ? "Day" : "Night"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "text-btn",
										"aria-pressed": playing,
										onClick: () => setPlaying((value) => !value),
										children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
											size: 14,
											strokeWidth: 1.75,
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
											size: 14,
											strokeWidth: 1.75,
											"aria-hidden": "true"
										}), playing ? "Stop tour" : "Play the trail"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-btn",
										"aria-pressed": spin,
										onClick: () => setSpin((v) => !v),
										children: spin ? "Pause spin" : "Resume spin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "text-btn",
										onClick: reset,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
											size: 15,
											strokeWidth: 1.75,
											"aria-hidden": "true"
										}), "Reset view"]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "lived",
						"aria-label": "Places lived",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Places lived" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: LIVED.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "place-btn",
							"aria-current": selection?.id === place.id,
							onClick: () => fly(place),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "place-copy",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "place-name",
									children: place.name
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "years",
								children: place.meta
							})]
						}) }, place.id)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "index-block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Countries" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "search",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 15,
									strokeWidth: 1.75,
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Find a country",
									"aria-label": "Find a country"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "index",
								role: "list",
								children: [countryItems.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "index-btn",
									"aria-current": selection?.id === place.id,
									onClick: () => fly(place),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: place.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "index-meta",
										children: place.meta
									})]
								}) }, place.id)), countryItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "empty",
									children: "Nothing matches."
								}) : null]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "text-btn panel-hide",
						onClick: () => setPanelOpen(false),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							size: 16,
							strokeWidth: 1.75,
							"aria-hidden": "true"
						}), "Hide panel"]
					})
				]
			}),
			panelOpen ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "restore-panel",
				onClick: () => setPanelOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
					size: 16,
					strokeWidth: 1.75,
					"aria-hidden": "true"
				}), "Show countries"]
			})
		]
	});
}
var SplitComponent = Atlas;
//#endregion
export { SplitComponent as component };
