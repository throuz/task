# Frontend – API & Blockchain Technical Test

React + TypeScript frontend with API integration and blockchain (Web3) support.

## Structure

```
src/
  api/           # API client (replace with OpenAPI-generated client when spec is ready)
  blockchain/    # Contract config, read/write helpers (viem)
  components/    # Layout, ErrorMessage, Loading
  hooks/         # useApi (React Query), useWallet (connect, read, write)
  pages/         # Home, ApiDemo, BlockchainDemo
  types/         # Shared API types
```

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE_URL, VITE_CHAIN_ID, VITE_CONTRACT_ADDRESS
npm run gen:api
npm run dev
```

## API

- **Base URL**: Set `VITE_API_BASE_URL` in `.env` (e.g. `https://api.larevela.com`). Must match your Swagger/Postman base URL.
- **Auth**: If the API uses Bearer tokens, set `VITE_API_TOKEN`.
- **Swagger**: The OpenAPI spec is downloaded to `frontend/openapi.json`. Re-generate the type-safe client with:
  ```bash
  npm run gen:api
  ```
- **Postman**: Use the provided collection to test endpoints; keep request/response shape aligned with the app.

### Demo endpoints (no login required)

The API includes both public and protected endpoints. The `ApiDemo` page is wired to endpoints that work without login:

- `GET /health`
- Registration draft flow:
  - `POST /api/v1/auth/send-verification-code`
  - `POST /api/v1/auth/verify-email`
  - `POST /api/v1/auth/register/draft`
  - `PUT /api/v1/auth/register/draft`
- `POST /api/v1/contact-messages`

Some endpoints (for example `GET /api/v1/lookups`) may return `401 Unauthorized` without an authenticated session.

## Blockchain

- **Wallet**: Connect via MetaMask (or other injected provider). Chain and contract are read from env.
- **Config**: `VITE_CHAIN_ID` (e.g. `1` for mainnet, `11155111` for Sepolia), `VITE_CONTRACT_ADDRESS` (your contract).
- **Read**: Native ETH (`getBalance`) + token `balanceOf` are displayed in the UI.
- **Write**: WETH-style `deposit()` (wrap ETH) and `transfer()`; shows tx status (pending/success/error) and explorer links.

### Default demo chain / contract

By default `.env.example` is configured for:

- **Chain**: Sepolia (chainId `11155111`)
- **Contract**: Sepolia WETH at `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` (used to demo `deposit` + `balanceOf` + `transfer`)

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build
