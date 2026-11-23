# Docs

The starter's capability catalog, as Markdown for now: what it's built on, what it can do, and what can fill each part. A static docs site comes later and reads the same data.

| File                                                         | What it is                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| [core.md](core.md)                                           | The fixed foundations, the core capabilities with their must-haves, default and swappable providers, and the plugins built or decided |
| [potential.md](potential.md)                                 | Capabilities, plugins and patterns under consideration                                                                   |
| [catalog/catalog.yaml](catalog/catalog.yaml)                 | The data both pages are generated from: edit this, not the pages                                                         |
| [catalog/schema.mjs](catalog/schema.mjs)                     | The Zod schema that checks the YAML: ids are unique, and every "provides" names a capability                             |
| [scripts/generate-catalog.mjs](scripts/generate-catalog.mjs) | Writes `core.md` and `potential.md` from the YAML                                                                        |

## Updating the catalog

1. Edit `catalog/catalog.yaml`.
2. From the repo root: `node apps/docs/scripts/generate-catalog.mjs && vp fmt apps/docs`.

The script needs the `yaml` and `zod` packages at the repo root, which are not installed there yet: `vp add -D yaml zod`. That also updates the lockfile, so commit both.

## Later

- **A docs site:** Astro Starlight is the first candidate; VitePress and Docusaurus are the alternatives.
- **A features page in the app** can read the same YAML through the same schema.
