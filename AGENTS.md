# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the app: `features/` for domain flows (auth, assets), `services/` for API wrappers, `stores/` for Pinia state, `router/` for routes, `components/` for shared UI, `composables/` for reusable logic, `assets/` for static files, `stubs/` for demo data, `shims/` for type helpers, and `style.css` for global styles.
- `public/` serves static assets; `docs/` keeps supporting notes; `.tmp/tests/` stores Node test runner files and stubs; add new specs under `.tmp/tests/tests` to keep the runner path aligned.
- `main.ts` bootstraps Vue/Pinia/Router; `App.vue` holds the shell layout and session guard wiring.

## Build, Test, and Development Commands
- `npm install` - install dependencies.
- `npm run dev` - start Vite dev server with HMR.
- `npm run build` - run `vue-tsc -b` then `vite build` for a type-checked production bundle.
- `npm run preview` - serve the built assets locally.
- `npm test` - type-check tests via `tsc --project tsconfig.tests.json` then run the Node test suite (currently targets `.tmp/tests/tests/test_authApi.test.js`; add cases in that folder to be picked up).

## Coding Style & Naming Conventions
- Use TypeScript and `<script setup>` in SFCs; favor Composition API patterns and keep options API minimal.
- 2-space indentation, single quotes, and semicolon-free code match current files. Group imports as external -> aliases -> relative paths.
- Components in PascalCase (`NotificationToasts.vue`); composables prefixed with `use`; Pinia stores as `useThingStore`; helpers in camelCase.
- Leverage Bootstrap 5 utilities; share cross-cutting styles in `style.css` rather than per-view overrides.

## Testing Guidelines
- Use the Node test runner with ES modules; name files `*.test.ts` or `*.test.js` under `.tmp/tests/tests/`.
- Place fixtures/stubs in `.tmp/tests/tests/stubs` and keep tests deterministic (no live network); mock HTTP via wrappers in `src/services`.
- Add assertions around auth/session flows and asset hierarchy behaviors when changing related code.

## Commit & Pull Request Guidelines
- Match existing history: concise, imperative summaries (e.g., "Refactor auth API to use stub for login"); capitalize the first word and omit trailing periods.
- PRs should describe scope, list `npm test` / `npm run build` results, and include screenshots or GIFs for UI changes. Link issues and flag new env vars or breaking changes.

## Security & Configuration Tips
- Do not commit secrets; copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
- Development auth may rely on stubs; confirm real endpoints in `src/services/api.ts` before production deployments.
