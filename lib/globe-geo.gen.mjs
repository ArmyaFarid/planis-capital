import fs from "node:fs"
import { geoContains } from "d3-geo"

// Sample a lat/lng grid and keep the points that fall on land, tagging African ones so the
// globe can light that continent in the brand accent.
const STEP = 1.6 // degrees — ~4-6k points, dense enough to read as a continent, cheap to draw

const raw = JSON.parse(fs.readFileSync("./ne110m.json", "utf8"))

const africa = {
    type: "FeatureCollection",
    features: raw.features.filter((f) => f.properties.CONTINENT === "Africa"),
}
const world = { type: "FeatureCollection", features: raw.features }

const land = []
const afr = []

for (let lat = -84; lat <= 84; lat += STEP) {
    // Keep dot density roughly even instead of bunching at the poles.
    const lngStep = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.05)
    for (let lng = -180; lng <= 180; lng += lngStep) {
        const pt = [lng, lat]
        if (!geoContains(world, pt)) continue
        const isAfrica = geoContains(africa, pt)
        const r = (v) => Math.round(v * 100) / 100
        if (isAfrica) afr.push(r(lat), r(lng))
        else land.push(r(lat), r(lng))
    }
}

// Real coordinates for the markers.
const CITIES = [
    { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
    { name: "Dakar", lat: 14.7167, lng: -17.4677 },
    { name: "Abidjan", lat: 5.3599, lng: -4.0083 },
    { name: "Accra", lat: 5.6037, lng: -0.1869 },
    { name: "Lagos", lat: 6.5244, lng: 3.3792 },
    { name: "Cairo", lat: 30.0444, lng: 31.2357 },
    { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
    { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
]

const ARCS = [
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 0],
    [0, 5],
    [5, 6],
    [4, 6],
    [6, 7],
]

const out = `// GENERATED FILE — do not hand-edit.
// Land points sampled from Natural Earth 1:110m on a ${STEP}° grid, split into African and
// rest-of-world so the globe can light Africa in the accent colour.
// Regenerate with lib/globe-geo.gen.mjs (needs d3-geo, dev-only).

/** Flat [lat, lng, lat, lng, ...] — flat arrays keep the payload small. */
export const AFRICA_POINTS: number[] = ${JSON.stringify(afr)}

export const WORLD_POINTS: number[] = ${JSON.stringify(land)}

export interface GlobeCity {
    name: string
    lat: number
    lng: number
}

export const GLOBE_CITIES: GlobeCity[] = ${JSON.stringify(CITIES, null, 4)}

/** Index pairs into GLOBE_CITIES. */
export const GLOBE_ARCS: [number, number][] = ${JSON.stringify(ARCS)}
`

fs.writeFileSync("./globe-geo.ts", out)
console.log("africa points:", afr.length / 2)
console.log("world points:", land.length / 2)
console.log("kb:", Math.round(out.length / 1024))
