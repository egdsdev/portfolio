---
name: run
description: Launch this Angular portfolio app's dev server and verify it's serving. Use whenever asked to run, start, preview, or check that this project works.
---

# Running the portfolio app

This is an Angular 20 (standalone components) app. Package scripts are in `package.json`.

## Start the dev server

Use the **PowerShell** tool, not Bash — `ng`/Angular CLI resolution has failed under
Git Bash on this machine (exit 127) even though the npm script itself is valid.

```powershell
npm start
```

Run it with `run_in_background: true`. It runs `ng serve` and serves at
`http://localhost:4200/` with hot reload. First compile takes ~10-15s.

## Confirm it's ready

Wait for either of these lines in the background task's output file:

```
Application bundle generation complete.
➜  Local:   http://localhost:4200/
```

Then verify with a plain request:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4200/
```

`200` means the app is serving. For a deeper check, `curl -s http://localhost:4200/ | grep -o '<title>[^<]*'` or drive it with a browser tool if visual confirmation is needed.

## Other useful commands

- Production build: `npm run build` → `dist/`
- GitHub Pages build: `npm run build:pages` → `docs/`
- Netlify build: `npm run build:netlify`
- Unit tests (Karma/Jasmine, launches a browser): `npm test`

No lint script and no e2e suite are configured in this repo.

## Don't

- Don't use `ng serve` directly via Bash tool — use `npm start` via PowerShell instead.
- Don't print or log `src/environments/environment.ts` — it contains a Firebase config and a Gemini API key.
