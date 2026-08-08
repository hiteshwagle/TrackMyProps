# TrackMyProps Frontend

Minimal Expo React Native TypeScript application shell for Phase 0.

It contains no navigation, authentication, API client, server-state store, client-state store, or product feature.

## Requirements

- Node.js 22.13 or later in the Node.js 22 release line
- npm 11

## Commands

```bash
npm ci
npm start
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

The build command performs a non-interactive Expo web export to `dist/`.

No environment variables are required.

Future backend clients must be generated from or validated against the versioned sources in `../contracts/`. The Phase 0 screen does not consume an API contract yet.
