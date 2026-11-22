# Portfolio — CLAUDE.md

Angular 20 (standalone components) portfolio site with Firebase backend (Firestore, Storage, Functions, Hosting-adjacent) and Gemini API integration. Deployed to GitHub Pages (`docs/`) and Netlify.

## Run / build / test

- Dev server: `npm start` (= `ng serve`) → http://localhost:4200/, hot reload.
- Build (production, default): `npm run build`
- Build for Netlify: `npm run build:netlify`
- Build for GitHub Pages: `npm run build:pages` (writes to `docs/`, adds `404.html` + `.nojekyll`)
- Full Pages check (build + prepare): `npm run pages:check`
- Unit tests (Karma/Jasmine): `npm test`
- Deploy (gh-pages branch method): `npm run deploy`

There is no e2e test suite. There is no lint script defined in package.json.

## Structure

- `src/app/core/` — singleton services (`analytics.service.ts`, `firebase.service.ts`) and route guards.
- `src/app/features/` — one folder per page/feature area (admin, cases, contact, education, experience, header, intro, personal-details, skills, stats). Standalone components, colocated per feature.
- `src/app/core/services/firebase.loader.ts` — `lazyFirebase()`/`whenIdle()`: the public site must load the Firebase SDK on demand (keeps it out of the initial bundle). Don't statically import `FirebaseService` outside `features/admin`.
- `src/app/shared/` — shared components and directives used across features.
- `src/environments/environment.ts` — Firebase config + Gemini API key (client-side keys; treat as sensitive, never print/log/echo this file's contents or commit new secrets to git history).
- `functions/` — Firebase Cloud Functions source.
- `firestore.rules`, `storage.rules`, `firebase.json` — Firebase project config.
- `scripts/prepare-pages.js` — post-build step for the GitHub Pages bundle.
- `.github/workflows/deploy.yml` — CI: validates the Pages bundle on PRs, deploys on push to `main`.

## Conventions

- Styling: Tailwind CSS v4 via `@tailwindcss/postcss` (see `.postcssrc.json`), plus component-level `.css` files.
- Prettier config lives in `package.json` (100 col width, single quotes, angular parser for `.html`).
- Icons: FontAwesome (`@fortawesome/angular-fontawesome`).
- Misc UI libs: `@omnedia/*` packages (fuzzy-text, glitch-text, marquee, starry-sky, theme-toggle, timeline), `chart.js`, `leaflet` (with `@types/leaflet`).

## Deployment targets

- **GitHub Pages** (canonical): `npm run pages:check` → commits `docs/` → CI validates/deploys on `main`. Repo setting must stay "GitHub Actions" as Pages source, not branch-based.
- **Netlify**: `netlify.toml` + `build:netlify` configuration (baseHref `/`).
- Production build baseHref is `/portfolio/` (GitHub Pages subpath); Netlify build baseHref is `/`.

## Notes for future sessions

- No project-specific `.claude/skills` existed before this file — a `run` skill was added alongside this file to launch the dev server without rediscovering the `npm start` / Angular CLI setup each time.
- `ng`/Angular CLI binaries can fail to resolve under the Bash (Git Bash) tool on this Windows machine (exit 127) even though the underlying `npm` script is valid — prefer the PowerShell tool for `npm`/`ng` commands here.
