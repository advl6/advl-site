// Link-preview images: a screenshot of each page (Ariana, 11/14: "card styles can be the pages").
// Serve public/ locally with extensionless .html support on :8790, then: node tools/og_shots.js && python3 tools/build_pages.py
// Home and Parking Lot keep img/og.jpg (they need the 3D library / the message store, which a local run may not reach).
const { chromium } = require('playwright'); const fs = require('fs');
const D = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));
const paths = ['projects', 'works', 'background', 'about', 'resume', 'artifacts', ...D.projects.filter(p => !p.off && p.path).map(p => p.path)];
(async () => { const b = await chromium.launch(); fs.mkdirSync('public/img/og', { recursive: true });
  for (const k of paths) { const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await p.goto('http://localhost:8790/' + k); await p.waitForTimeout(k === 'artifacts' ? 9000 : 5200);
    await p.screenshot({ path: 'public/img/og/' + k + '.jpg', type: 'jpeg', quality: 84 }); await p.close(); console.log(k); }
  await b.close(); })();
