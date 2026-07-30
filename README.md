# MiniBlog — AI Blog Writer

A full-stack AI-powered blog platform built with **Next.js**, **Express**, **MongoDB**, and **Groq/Gemini** for content generation.

![CI](https://github.com/simrankhurmi/ai-blog-writer/actions/workflows/ci.yml/badge.svg)

## Features

- **AI blog generation** — Groq (recommended) or Google Gemini
- **Improve writing** — AI-powered content polish
- **Live Markdown preview** — Write / Preview tabs
- **Tags, search & sort** — Filter posts on the home page
- **Reading time & stats** — Dashboard metrics
- **Dark / light mode**
- **MongoDB Atlas** with automatic local file fallback

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS  |
| Backend  | Express 5, TypeScript, Mongoose     |
| AI       | Groq API / Google Gemini            |
| Database | MongoDB Atlas (optional)            |

## Project Structure

```
ai-blog-writing/
├── client/          # Next.js frontend
├── server/          # Express API
│   ├── src/
│   └── data/        # Local JSON fallback (gitignored)
└── .github/         # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas URI (optional)
- [Groq API key](https://console.groq.com/keys) (free, recommended)

### 1. Clone the repository

```bash
git clone https://github.com/simrankhurmi/ai-blog-writer.git
cd ai-blog-writer
```

### 2. Server setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri_optional

AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

```bash
npm install
npm run dev
```

Server runs at **http://localhost:5000**

### 3. Client setup

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at **http://localhost:3000**

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/health`         | Health & AI status       |
| GET    | `/api/blogs`          | List all blogs           |
| POST   | `/api/blogs/create`   | Create blog              |
| GET    | `/api/blogs/:id`      | Get blog by ID           |
| PUT    | `/api/blogs/:id`      | Update blog              |
| DELETE | `/api/blogs/:id`      | Delete blog              |
| POST   | `/api/ai/generate`    | Generate blog with AI    |
| POST   | `/api/ai/improve`     | Improve existing content |

Swagger docs: **http://localhost:5000/api-docs**

## Environment Variables

### Server (`server/.env`)

| Variable         | Required | Description                          |
|------------------|----------|--------------------------------------|
| `PORT`           | No       | Default `5000`                       |
| `MONGO_URI`      | No       | MongoDB connection string            |
| `AI_PROVIDER`    | No       | `groq`, `gemini`, or `auto`          |
| `GROQ_API_KEY`   | Yes*     | Groq key (`gsk_...`)                 |
| `GROQ_MODEL`     | No       | Default `llama-3.1-8b-instant`       |
| `GEMINI_API_KEY` | Yes*     | Gemini key (`AIzaSy...`)             |

\* One AI provider key is required.

### Client (`client/.env.local`)

| Variable               | Description                |
|------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL`  | API base URL               |

## Security

- **Never commit** `.env` files — they are in `.gitignore`
- Use `.env.example` files as templates only
- Rotate API keys if they were ever exposed
- Store production secrets in your host's environment variable settings

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

- **Server** — TypeScript type-check
- **Client** — Production build

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Deployment

This is a **monorepo** (`client/` + `server/`). Deploy each part separately.

### Frontend — Vercel (recommended)

1. Vercel → project → **Settings** → **General** → **Root Directory**: `client`
2. **Environment variables** (Production):
   - `API_URL` = `https://YOUR-BACKEND-URL` (no trailing slash — e.g. Render/Railway URL)
3. Redeploy

The frontend proxies `/api/*` to your backend via `API_URL`, so you do **not** need `NEXT_PUBLIC_API_URL` on Vercel unless you want direct browser → backend calls.

### Backend — Render (one-click) or Railway

**Render** (uses [`render.yaml`](render.yaml)):

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect this repo
2. Set secrets: `GROQ_API_KEY`, optional `MONGO_URI`
3. Copy the service URL (e.g. `https://ai-blog-writer-api.onrender.com`)
4. Paste into Vercel as `API_URL` and redeploy the frontend

**Railway**: Root Directory `server`, same env vars, `npm run build` + `npm start`.

### Checklist

| Step | Frontend (Vercel) | Backend (Render/Railway) |
|------|-------------------|--------------------------|
| Root directory | `client` | `server` |
| Env vars | `API_URL` | `GROQ_API_KEY`, `MONGO_URI`, etc. |
| Health check | App loads at `/` | `GET /api/health` → `200` |

## License

MIT
