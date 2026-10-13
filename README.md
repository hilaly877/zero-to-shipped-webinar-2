# 0 to shipped — Resume intelligence

0 to shipped is a full-stack resume parser that compares a PDF resume with a
job description and turns the result into a practical readout:

- an overall match score from 0 to 100;
- skills detected in the resume;
- skills that are missing from the resume;
- an AI-generated summary; and
- a short list of opportunities to improve the resume.

The project includes a React/Vite frontend, an Express API, MongoDB
persistence, JWT-based authentication, PDF text extraction, and OpenAI-powered
analysis.

## How it works

1. A visitor creates an account or logs in.
2. The frontend sends the PDF resume and job description to `POST /api/compare`.
3. The backend extracts text from the PDF in memory.
4. The backend sends the extracted text and job description to OpenAI.
5. The frontend displays the score, summary, detected skills, and missing skills.
6. The analysis metadata is saved to MongoDB for the authenticated user.

The PDF is processed by the backend and is not stored as an uploaded file. The
analysis record stores the original filename, job description, score, and skill
lists.

## Features

- React 19 and Vite frontend
- Express 4 API
- Register, login, current-session, and logout endpoints
- Password hashing with `bcryptjs`
- JWT stored in an HTTP-only `auth_token` cookie
- PDF-only uploads, limited to 5 MB
- PDF text extraction with `pdf-parse`
- Structured JSON analysis through OpenAI Chat Completions
- MongoDB models for users and resume analyses
- Local development proxy from Vite `/api` to Express
- Vercel configuration for deploying frontend and backend services together

## Project structure

```text
.
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controller/              # Request handlers
│   ├── middleware/              # Auth, upload, and error middleware
│   ├── models/                  # Mongoose models
│   ├── routes/                  # Express routes
│   ├── service/                 # PDF and OpenAI analysis services
│   ├── .env.example             # Backend configuration template
│   ├── package.json
│   └── server.js                # Express entry point
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # UI, auth, upload, and result handling
│   │   └── styles.css
│   ├── vite.config.js            # Local /api proxy
│   └── package.json
├── package.json                 # Root development scripts
└── vercel.json                  # Frontend/backend deployment routing
```

The root `src/` and `index.html` files are legacy mockup files from the
project’s original frontend. The runnable application is in `frontend/`.

## Prerequisites

- Node.js 18 or newer (the backend uses the built-in `fetch` API)
- npm
- MongoDB, either:
  - a local MongoDB server; or
  - a MongoDB Atlas deployment
- An OpenAI API key with access to the configured chat model

## Installation

From the repository root:

```bash
npm install
npm run install:all
```

`npm run install:all` installs dependencies in both `frontend/` and
`backend/`.

## Environment configuration

Create the backend environment file:

```bash
copy backend\.env.example backend\.env
```

On macOS or Linux, use:

```bash
cp backend/.env.example backend/.env
```

Set the values in `backend/.env`:

```dotenv
# Use a local database during development, or provide an Atlas URI.
MONGODB_URI=mongodb://127.0.0.1:27017/zero-to-shipped

# Use a long, random value. Never commit this value.
JWT_SECRET=replace-with-a-long-random-secret

# Keep this key on the backend only.
OPENAI_API_KEY=replace-with-your-openai-api-key

# Optional; defaults to gpt-4o-mini.
OPENAI_MODEL=gpt-4o-mini

# Optional; defaults to 5050.
PORT=5050

# Set this to production when deploying over HTTPS.
# NODE_ENV=production
```

`MONGODB_USERNAME` and `MONGODB_PASSWORD` are present in the example file for
compatibility with earlier setup notes, but the application currently connects
using `MONGODB_URI`.

Do not put `OPENAI_API_KEY` or `JWT_SECRET` in frontend files, commit them to
Git, or expose them through a `VITE_*` variable. If a real secret has ever been
committed or shared, rotate it before deploying.

## Run locally

Start both services from the repository root:

```bash
npm run dev
```

Open the frontend at <http://localhost:5173>. The backend listens at
<http://localhost:5050>.

The frontend’s Vite configuration proxies `/api` requests to the backend, so
the browser uses same-origin URLs such as `/api/auth/login` and
`/api/compare`.

To run either service separately:

```bash
# Frontend
npm run frontend

# Backend
npm run backend
```

The backend falls back to
`mongodb://127.0.0.1:27017/zero-to-shipped` in non-production environments
when `MONGODB_URI` is not set. Authentication and analysis still require a
working MongoDB connection.

## Using the application

1. Open the frontend.
2. Select **Create account** and register with a name, valid email, and a
   password of at least eight characters.
3. Choose a PDF resume no larger than 5 MB.
4. Paste the target job description.
5. Select **Analyze my resume**.
6. Review the score, summary, detected skills, and opportunities.
7. Select **Log out** when finished, especially on a shared computer.

Closing a browser tab does not log the user out. The `auth_token` cookie is
HTTP-only and remains valid for up to seven days, so opening the site again in
the same browser can restore the session. Logging out clears the cookie.

## API reference

All API responses are JSON unless otherwise noted. Authenticated requests use
the `auth_token` cookie returned by register or login.

### Health check

```http
GET /api/health
```

Example:

```bash
curl http://localhost:5050/api/health
```

Response:

```json
{
  "status": "ok",
  "message": "Resume parser backend is running.",
  "mongodbConnected": true
}
```

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "correct-horse-battery"
}
```

The endpoint returns `201` and sets the `auth_token` cookie. Names are limited
to 80 characters by the database schema. Emails are normalized to lowercase.

### Log in

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "ada@example.com",
  "password": "correct-horse-battery"
}
```

The endpoint returns the public user object and sets a fresh `auth_token`
cookie.

### Get the current user

```http
GET /api/auth/me
```

Requires the authentication cookie and returns:

```json
{
  "user": {
    "id": "mongodb-user-id",
    "name": "Ada Lovelace",
    "email": "ada@example.com"
  }
}
```

### Log out

```http
POST /api/auth/logout
```

This clears the authentication cookie and returns `204 No Content`.

### Compare a resume

```http
POST /api/compare
Content-Type: multipart/form-data
```

Form fields:

- `resume`: required PDF file, maximum 5 MB;
- `jobDescription`: required text.

Example with `curl`:

```bash
curl -i ^
  -c cookies.txt ^
  -b cookies.txt ^
  -F "resume=@C:\path\to\resume.pdf" ^
  -F "jobDescription=We need a frontend engineer with React, JavaScript, TypeScript, testing, and Node.js." ^
  http://localhost:5050/api/compare
```

The request must be authenticated. A successful response has this shape:

```json
{
  "score": 82,
  "summary": "Solid foundation with relevant frontend experience.",
  "presentSkills": ["JavaScript", "React", "Node.js"],
  "missingSkills": ["TypeScript", "Testing"],
  "fileName": "resume.pdf"
}
```

## Authentication and security behavior

- Passwords are stored as `bcryptjs` hashes; the plaintext password is never
  stored.
- JWTs are signed with `JWT_SECRET`, expire after seven days, and are sent in
  an HTTP-only cookie.
- Cookies use `SameSite=Lax`. The `Secure` flag is enabled when
  `NODE_ENV=production`.
- The backend does not return password hashes in public user responses.
- Analysis and account routes require MongoDB.
- The OpenAI key is read only by the backend.
- Uploaded files are held in memory for parsing and are limited to 5 MB.

For production, use HTTPS, a strong unique `JWT_SECRET`, restricted MongoDB
network access, and appropriate rate limiting and monitoring at the edge or
API gateway.

## Error responses

Common errors include:

| Status | Meaning |
| --- | --- |
| `400` | Missing or invalid input, or a non-PDF upload |
| `401` | Missing, invalid, or expired login session |
| `409` | An account already exists for the email |
| `422` | The PDF could not be read or contains no readable text |
| `429` | OpenAI is rate-limiting the request |
| `502` | The OpenAI request failed or returned an unusable response |
| `503` | MongoDB or `OPENAI_API_KEY` is unavailable |

The backend returns errors in the form:

```json
{
  "message": "A human-readable error message."
}
```

## Build and preview

Build the production frontend bundle:

```bash
npm run build
```

Preview the built frontend:

```bash
npm run preview
```

The backend runs directly with Node:

```bash
npm --prefix backend start
```

## Deploy to Vercel

The root [`vercel.json`](./vercel.json) defines two Vercel services:

- `frontend/` as a Vite frontend;
- `backend/` as an Express backend.

The rewrite rules send `/api/*` to the backend service and all other paths to
the frontend service. This lets the browser continue using same-origin API
paths.

Before deploying:

1. Add `MONGODB_URI`, `JWT_SECRET`, and `OPENAI_API_KEY` to the backend
   service’s Vercel Environment Variables.
2. Optionally add `OPENAI_MODEL` and `NODE_ENV=production`.
3. Allow Vercel’s outbound connections in the MongoDB deployment’s network
   access settings.
4. Redeploy after changing environment variables.

Do not deploy a local `.env` file. Vercel injects the configured environment
variables into the backend service at runtime.

## Troubleshooting

### “The database is unavailable”

Verify that MongoDB is running locally or that `MONGODB_URI` is valid. For
MongoDB Atlas, check the database user, password, cluster hostname, and network
access rules.

### “Please log in to continue”

Log in again and ensure the browser allows cookies. The frontend sends
credentials with every authentication and analysis request.

### “OPENAI_API_KEY is not configured”

Set `OPENAI_API_KEY` in `backend/.env` and restart the backend. The key must
not be placed in the frontend.

### The PDF is rejected

Only files with a PDF MIME type or a `.pdf` extension are accepted. The maximum
size is 5 MB, and scanned/image-only PDFs may not contain text that
`pdf-parse` can extract.

### The frontend cannot reach the API

When developing locally, run both services with `npm run dev`. If they are
started separately, confirm the backend is listening on port 5050 and that
the frontend Vite proxy points to that port.

## License

No license has been specified for this project yet.
