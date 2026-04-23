# Technical Test: API Integration & Blockchain

This repo contains the **task description** and a **React frontend** starter for the technical test.

## Contents

| Item | Description |
|------|-------------|
| [TASK.md](./TASK.md) | Full task: API integration (Swagger/Postman) + blockchain smart contract |
| **frontend/** | React + TypeScript app with API client and Web3 (viem) integration |
| **docs/** | Placeholder for Swagger/OpenAPI spec and notes (see [docs/SWAGGER.md](./docs/SWAGGER.md)) |
| [NOTES.md](./NOTES.md) | Short notes: design decisions + improvements |

## Quick start

1. Read [TASK.md](./TASK.md).
2. Swagger/OpenAPI: this repo is configured to use LaRevela's public spec at `https://api.larevela.com/openapi.json` (downloaded into `frontend/openapi.json` for codegen). If you want to swap APIs, replace that file or update the URL and re-generate the client.
3. Run the frontend:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env (VITE_API_BASE_URL, VITE_CHAIN_ID, VITE_CONTRACT_ADDRESS)
   npm run gen:api
   npm run dev
   ```

4. Implement API endpoints and contract calls per the task; use Postman to verify the API.
