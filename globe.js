/* ════════════════════════════════════════════════════════════════════
   globe.js — interactive orthographic Earth with visitor markers
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Visitor & network data ──────────────────────────────────────────
  // Markers reflect Xueyang's professional network: study & work sites
  // (Melbourne, Leuven, Munich, Singapore, Hong Kong, Beijing, Suzhou,
  // Hangzhou, Shanghai) get heavier weight; major academic hubs around
  // them fill out the picture. Replace with real analytics anytime.
  // Format: [longitude, latitude, label, count]
  const VISITORS = [
    // ── Career / study hubs (highlighted) ─────────────────────────────
    [ 103.82,   1.35, 'Singapore · NTU',         3812 ],  // current
    [ 144.96, -37.81, 'Melbourne · UniMelb',     3204 ],  // PhD
    [   4.70,  50.88, 'Leuven · KU Leuven',      2218 ],  // joint PhD
    [  11.58,  48.14, 'Munich · TUM',            2014 ],  // MSc
    [ 116.40,  39.90, 'Beijing · Qualcomm',      2986 ],  // industry
    [ 120.59,  31.30, 'Suzhou · Momenta',        1872 ],  // industry
    [ 120.16,  30.27, 'Hangzhou · HDU',          1641 ],  // BEng
    [ 121.47,  31.23, 'Shanghai · Tongji',       1948 ],  // MSc
    [ 114.17,  22.32, 'Hong Kong · PolyU',       1428 ],  // visiting
    [   4.36,  52.01, 'Delft · TU Delft',         782 ],  // collaborator
    // ── Major academic regions ────────────────────────────────────────
    [ 139.69,  35.69, 'Tokyo, JP',                698 ],
    [ 135.50,  34.69, 'Osaka, JP',                219 ],
    [ 127.02,  37.53, 'Seoul, KR',                541 ],
    [ 121.56,  25.04, 'Taipei, TW',               387 ],
    [ 113.27,  23.13, 'Guangzhou, CN',            612 ],
    [ 114.06,  22.54, 'Shenzhen, CN',             724 ],
    [ 108.94,  34.34, 'Xi an, CN',                314 ],
    [ 104.07,  30.65, 'Chengdu, CN',              298 ],
    [ 151.21, -33.87, 'Sydney, AU',               508 ],
    [ 153.02, -27.47, 'Brisbane, AU',             231 ],
    [ 174.76, -36.85, 'Auckland, NZ',             142 ],
    // ── North America ─────────────────────────────────────────────────
    [ -79.99,  40.44, 'Pittsburgh · CMU',         812 ],
    [ -73.94,  40.66, 'New York, US',             921 ],
    [-122.43,  37.77, 'San Francisco',            894 ],
    [-118.24,  34.05, 'Los Angeles',              512 ],
    [ -87.65,  41.85, 'Chicago, US',              424 ],
    [ -71.06,  42.36, 'Boston · MIT',             712 ],
    [-123.12,  49.28, 'Vancouver, CA',            321 ],
    [ -79.38,  43.65, 'Toronto, CA',              394 ],
    [ -73.57,  45.50, 'Montréal, CA',             208 ],
    // ── Europe ────────────────────────────────────────────────────────
    [  -0.13,  51.51, 'London, UK',               712 ],
    [   2.35,  48.85, 'Paris, FR',                543 ],
    [   8.68,  50.11, 'Frankfurt, DE',            407 ],
    [  13.41,  52.52, 'Berlin, DE',               488 ],
    [   8.55,  47.37, 'Zurich, CH',               412 ],
    [   4.90,  52.37, 'Amsterdam, NL',            322 ],
    [  12.50,  41.90, 'Rome, IT',                 198 ],
    [  16.37,  48.21, 'Vienna, AT',               181 ],
    [  18.07,  59.33, 'Stockholm, SE',            142 ],
    // ── Other ─────────────────────────────────────────────────────────
    [  55.27,  25.20, 'Dubai, AE',                287 ],
    [  77.21,  28.61, 'Delhi, IN',                321 ],
    [  77.59,  12.97, 'Bangalore, IN',            503 ],
    [  72.83,  19.07, 'Mumbai, IN',               278 ],
    [ 100.50,  13.75, 'Bangkok, TH',              198 ],
    [ 106.83,  -6.21, 'Jakarta, ID',              176 ],
    [  18.42, -33.92, 'Cape Town, ZA',            122 ],
    [ -99.13,  19.43, 'Mexico City',              181 ],
    [ -46.63, -23.55, 'São Paulo',                152 ],
  ];

  // ── Init guard so the globe only initializes once ───────────────────
  let initialized = false;

  window.initGlobe = function initGlobe() {
    if (initialized) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
      console.warn('D3 or topojson not loaded yet — globe init deferred.');
      // Try again shortly
      setTimeout(initGlobe, 200);
      return;
    }
    initialized = true;

    const svgEl = document.getElementById('globe-svg');
    if (!svgEl) return;

    const stage  = svgEl.parentElement;
    const size   = Math.min(stage.clientWidth, stage.clientHeight) || 480;
    const margin = 12;
    const radius = (size / 2) - margin;

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // ── Color helpers that read from CSS variables ────────────────────
    function cssVar(name) {
      return getComputedStyle(document.body).getPropertyValue(name).trim();
    }
    function colors() {
      return {
        ocean:   cssVar('--surface'),
        land:    cssVar('--ink'),
        landAlt: cssVar('--ink-soft'),
        graticule: cssVar('--line'),
        accent:  cssVar('--accent'),
        accentSoft: cssVar('--accent-soft'),
        muted:   cssVar('--muted'),
        bg:      cssVar('--bg'),
      };
    }

    // ── Definitions: sphere gradient + atmospheric glow ───────────────
    const defs = svg.append('defs');

    const sphereGrad = defs.append('radialGradient')
      .attr('id', 'sphere-gradient')
      .attr('cx', '38%').attr('cy', '36%').attr('r', '70%');
    sphereGrad.append('stop').attr('offset', '0%')   .attr('stop-color', colors().bg).attr('stop-opacity', 1);
    sphereGrad.append('stop').attr('offset', '60%')  .attr('stop-color', colors().ocean).attr('stop-opacity', 1);
    sphereGrad.append('stop').attr('offset', '100%') .attr('stop-color', colors().ocean).attr('stop-opacity', 0.85);

    const glow = defs.append('radialGradient')
      .attr('id', 'sphere-glow')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '52%');
    glow.append('stop').attr('offset', '88%').attr('stop-color', colors().accent).attr('stop-opacity', 0);
    glow.append('stop').attr('offset', '100%').attr('stop-color', colors().accent).attr('stop-opacity', 0.18);

    // ── Projection ────────────────────────────────────────────────────
    const projection = d3.geoOrthographic()
      .scale(radius)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .rotate([-115, -20]);   // centered on East-Asia / Oceania

    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    // ── Layers ────────────────────────────────────────────────────────
    // Atmosphere glow
    svg.append('circle')
      .attr('cx', size/2).attr('cy', size/2)
      .attr('r', radius + 14)
      .attr('fill', 'url(#sphere-glow)');

    // Ocean (sphere)
    svg.append('circle')
      .attr('class', 'ocean')
      .attr('cx', size/2).attr('cy', size/2)
      .attr('r', radius)
      .attr('fill', 'url(#sphere-gradient)')
      .attr('stroke', colors().line)
      .attr('stroke-width', 1);

    const grLayer    = svg.append('g').attr('class', 'graticule-layer');
    const landLayer  = svg.append('g').attr('class', 'land-layer');
    const markerLayer = svg.append('g').attr('class', 'marker-layer');

    // ── Load world topology and render ────────────────────────────────
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(world => {
        const land      = topojson.feature(world, world.objects.land);
        const countries = topojson.feature(world, world.objects.countries);

        // Subtle graticule
        grLayer.append('path')
          .datum(graticule)
          .attr('class', 'graticule')
          .attr('fill', 'none')
          .attr('stroke', colors().graticule)
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '1 2')
          .attr('opacity', 0.7)
          .attr('d', path);

        // Land — country outlines, soft ink fill
        landLayer.selectAll('path.country')
          .data(countries.features)
          .join('path')
          .attr('class', 'country')
          .attr('d', path)
          .attr('fill', colors().land)
          .attr('fill-opacity', 0.88)
          .attr('stroke', colors().ocean)
          .attr('stroke-width', 0.35)
          .attr('vector-effect', 'non-scaling-stroke');

        // Highlight ring across the antarctic for charm
        landLayer.append('path')
          .datum(land)
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', colors().accent)
          .attr('stroke-width', 0.4)
          .attr('opacity', 0.3);

        renderMarkers();
      })
      .catch(err => {
        console.error('Failed to load world map:', err);
        // Even if map fails, draw markers on a plain sphere
        renderMarkers();
      });

    // ── Markers ───────────────────────────────────────────────────────
    function renderMarkers() {
      const markers = markerLayer.selectAll('g.marker')
        .data(VISITORS, d => d[2])
        .join(enter => {
          const g = enter.append('g').attr('class', 'marker');
          // Pulse ring
          g.append('circle')
            .attr('class', 'pulse')
            .attr('r', 1.5)
            .attr('fill', 'none')
            .attr('stroke', colors().accent)
            .attr('stroke-width', 1.2);
          // Main dot
          g.append('circle')
            .attr('class', 'dot')
            .attr('r', d => 1.5 + Math.log10(d[3]) * 0.9)
            .attr('fill', colors().accent)
            .attr('stroke', colors().bg)
            .attr('stroke-width', 0.5);
          return g;
        });

      updateMarkers();
      startPulse();
    }

    function updateMarkers() {
      const [lambda, phi] = projection.rotate();
      // Center of visible hemisphere on the globe
      const center = [-lambda, -phi];
      markerLayer.selectAll('g.marker').each(function (d) {
        const dist = d3.geoDistance(d, center);
        const visible = dist < Math.PI / 2 - 0.02;
        const [x, y] = projection(d);
        const sel = d3.select(this);
        if (visible && Number.isFinite(x)) {
          sel.attr('transform', `translate(${x}, ${y})`).attr('opacity', 1);
        } else {
          sel.attr('opacity', 0);
        }
      });
    }

    // Pulse animation — manual so we can stop/start cleanly
    function startPulse() {
      d3.timer((elapsed) => {
        const cycle = (elapsed % 2400) / 2400;
        const r = 1.5 + cycle * 10;
        const op = 1 - cycle;
        markerLayer.selectAll('g.marker .pulse')
          .attr('r', r)
          .attr('opacity', op * 0.7);
      });
    }

    // ── Auto-rotation ─────────────────────────────────────────────────
    let autoRotate = true;
    let lastTick = Date.now();

    d3.timer(() => {
      if (!autoRotate) { lastTick = Date.now(); return; }
      const now = Date.now();
      const dt = now - lastTick; lastTick = now;
      const r = projection.rotate();
      r[0] += dt * 0.012;
      projection.rotate(r);

      svg.selectAll('.graticule').attr('d', path);
      svg.selectAll('.country').attr('d', path);
      updateMarkers();
    });

    // ── Drag interaction ──────────────────────────────────────────────
    let resumeTimer = null;
    const drag = d3.drag()
      .on('start', () => {
        autoRotate = false;
        if (resumeTimer) clearTimeout(resumeTimer);
      })
      .on('drag', (event) => {
        const r = projection.rotate();
        const k = 0.4; // sensitivity
        projection.rotate([
          r[0] + event.dx * k,
          Math.max(-90, Math.min(90, r[1] - event.dy * k)),
        ]);
        svg.selectAll('.graticule').attr('d', path);
        svg.selectAll('.country').attr('d', path);
        updateMarkers();
      })
      .on('end', () => {
        // resume auto-rotate after a beat
        resumeTimer = setTimeout(() => { autoRotate = true; }, 2200);
      });

    svg.call(drag);

    // ── Recolor on theme change ───────────────────────────────────────
    window.addEventListener('themechange', () => {
      const c = colors();
      svg.selectAll('.ocean').attr('fill', 'url(#sphere-gradient)').attr('stroke', c.line);
      svg.selectAll('.graticule').attr('stroke', c.graticule);
      svg.selectAll('.country').attr('fill', c.land).attr('stroke', c.ocean);
      svg.selectAll('g.marker .dot').attr('fill', c.accent).attr('stroke', c.bg);
      svg.selectAll('g.marker .pulse').attr('stroke', c.accent);

      // Re-stop and update gradients
      sphereGrad.selectAll('stop')
        .data([
          [0, c.bg, 1],
          [0.6, c.ocean, 1],
          [1, c.ocean, 0.85],
        ])
        .attr('stop-color', d => d[1])
        .attr('stop-opacity', d => d[2]);

      glow.selectAll('stop')
        .data([[0.88, c.accent, 0], [1, c.accent, 0.18]])
        .attr('stop-color', d => d[1])
        .attr('stop-opacity', d => d[2]);
    });
  };

  // If user lands directly on #globe, kick off the init right away
  if (location.hash === '#globe') {
    setTimeout(window.initGlobe, 100);
  }
})();
