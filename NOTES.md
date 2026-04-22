# Notes

## Design decisions

- **API client generation**: Uses `openapi-typescript-codegen` to generate a type-safe client from `frontend/openapi.json`.
- **Data fetching**: Uses React Query (`@tanstack/react-query`) for request lifecycle (loading, error, caching).
- **Runtime configuration**: API base URL and optional auth are configured through `.env` (`VITE_API_BASE_URL`, `VITE_API_TOKEN`).
- **Blockchain**: Uses `viem` + injected wallet provider (MetaMask) to implement wallet connect, a contract read, and a contract write with tx status feedback.

## What I would improve with more time

- **API auth UX**: Add a login form that stores a token (or uses cookie session) so protected endpoints can be demonstrated without relying on env vars.
- **API demo polish**: Replace raw JSON dumps with formatted, user-friendly UI components.
- **Blockchain UX**:
  - Parse human-readable token amounts (e.g. `0.1`) with `parseUnits` instead of requiring base units input.
  - Display chain name, contract address, tx hash + explorer link.
  - Add better validation for addresses and amounts.
- **Testing**: Add unit tests for hooks and basic integration tests for the demo flows.

