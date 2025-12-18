
export function focusOnMarker(lat: number, lang: number, map:any) {

    map.current?.flyTo([lat, lang], 5);

}

export function calcRadiusSize(size: number) {
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

export function getColorofCircle(size: number) {
    if (size > 1000) {
        return 'red';
    } else {
        return 'blue';
    }
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}


