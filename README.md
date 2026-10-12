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

## Build the frontend

```bash
npm run build
```

## Backend environment

Copy the example file and update the MongoDB URI if needed:

```bash
cp backend/.env.example backend/.env
```
