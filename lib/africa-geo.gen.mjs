import fs from "node:fs"
import { geoMercator, geoPath } from "d3-geo"
import { topology } from "topojson-server"
import { merge } from "topojson-client"

const W = 520
const H = 580

const raw = JSON.parse(fs.readFileSync("./ne110m.json", "utf8"))

// Natural Earth tags Africa on CONTINENT. Keep everything so the silhouette is complete.
const features = raw.features.filter((f) => f.properties.CONTINENT === "Africa")

const fc = { type: "FeatureCollection", features }

const projection = geoMercator().fitExtent(
    [
        [8, 8],
        [W - 8, H - 8],
    ],
    fc,
)

// Round to 1dp: at this render size sub-pixel precision is invisible but doubles file size.
const path = geoPath(projection).digits(1)

const countries = features
    .map((f) => ({
        id: f.properties.ISO_A3 && f.properties.ISO_A3 !== "-99" ? f.properties.ISO_A3 : f.properties.NAME,
        name: f.properties.NAME,
        d: path(f),
    }))
    .filter((c) => c.d)
    // Draw largest-area first so tiny states stay on top and stagger reads outside-in.
    .sort((a, b) => b.d.length - a.d.length)

// Dissolve the internal borders into one silhouette — this is what the draw-on stroke traces.
const topo = topology({ africa: fc }, 1e5)
const outlineGeo = merge(topo, topo.objects.africa.geometries)
const outline = path(outlineGeo)

// Real coordinates, projected through the SAME projection so nodes land in the right country.
const CITIES = [
    { name: "Casablanca", lon: -7.5898, lat: 33.5731 },
    { name: "Cairo", lon: 31.2357, lat: 30.0444 },
    { name: "Dakar", lon: -17.4677, lat: 14.7167 },
    { name: "Abidjan", lon: -4.0083, lat: 5.3599 },
    { name: "Accra", lon: -0.1869, lat: 5.6037 },
    { name: "Lagos", lon: 3.3792, lat: 6.5244 },
    { name: "Nairobi", lon: 36.8219, lat: -1.2921 },
    { name: "Johannesburg", lon: 28.0473, lat: -26.2041 },
]

const nodes = CITIES.map((c) => {
    const [x, y] = projection([c.lon, c.lat])
    return { name: c.name, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
})

// Trade-route arcs between the nodes, west -> east -> south.
const ARCS = [
    [2, 3],
    [3, 4],
    [4, 5],
    [2, 0],
    [0, 1],
    [1, 6],
    [5, 6],
    [6, 7],
]

const out = `// GENERATED FILE — do not hand-edit.
// Source: Natural Earth 1:110m admin_0_countries, CONTINENT === "Africa" (${countries.length} features).
// Projection: d3-geo geoMercator().fitExtent([[8,8],[${W - 8},${H - 8}]]) — city nodes below are
// projected through that same projection, so they land on the correct country.
// Regenerate with scratchpad/gen-africa.mjs if the viewBox ever changes.

export const AFRICA_VIEWBOX = "0 0 ${W} ${H}"

/** Internal borders dissolved into a single silhouette — traced by the draw-on stroke. */
export const AFRICA_OUTLINE = "${outline}"

export interface AfricaCountry {
    id: string
    name: string
    d: string
}

export const AFRICA_COUNTRIES: AfricaCountry[] = ${JSON.stringify(countries, null, 4)}

export interface AfricaNode {
    name: string
    x: number
    y: number
}

export const AFRICA_NODES: AfricaNode[] = ${JSON.stringify(nodes, null, 4)}

/** Index pairs into AFRICA_NODES. */
export const AFRICA_ARCS: [number, number][] = ${JSON.stringify(ARCS)}
`

fs.writeFileSync("./africa-geo.ts", out)

console.log("countries:", countries.length)
console.log("bytes:", out.length)
console.log("nodes:")
for (const n of nodes) console.log(`  ${n.name.padEnd(14)} ${n.x}, ${n.y}`)
