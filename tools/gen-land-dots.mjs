// Regenerates demo/travel/land.js (globe land dots) from Natural Earth 110m via world-atlas.
// Usage: node tools/gen-land-dots.mjs [out=demo/travel/land.js]
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url), 'utf8'));
const land = feature(topo, topo.objects.land);
const pts = [];
const step = 1.7;
for (let lat = -58; lat <= 80; lat += step) {
  const n = Math.round(360 * Math.cos(lat * Math.PI / 180) / step);
  for (let i = 0; i < n; i++) {
    const lon = -180 + i * 360 / n;
    if (geoContains(land, [lon, lat])) pts.push(Math.round(lon * 10), Math.round(lat * 10));
  }
}
writeFileSync(process.argv[2] || 'demo/travel/land.js', `// Land dots for the globe: [lon*10, lat*10, ...] generated from Natural Earth 110m (public domain) via world-atlas.\nexport default ${JSON.stringify(pts)};\n`);
console.log(pts.length / 2, 'dots');
