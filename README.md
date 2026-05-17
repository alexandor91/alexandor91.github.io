# Xueyang Kang — Personal Research Portfolio

A clean, cartographic-editorial personal site featuring a sticky sidebar,
SPA-style submenu navigation, and an interactive D3 orthographic globe
visualizing the international reach of the research network.

Live at: **https://alexandor91.github.io/profiles_web/**

## File layout

```
profiles_web/
├── index.html              ← the only page — all "sub-pages" live inside
├── style.css               ← all styles + dark-mode tokens
├── main.js                 ← routing, theme toggle, filters, animations
├── globe.js                ← D3 Earth with pulsing markers (career network)
├── CV-Xueyang-Kang.pdf     ← place your CV here so the sidebar button works
└── (optional) profile.jpg  ← replace the GitHub avatar with your own portrait
```

Drop all of these at the root of `profiles_web` repo. No build step.
No dependencies to install.

## Sections (six "sub-pages")

| #  | Hash             | Contents                                                        |
|----|------------------|-----------------------------------------------------------------|
| 01 | `#about`         | Bio, news (with expand-older), full education timeline          |
| 02 | `#research`      | Four research pillars + four paper highlights                   |
| 03 | `#publications`  | Filterable list (topic + year), plus an "Under Review" block    |
| 04 | `#career`        | Position timeline, patents, tools & skills, hobbies             |
| 05 | `#globe`         | Interactive rotating Earth + region stats                       |
| 06 | `#contact`       | Email · Mobile · WeChat · ORCID · Affiliation                   |

Direct deep-links work (e.g. `…/profiles_web/#publications`), and arrow
keys cycle through the six sections.

## Customizing in five minutes

### 1. Profile photo

Replace the `<img src="...">` in the sidebar with your portrait
(square works best). If the URL fails to load, the page falls back to
the serif monogram **XK**.

You can drop a `profile.jpg` next to `index.html` and change the src to
`src="profile.jpg"`.

### 2. Your CV PDF

The "Curriculum Vitæ" button points to `CV-Xueyang-Kang.pdf` at the
site root. Drop the PDF there with that exact name and it'll just work.

### 3. Adding a news entry

In `index.html`, find the `<ul class="news-list">` and prepend:

```html
<li>
  <time class="news-date" datetime="2026-05">May 2026</time>
  <p>Your news item here. <a href="#">[link]</a></p>
</li>
```

Add `class="hidden-news"` to push older items behind the "Older news"
disclosure.

### 4. Adding a publication

Add a new `<article class="pub">` inside `<div class="pub-list">`.
Use `data-tags` to make it filterable:

```html
<article class="pub" data-tags="generation 2026">
  <div class="pub-media"><div class="placeholder-img small">▦</div></div>
  <div class="pub-body">
    <h4>Your Paper Title</h4>
    <p class="authors"><strong>Xueyang Kang</strong>★ et al.</p>
    <p class="venue">
      <span class="venue-tag">VENUE 2026</span>
      <span class="venue-tag alt">Oral</span>
      <a href="#">paper</a> · <a href="#">code</a>
    </p>
  </div>
</article>
```

Keep `data-tags` values in sync with the filter buttons above the list.

### 5. Updating the globe

In `globe.js`, find the `VISITORS` array near the top. Format:

```js
[ longitude, latitude, 'Label', count ]
```

The marker radius is computed from `count` (log-scaled), so accurate
relative numbers are more important than absolute ones. To wire it to
real analytics (Plausible, GoatCounter, Cloudflare, etc.), fetch their
JSON and replace `VISITORS` at runtime.

To recenter the globe's starting view, change:

```js
.rotate([-115, -20])   // currently centered on East-Asia / Oceania
```

The first number is longitude (negative = east), the second is latitude.

## What's already on the page

Pre-populated from your CV — adjust freely:

- **Sidebar**: name, role (Research Fellow), affiliation (NTU Singapore),
  5 social icons (email · GitHub · Scholar · ORCID · LinkedIn), CV button.
- **About**: bio mentioning UniMelb / KU Leuven / TUM / Tongji / HDU,
  10 news items (4 collapsed), 4 education rows.
- **Research**: 4 pillars (Generative 3D, Reconstruction & Registration,
  Geometry Representation, Robotic Fusion Sensing), 4 highlight tiles
  pointing to your top papers.
- **Publications**: 8 first-author papers from your CV with topic/year
  filters; 7 "Under Review" entries.
- **Career**: 6-row position timeline (NTU → Telstra → HK PolyU →
  Momenta → Qualcomm → TUM), 3 patents, 4 skill groups.
- **Globe**: 50 markers — your 10 career hubs are weighted highest
  (Singapore, Melbourne, Leuven, Munich, Beijing, Suzhou, Hangzhou,
  Shanghai, HK, Delft).
- **Contact**: kangxueyang@126.com · +86 18221799938 · Alexandorcaisyo
  · ORCID 0000-0001-7159-676X.

## Color palette

All colors are CSS variables at the top of `style.css`:

```css
:root {
  --bg:        #F4EEE2;   /* warm parchment */
  --ink:       #1A1814;   /* warm black */
  --accent:    #B85C38;   /* terracotta */
  --secondary: #2C4A52;   /* deep teal */
  ...
}
```

Tweak these to retheme the entire site. A dark theme is already wired
— toggle it with the sun/moon button in the top right.

## Deploying

```bash
git add .
git commit -m "Publish portfolio"
git push origin main
```

GitHub Pages will rebuild within ~1 minute. Verify in repository
**Settings → Pages** that the source is your default branch / root.

## Credits

Design: cartographic-editorial aesthetic — informed by clean academic
CMU-style portfolios combined with a stronger typographic system
(Instrument Serif + Manrope + JetBrains Mono) and a globe-centric reach
visualization built on D3 + topojson.
