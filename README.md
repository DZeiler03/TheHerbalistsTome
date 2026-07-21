# The Herbalists Tome

A desktop-only digital leather-bound herbal encyclopedia by **Dominik Zeiler**.

Browse medicinal plants by **Continent → Country (flags) → Plant**, with bilingual **German / English** search and parchment page-turn animation.

## Stack

- Vite + vanilla TypeScript
- Static JSON data (`public/data/`)
- No backend required

## Features

- Elegant start page with leather atmosphere
- Pixel-styled brown leather book + parchment pages
- Navigation: Continent → Country → Plants (North & South America separate)
- Country flags (flagcdn)
- Search across DE + EN names and scientific names
- 175+ real plant specimens with factual entries only
- 60+ countries across six regions
- Pixel-art plant portraits on plant detail pages (with leaf fallback)

## Data

| File / path | Content |
|-------------|---------|
| `public/data/continents.json` | Continents (EN/DE) |
| `public/data/countries.json` | Countries + ISO flag codes |
| `public/data/plants/ids.json` | Ordered list of plant IDs |
| `public/data/plants/*.json` | Individual plant monographs (21) |
| `public/data/plants.json` | Aggregate dump of all plants (optional) |

Where reliable information is unavailable, fields use **Unknown**.

## Development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

```bash
npm run build   # prebuild plant images, tsc, vite build → dist/
npm run preview # preview production build
npm run images:check  # decode plants-b64 → PNG + coverage report
npm run lint
npm run format
npm run test
```

## Legal Notice

The information provided in **The Herbalists Tome** — including but not limited to
traditional uses, preparation methods, active compounds, and cautions — is compiled
for **educational and informational purposes only**. It does **not constitute medical
advice, diagnosis, or treatment**, and must **not be used as a substitute for
consultation with a physician, pharmacist, or other qualified healthcare
professional**. Always seek the advice of a qualified healthcare provider before
using any plant, herb, or plant-derived preparation for medicinal purposes,
particularly if you are pregnant, nursing, taking medication, or managing a health
condition.

Correct identification of wild plants requires expert botanical knowledge; many
medicinal plants closely resemble toxic species, and misidentification can result in
serious injury or death. Never harvest or consume a plant based solely on the
information in this application.

The author and contributors make no warranty, express or implied, regarding the
accuracy, completeness, or reliability of the content, and accept no liability for
any damage, injury, or adverse outcome resulting from the use or application of the
information contained herein.

## Responsive layout

The book scales from a large two-page desktop spread through tablet to a single-column
mobile parchment view. Extreme viewports may show a short usability notice.

## License

Content and code © Dominik Zeiler. Plant facts are compiled from well-established botanical and herbal knowledge for educational presentation.
