# devbug

A developer Swiss army knife — a collection of small, self-contained tools useful for day-to-day dev work. Minimal external dependencies; each tool works without a backend.

## Tools

| Route | Description |
|---|---|
| `/chronometer` | Stopwatch with lap tracking |
| `/text-analizer` | Word count, character stats, pattern matching |
| `/chmod-generator` | Unix file permissions calculator |
| `/json-minifier` | Minify or prettify JSON with size comparison |
| `/jwt-decoder` | Decode and inspect JWT tokens (header, payload, expiry) |
| `/base64` | Encode / decode Base64 with UTF-8 support |

## Stack

- **Next.js 16** — App Router, Turbopack
- **React 18**
- **Tailwind CSS v3** + shadcn/ui color tokens
- **next-themes** — dark/light mode via `class` strategy
- No backend, no database

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Adding a new tool

1. Create `app/<tool-name>/page.js`
2. Create `components/<ToolName>/index.js`
3. Add a `<MenuItem>` in `components/Sidebar.js`
