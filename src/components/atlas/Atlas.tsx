import { Canvas } from "@react-three/fiber";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, KeyRound, Moon, Play, RotateCcw, Search, Square, Sun } from "lucide-react";
import { GlobeScene } from "@/components/globe/Scene";
import { COUNTRIES, LIVED, type Selection } from "@/data/places";
import { buildWorld, type WorldData } from "@/lib/world";
import { publicUrl } from "@/lib/globe-math";

type Focus = { lat: number; lng: number; distance: number; nonce: number };
type Hover = { name: string; kind: string; x: number; y: number };

const HOME: Focus = { lat: 36, lng: -106, distance: 7.35, nonce: 0 };

const GlobeView = memo(function GlobeView({
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
  focus: Focus;
  selection: Selection | null;
  spin: boolean;
  reduced: boolean;
  night: boolean;
  onPick: (selection: Selection | null, point?: { x: number; y: number }) => void;
  onHover: (hover: Hover | null) => void;
}) {
  return (
    <Canvas
      camera={{ fov: 38, near: 0.08, far: 140, position: [2.4, 1.8, 6.6] }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <GlobeScene
        world={world}
        focus={focus}
        selection={selection}
        spin={spin}
        reduced={reduced}
        night={night}
        onPick={onPick}
        onHover={onHover}
      />
    </Canvas>
  );
});

const KIND_LABEL: Record<Selection["kind"], string> = {
  lived: "Lived",
  trail: "Footsteps",
  wonder: "Landmark",
  country: "Country",
};

export function Atlas() {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Focus>(HOME);
  const [hover, setHover] = useState<Hover | null>(null);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 861px)").matches,
  );
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [keyOpen, setKeyOpen] = useState(false);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [spin, setSpin] = useState(!reduced);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoadError(null);
    fetch(publicUrl("/geo/world.json"), { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Coastlines did not load");
        return res.json();
      })
      .then((raw) => {
        setWorld(buildWorld(raw));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(err instanceof Error ? err.message : "Coastlines did not load");
      });
    return () => ctrl.abort();
  }, [attempt]);

  const fly = useCallback((next: Selection, point?: { x: number; y: number } | null, fromTour = false) => {
    if (!fromTour) setPlaying(false);
    setAnchor(point ?? null);
    setSelection(next);
    setFocus((current) => ({
      lat: next.lat,
      lng: next.lng,
      distance: next.distance,
      nonce: current.nonce + 1,
    }));
  }, []);

  const onPick = useCallback(
    (next: Selection | null, point?: { x: number; y: number }) => {
      if (next) fly(next, point ?? null);
    },
    [fly],
  );

  const onHover = useCallback((next: Hover | null) => {
    setHover((prev) => {
      if (!next && !prev) return prev;
      if (
        next &&
        prev &&
        next.name === prev.name &&
        Math.abs(next.x - prev.x) < 3 &&
        Math.abs(next.y - prev.y) < 3
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setSelection(null);
    setAnchor(null);
    setFocus((current) => ({ ...HOME, nonce: current.nonce + 1 }));
  }, []);

  useEffect(() => {
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
        nonce: current.nonce + 1,
      }));
      index += 1;
      timer = window.setTimeout(step, reduced ? 1600 : 2600);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [playing, reduced]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const countryItems = COUNTRIES.filter((place) => !q || place.name.toLowerCase().includes(q));

  return (
    <main className="stage">
      <div className="globe-wrap">
        {world ? (
          <GlobeView
            world={world}
            focus={focus}
            selection={selection}
            spin={spin}
            reduced={reduced}
            night={theme === "dark"}
            onPick={onPick}
            onHover={onHover}
          />
        ) : (
          <div className="globe-status">
            <p>{loadError ?? "Drawing coastlines"}</p>
            {loadError ? (
              <button type="button" className="text-btn" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
            ) : null}
          </div>
        )}
      </div>

      <p className="hint">Drag the earth to turn it. Scroll or pinch to zoom. Tap a place for a short note.</p>

      {hover ? (
        <div className="hover-chip" style={{ left: hover.x + 14, top: hover.y + 16 }}>
          <span>{KIND_LABEL[hover.kind as Selection["kind"]] ?? hover.kind}</span>
          {hover.name}
        </div>
      ) : null}

      {selection ? (
        <article
          className="detail"
          style={
            anchor
              ? {
                  left: Math.min(Math.max(12, anchor.x + 14), window.innerWidth - 332),
                  top: Math.min(Math.max(12, anchor.y - 8), window.innerHeight - 220),
                  bottom: "auto",
                }
              : undefined
          }
        >
          <p className="eyebrow">{KIND_LABEL[selection.kind]}</p>
          <h2>{selection.name}</h2>
          {selection.meta ? <p className="meta">{selection.meta}</p> : null}
          <p>{selection.detail}</p>
          <button type="button" className="text-btn" onClick={() => setSelection(null)}>
            Close
          </button>
        </article>
      ) : null}

      <div className="key-dock">
        <button
          type="button"
          className="key-toggle"
          aria-expanded={keyOpen}
          onClick={() => setKeyOpen((open) => !open)}
        >
          <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />
          Key
        </button>
        {keyOpen ? (
          <div className="key-pop" role="dialog" aria-label="Map key">
            <p className="eyebrow">Key</p>
            <ul>
              <li><i className="key key-lived" /> Lived</li>
              <li><i className="key key-step" /> Footsteps</li>
              <li><i className="key key-mark" /> Landmark</li>
            </ul>
          </div>
        ) : null}
      </div>
      <aside className={panelOpen ? "atlas-panel" : "atlas-panel is-closed"} aria-hidden={!panelOpen}>
        <button type="button" className="sheet-handle" onClick={() => setPanelOpen(false)} aria-label="Drop the panel down">
          <span />
          Hide
        </button>
        <header className="panel-head">
          <p className="eyebrow">Personal atlas</p>
          <h1>Footfall</h1>
          <p className="lede">
            Outlines stay on every country. Names are only the places you have been.
          </p>
          <div className="head-actions">
            <button
              type="button"
              className="text-btn"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={15} strokeWidth={1.75} aria-hidden="true" /> : <Moon size={15} strokeWidth={1.75} aria-hidden="true" />}
              {theme === "dark" ? "Day" : "Night"}
            </button>
            <button type="button" className="text-btn" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>
              {playing ? <Square size={14} strokeWidth={1.75} aria-hidden="true" /> : <Play size={14} strokeWidth={1.75} aria-hidden="true" />}
              {playing ? "Stop tour" : "Play the trail"}
            </button>
            <button type="button" className="text-btn" aria-pressed={spin} onClick={() => setSpin((v) => !v)}>
              {spin ? "Pause spin" : "Resume spin"}
            </button>
            <button type="button" className="text-btn" onClick={reset}>
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
              Reset view
            </button>
          </div>
        </header>

        <section className="lived" aria-label="Places lived">
          <h2>Places lived</h2>
          <ul>
            {LIVED.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className="place-btn"
                  aria-current={selection?.id === place.id}
                  onClick={() => fly(place)}
                >
                  <span className="place-copy">
                    <span className="place-name">{place.name}</span>
                  </span>
                  <span className="years">{place.meta}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="index-block">
          <h2>Countries</h2>
          <label className="search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a country"
              aria-label="Find a country"
            />
          </label>

          <ul className="index" role="list">
            {countryItems.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className="index-btn"
                  aria-current={selection?.id === place.id}
                  onClick={() => fly(place)}
                >
                  <span>{place.name}</span>
                  <span className="index-meta">{place.meta}</span>
                </button>
              </li>
            ))}
            {countryItems.length === 0 ? <li className="empty">Nothing matches.</li> : null}
          </ul>
        </div>

        <button type="button" className="text-btn panel-hide" onClick={() => setPanelOpen(false)}>
          <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
          Hide panel
        </button>
      </aside>
      {panelOpen ? null : (
        <button type="button" className="restore-panel" onClick={() => setPanelOpen(true)}>
          <ChevronUp size={16} strokeWidth={1.75} aria-hidden="true" />
          Show countries
        </button>
      )}
    </main>
  );
}
