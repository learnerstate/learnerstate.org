# learnerstate.org

The public website for the Learner State org. Renders the LSL spec, hosts
the explainer, the vision essay, and a blog. Deployed to GitHub Pages at
[learnerstate.org](https://learnerstate.org).

## The split

This repo (`learnerstate/website`) is presentation only. The spec's source
of truth is the separate [`learnerstate/lsl`](https://github.com/learnerstate/lsl)
repo. **`SPEC.md` is never copied into this repo** — it's fetched at build
time and rendered fresh on every build. If you `grep` this repo for a
vendored copy of `SPEC.md`, you won't find one; `src/content/spec-generated/`
and `src/content/examples-generated/` are gitignored, build-time-only
directories.

Content and code are licensed separately — see [Licenses](#licenses).

## How the spec gets pulled in

`scripts/fetch-spec.mjs` runs before `dev` and `build` (via npm's
`predev`/`prebuild` lifecycle hooks) and fetches, from the `learnerstate/lsl`
repo:

- `SPEC.md` → `src/content/spec-generated/spec.md`, picked up by the `spec`
  content collection and rendered by `src/pages/spec.astro`.
- `examples/*` → `src/content/examples-generated/`, rendered by
  `src/pages/examples/index.astro`.

Two source modes, resolved in this order:

1. **`LSL_LOCAL_PATH=/path/to/local/lsl npm run dev`** — copies from a local
   checkout of the `lsl` repo. Fast, offline, useful when iterating on the
   spec and the site side by side.
2. **Default (no env var set)** — fetches raw files over HTTPS from
   `https://raw.githubusercontent.com/learnerstate/lsl/<LSL_REF>/...`, where
   `LSL_REF` defaults to `main`. This is what CI and Pages builds use.

Run it standalone with `npm run fetch:spec`.

### Rebuilding when the spec changes

The `lsl` repo should notify this repo of spec changes via a
`repository_dispatch` event, so this site rebuilds without a manual trigger.
In `learnerstate/lsl`'s workflow (on push to `main`, after `SPEC.md`
changes), add a step that fires:

```yaml
- name: Notify website repo of spec change
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.WEBSITE_DISPATCH_TOKEN }}
    repository: learnerstate/website
    event-type: spec-updated
```

And in this repo's Pages deploy workflow, add:

```yaml
on:
  push:
    branches: [main]
  repository_dispatch:
    types: [spec-updated]
```

(Not yet wired up — this is the intended mechanism; add the workflow file
and the cross-repo PAT/secret when ready to automate it.)

## Stack

- **Astro**, static output only. No React/Vue/client framework — the only
  client JS on the site is the homepage YAML/prompt toggle (~10 lines,
  degrades to showing YAML with no JS) and, conditionally, `mermaid.js` on
  any page that actually contains a mermaid diagram.
- **Content collections** for the blog (`src/content/blog/`) and the
  build-time-generated spec (`src/content/spec-generated/`).
- **Shiki** (Astro's built-in markdown highlighter) for code, theme
  `github-light`.
- Design system: clean and Notion-like, light theme only (no
  `prefers-color-scheme` dark mode). Tokens live in `src/styles/global.css` —
  white background, near-black text, thin light-gray borders, small radius,
  one accent (`#1D4ED8`), subtle gray hover states, mono-as-label for dates
  and section labels.

## Local dev

```sh
npm install
npm run dev        # fetches the spec, then starts localhost:4321
```

| Command | Action |
| :-- | :-- |
| `npm run fetch:spec` | Pull `SPEC.md` + examples from the `lsl` repo (standalone) |
| `npm run dev` | Fetch spec, then start the dev server |
| `npm run build` | Fetch spec, then build to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Licenses

- **Content** (blog posts, vision essay, other prose authored here) —
  [CC BY 4.0](./LICENSE). The spec text itself is licensed in the `lsl` repo.
- **Code** (Astro components, layouts, styles, build scripts) —
  [MIT](./LICENSE-CODE).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for what kind of change goes where.
