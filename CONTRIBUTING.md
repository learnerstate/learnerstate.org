# Contributing

This repo is the *website*, not the spec. Where your change belongs depends
on what it's about.

## Welcome as PRs, directly to this repo

- Typo fixes, broken links, dead references.
- Accessibility fixes (contrast, focus states, semantic markup, alt text).
- Build/tooling fixes (e.g. `scripts/fetch-spec.mjs`, Astro config).

Open a PR. Small and obvious is fine without an issue first.

## Start as an issue first

- Content or framing changes: new pages, rewording the explainer or vision
  essay, restructuring navigation, changing the design system.
- Anything that isn't a strict fix — open an issue so we can agree on the
  direction before you write the PR.

## Belongs in a different repo

- **Spec debate** — field definitions, schema changes, extension design,
  anything about what LSL *is* — belongs in
  [`learnerstate/lsl`](https://github.com/learnerstate/lsl), not here. This
  repo only renders `SPEC.md`; it doesn't define it.

## Before you open a PR

```sh
npm install
npm run dev
```

Check that `npm run build` is green and the pages you touched render as
expected. There's no test suite beyond the build itself — Lighthouse and a
manual look are the bar.

## Design system

The site follows a strict typographic neo-brutalism design system (see
`src/styles/global.css`): pure black/white, one accent color, zero
border-radius, zero box-shadow. If your change adds a shadow, a gradient, a
rounded corner, or a second accent color, it'll get bounced — please match
the existing tokens instead of adding new ones.
