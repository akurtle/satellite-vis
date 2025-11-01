// SatelliteVisualizer.jsx
// Requires: react, react-dom, react-leaflet, leaflet, satellite.js, tailwindcss
// Install with: npm i react-leaflet leaflet satellite.js

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import * as satellite from 'satellite.js';
import { Button, Grid, Input, Paper, Typography } from '@mui/material';
import SearchBar from './Search';
import SatelliteFilters from './Filters';

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

export default function SatelliteVisualizer({ tleUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', refreshMs = 2000, maxSatellites = 200 }) {
    type TleSet = { name: string; line1: string; line2: string };

    type Positions = { name: string; lat: number; lon: number; heightKm: number; }

    const [tleSets, setTleSets] = useState<TleSet[]>([]);
    const [satPositions, setSatPositions] = useState<Positions[]>([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<number | null>(null);

    const [newTleUrl, setTleUrl] = useState<RequestInfo>(tleUrl);

    const map = useRef<L.Map | null>(null);


    const [selected, setSelected] = useState<any | null>(null);

    const [inputValue, setNewValue] = useState<RequestInfo>(newTleUrl);

    var bounds = L.latLngBounds([[85, 180], [-85, -180]]);
    const center = bounds.getCenter();

    // or when tleUrl changes
    useEffect(() => {
        let cancelled = false;
        async function fetchTLE() {
            setLoading(true);
            console.log(newTleUrl)
            try {
                const res = await fetch(newTleUrl);
                const text = await res.text();
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
        timerRef.current = setInterval(updatePositions, refreshMs);
        return () => clearInterval(timerRef.current!);
    }, [tleSets, refreshMs]);


    // useEffect(() => {
    //     const leafletMap = map.current;
    //     const worldBounds = new LatLngBounds([-88, -180], [88, 180]);

    //     if (leafletMap == null) return

    //     leafletMap.on('drag', () => {
    //         leafletMap.panInsideBounds(worldBounds, { animate: false });
    //     });

    // }, [map]);

    // let center = [0, 0]

    function focusOnMarker(lat: any, lang: any) {

        map.current?.flyTo([lat, lang], 5);

    }

    function calcRadiusSize(size: number) {
        const minRadius = 2;
        const maxRadius = 15;
        const maxDistance = 40000; // 40,000 km (roughly GEO orbit)
        const minDistance = 200;   // 200 km (LEO)

        // Normalizing the distance
        const normalized = Math.min(Math.max((size - minDistance) / (maxDistance - minDistance), 0), 1);

        // Invert so closer = larger
        const radius = maxRadius - normalized * (maxRadius - minRadius);

        return radius;
    }

    function getColorofCircle(size: number) {
        if (size > 1000) {
            return 'red';
        } else {
            return 'blue';
        }
    }

    function isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }


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

        console.log(ok)

        console.log(url)

        console.log(inputValue);

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


    return (
        <div className="w-full h-fit flex flex-col  bg-[#003566]" id='visualizer'>


            <header className='flex p-[2%] mt-[2%] bg-[#001219]/90 backdrop-blur-md justify-around items-center '>
                <div className='text-white'>
                    Current URL: {newTleUrl.toString()}
                </div>
                <div className='flex gap-3'>
                    <Input className='px-3  bg-white w-[500px] rounded-3xl after:content-[""] after:absolute after:inset-0
                    after:rounded-3xl after:border-2 
                    after:border-amber-600 ' onChange={handleChange}></Input>
                    <div className='bg-[#0A9396] hover:bg-[#94D2BD] text-black rounded-3xl transition'>
                        <Button onClick={() => (handleApplyUrl(inputValue.toString()))} className='text-black!'>Search</Button>
                    </div>
                </div>
            </header>


            {/* <SatelliteFilters data={filtered} onFilterChange={setFiltered} /> */}
            <div className="flex-1 grid grid-cols-4 gap-4 p-4">
                <div className="col-span-3 bg-white rounded-2xl shadow p-2">
                    <MapContainer center={center} zoom={2} style={{ height: '100%', borderRadius: 12 }} ref={map} bounds={bounds} maxBounds={bounds}>
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            noWrap={true}

                        />

                        {satPositions.map((s, i) => (
                            <CircleMarker key={`${s.name}-${i}`} center={[s.lat, s.lon]} radius={calcRadiusSize(s.heightKm)} pane="markerPane" color={getColorofCircle(s.heightKm)} >
                                <Popup >
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
                <aside className="col-span-1 bg-white h-screen rounded-2xl shadow p-4 overflow-auto">
                    <div className='flex'>
                        <h2 className="font-semibold ">Satellites ({satPositions.length})</h2>
                        <SearchBar data={satPositions} onSelect={setSelected} />

                    </div>
                    {loading && <div className="text-sm text-slate-500">Loading TLE data...</div>}
                    <ul className="text-sm space-y-2  overflow-visible">
                        {satPositions.map((s, i) => (
                            <li key={i} className="p-2 border rounded hover:border-amber-600 hover:bg-amber-200" onClick={() => focusOnMarker(s.lat, s.lon)}>
                                <div className="font-medium truncate">{s.name}</div>
                                <div className="text-xs opacity-75">{s.lat.toFixed(3)}, {s.lon.toFixed(3)} — {s.heightKm.toFixed(1)} km</div>
                            </li>
                        ))}


                    </ul>
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