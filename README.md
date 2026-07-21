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
- Page-turn animation between views
- 90+ real plant specimens with factual entries only
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
npm run build   # production build → dist/
npm run preview # preview production build
```

## Desktop only

The UI is designed for desktop / laptop viewports. Smaller screens show a desktop-only notice.

## License

Content and code © Dominik Zeiler. Plant facts are compiled from well-established botanical and herbal knowledge for educational presentation.
