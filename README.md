# 0 to shipped — Resume parser

This project is structured as a React frontend and an Express backend.

## Project structure

- `frontend/` — React + Vite app for the UI mockup
- `backend/` — Express API for resume/JD comparison, with MongoDB support

## Run locally

```bash
npm install
npm run install:all
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5050`.

## Deploy on Vercel

The root [`vercel.json`](./vercel.json) configures the frontend and backend as
services in one Vercel project. The backend is publicly reachable only through
the `/api/*` rewrite, while all other paths are routed to the frontend. The
frontend uses the same-origin `/api/compare` path, so no service binding is
needed for this browser-to-backend request.

## Build the frontend

```bash
npm run build
```

## Backend environment

Copy the example file and set the MongoDB URI and your server-only OpenAI API key:

```bash
cp backend/.env.example backend/.env
```

`OPENAI_API_KEY` is read only by the Express backend. Do not put it in the
frontend environment or expose it in browser code.

The backend uses `gpt-4o-mini` by default. Set `OPENAI_MODEL` if you want to
use another compatible OpenAI chat model.
