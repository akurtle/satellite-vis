import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import * as satellite from 'satellite.js';
import { calcRadiusSize, focusOnMarker, getColorofCircle, isValidUrl } from './HelperFunctions';
import SubHeader from './SubHeader';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: ('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: ('leaflet/dist/images/marker-icon.png'),
    shadowUrl: ('leaflet/dist/images/marker-shadow.png'),
});

// Helper: parses a block of TLE lines (two-line element sets)
function parseTLEText(tleText: string) {
    const lines = tleText.split('\n').map(l => l.trim()).filter(Boolean);
    const sets = [];
    for (let i = 0; i < lines.length;) {
        // Some TLE sources include a name line (3-line format). Support both.
        if (lines[i].startsWith('1 ') || lines[i].startsWith('2 ')) {
            // No name line, take lines[i] and lines[i+1]
            const line1 = lines[i];
            const line2 = lines[i + 1];
            sets.push({ name: 'Unknown', line1, line2 });
            i += 2;
        } else {
            // name line present
            const name = lines[i];
            const line1 = lines[i + 1];
            const line2 = lines[i + 2];
            sets.push({ name, line1, line2 });
            i += 3;
        }
    }
    return sets;
}

// Compute lat/lon from TLE at given JS Date using satellite.js
function tleToLatLon(tle: any, date = new Date()) {
    try {
        const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        const positionAndVelocity = satellite.propagate(satrec, date);

        if (positionAndVelocity == null) return;

        const positionEci = positionAndVelocity.position;
        if (!positionEci) return null;
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const lat = satellite.degreesLat(positionGd.latitude);
        const lon = satellite.degreesLong(positionGd.longitude);
        const heightKm = positionGd.height;
        return { lat, lon, heightKm };
    } catch (e) {
        return null;
    }
}

export const satellite_data_links = [
    ["100 (or so) Brightest", "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle"],
    ["Last 30 Days' Launches", "https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=tle"],
    ["Space Stations", "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"],
    ["Active Satellites", "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"]
]

export default function SatelliteVisualizer({ tleUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle', refreshMs = 20000000, maxSatellites = 200 }) {
    type TleSet = { name: string; line1: string; line2: string };

    type Positions = { name: string; lat: number; lon: number; heightKm: number; }

    const [tleSets, setTleSets] = useState<TleSet[]>([]);
    const [satPositions, setSatPositions] = useState<Positions[]>([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<number | null>(null);

    const [newTleUrl, setTleUrl] = useState<RequestInfo>(tleUrl);

    const map = useRef<L.Map | null>(null);


    const [activeIndex, setActiveIndex] = useState(0);

    const [inputValue, setNewValue] = useState<RequestInfo>(newTleUrl);

    var bounds = L.latLngBounds([[85, 180], [-85, -180]]);
    const center = bounds.getCenter();

    // or when tleUrl changes
    useEffect(() => {
        let cancelled = false;
        async function fetchTLE() {
            setLoading(true);
            try {


                const res = await fetch(`/api/tle?url=${encodeURIComponent(newTleUrl.toString())}`);


                const { tleText, source } = await res.json() as {
                    tleText: string;
                    source: "cache" | "origin";
                };


                const text = tleText;

                console.log("TLE from:", source);
                if (cancelled) return;


                const sets = parseTLEText(text).slice(0, maxSatellites);
                setTleSets(sets);
            } catch (e) {
                console.error('Failed to fetch TLE:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchTLE();
        return () => { cancelled = true; };
    }, [newTleUrl, maxSatellites, setTleUrl]);

    // Update satellite positions on an interval
    useEffect(() => {
        if (!tleSets.length) return;

        function updatePositions() {
            const now = new Date();

            const positions = tleSets.map(tle => {
                const pos = tleToLatLon(tle, now);
                return pos ? { ...pos, name: tle.name } : null;
            }).filter((p): p is Positions => p !== null);

            setSatPositions(positions);
        }

        updatePositions();
        timerRef.current = window.setInterval(updatePositions, refreshMs);
        return () => {
            if (timerRef.current != null) {
                clearInterval(timerRef.current);
            }
        };
    }, [tleSets, refreshMs]);

    async function tleUrlCheck(url: string) {
        if (!isValidUrl(url)) {
            console.error("Invalid URL format");
            return false;
        }

        try {
            const res = await fetch(url, { method: "HEAD" });

            // Check if server responds with success and text-like content
            const contentType = res.headers.get("content-type") || "";
            const okText = contentType.includes("text") || contentType.includes("plain");

            if (!res.ok) {
                console.error("URL is not reachable:", res.status);
                return false;
            }

            if (!okText) {
                console.error("URL does not appear to contain text/TLE data");
                return false;
            }

            return true
        } catch (err) {
            console.error("Network or CORS error:", err);
            return false;
        }
    }

    async function handleApplyUrl(url: string) {

        const ok = await tleUrlCheck(url);



        if (ok) {
            setTleUrl(url);
            console.log(newTleUrl)
        } else {
            console.log("error")
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewValue(event.target.value);
        console.log(event.target.value)
    };



    const handleLinkChange = (index: number, link: string) => {
        setActiveIndex(index);
        setNewValue(link);
        handleApplyUrl(link);
        console.log("Selected link:", link);
    };


    return (
        <div
            className="
      w-full min-h-screen flex flex-col
      bg-linear-to-t from-[#001219] via-[#003566] to-[#0A9396]
      text-white
    "
            id="visualizer"
        >

            <SubHeader
                handleLinkChange={handleLinkChange}
                activeIndex={activeIndex}
                handleChange={handleChange}
                handleApplyUrl={handleApplyUrl}
                inputValue={inputValue}
            />


            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                <div
                    className="
          lg:col-span-3
          rounded-3xl
          border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-[0_15px_60px_rgba(0,0,0,0.35)]
          overflow-hidden
        "
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <div className="flex flex-col">
                            <span className="text-sm text-white/70">Live positions</span>
                            <span className="text-lg font-semibold">Satellite Visualizer</span>
                        </div>

                        <div className="text-sm text-white/70">
                            Showing <span className="text-white font-semibold">{satPositions.length}</span>
                        </div>
                    </div>
                    <div className="h-[70vh] lg:h-[calc(100vh-180px)] p-3">
                        <div className="h-full rounded-2xl overflow-hidden border border-white/10">
                            <MapContainer
                                center={center}
                                zoom={2}
                                style={{ height: "100%", borderRadius: 16 }}
                                ref={map}
                                bounds={bounds}
                                maxBounds={bounds}
                            >
                                <TileLayer
                                    attribution="&copy; OpenStreetMap contributors"
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    noWrap={true}
                                />

                                {satPositions.map((s, i) => (
                                    <CircleMarker
                                        key={`${s.name}-${i}`}
                                        center={[s.lat, s.lon]}
                                        radius={calcRadiusSize(s.heightKm)}
                                        pane="markerPane"
                                        color={getColorofCircle(s.heightKm)}
                                    >
                                        <Popup>
                                            <div className="max-w-xs">
                                                <strong>{s.name}</strong>
                                                <div>Lat: {s.lat.toFixed(4)}</div>
                                                <div>Lon: {s.lon.toFixed(4)}</div>
                                                <div>Altitude: {s.heightKm.toFixed(1)} km</div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                <aside
                    className="
          lg:col-span-1
          rounded-3xl
          border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-[0_15px_60px_rgba(0,0,0,0.35)]
          overflow-hidden
        "
                >
                    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white/70">List</div>
                            <h2 className="text-lg font-semibold">
                                Satellites <span className="text-white/70">({satPositions.length})</span>
                            </h2>
                        </div>

                        {loading && (
                            <div className="text-xs text-white/70 rounded-full px-3 py-1 bg-white/10 border border-white/10">
                                Loading…
                            </div>
                        )}
                    </div>

                    <div className="p-3 h-[70vh] lg:h-[calc(100vh-180px)] overflow-auto">
                        <ul className="space-y-2">
                            {satPositions.map((s, i) => (
                                <li
                                    key={i}
                                    onClick={() => focusOnMarker(s.lat, s.lon, map)}
                                    className="
                  group cursor-pointer
                  rounded-2xl p-3
                  border border-white/10
                  bg-white/5
                  hover:bg-amber-400/15 hover:border-amber-400/40
                  transition
                "
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate text-white group-hover:text-amber-200">
                                                {s.name}
                                            </div>
                                            <div className="text-xs text-white/70">
                                                {s.lat.toFixed(3)}, {s.lon.toFixed(3)} — {s.heightKm.toFixed(1)} km
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
                                            focus
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );

}

//           {/* {filtered.map((sat, i) => (
// <li key={i} className="p-2 border rounded hover:border-amber-600 hover:bg-amber-200">
//     <Paper sx={{ p: 2 }}>
//         <Typography variant="h6">{sat.name}</Typography>
//         {/* <Typography>Country: {sat}</Typography> */}
//         <Typography>Altitude: {sat.heightKm} km</Typography>
//         <Typography>
//             {/* Status: {sat.active ? "🟢 Active" : "⚫ Inactive"} */}
//         </Typography>
//     </Paper>
// </li>
//))} *//