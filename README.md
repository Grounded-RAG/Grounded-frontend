# Grounded Frontend

Grounded Frontend is the web application for Grounded AI, a document-backed intelligence product for creating datasets, configuring agents, asking grounded questions, reviewing citations, and managing workspace operations.

The app is built with Next.js App Router, React, TypeScript, Tailwind CSS, and a small set of shared UI primitives.

## What You Can Do In The App

- View the public Grounded landing page.
- Sign in or sign up with email credentials.
- Start Google OAuth sign-in/sign-up and handle the callback route.
- Enter an authenticated workspace shell.
- View workspace overview metrics and recent runs.
- Create and inspect datasets.
- Create agents and connect them to datasets.
- Chat with agents and review citations, confidence, support status, and workflow progress.
- Submit feedback on agent answers.
- View runs, usage, settings, team, billing, governance, feedback, and API key screens.
- Switch between light and dark themes.

## Tech Stack

- Next.js 16 App Router
- React 18
- TypeScript
- Tailwind CSS
- lucide-react icons
- Local storage for persisted auth/workspace/theme state

## Prerequisites

Install these before running the app:

- Node.js 20 or newer
- npm
- A running Grounded backend API for authenticated flows

The public landing, login, and sign-up pages can render without the backend. Authenticated workspace screens need a backend API and a valid API key/auth response.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server (API URL is automatic — see `lib/api-base-url.ts`):

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server with webpack.

```bash
npm run build
```

Creates a production build.

```bash
npm run typecheck
```

Runs TypeScript checks without emitting files.

```bash
npm run lint
```

Runs the configured Next.js lint command.

## API URL (no Vercel env vars required)

The backend URL is set in `lib/api-base-url.ts`:

| Environment | API base URL |
| --- | --- |
| Local `npm run dev` | `http://localhost:8000` |
| Production / Vercel | `http://51.20.18.111:8000` |

On the backend, add your Vercel URL to `CORS_ALLOWED_ORIGINS`, for example:

```text
https://grounded-rag.vercel.app
```

## Backend Expectations

The frontend API client is in `lib/api.ts`. Authenticated requests use the `X-API-Key` header.

The app currently expects backend endpoints for:

- Email auth and Google OAuth
- Auth smoke validation
- Workspaces
- Dashboard summary and recent runs/jobs
- Datasets, documents, uploads, and ingestion jobs
- Agents, attached datasets, conversations, messages, and streaming chat
- Runs and run feedback
- Capabilities
- API keys

If the backend is not running, public pages will still load, but sign-in and app data requests will fail.

## Google OAuth Notes

Google sign-in starts from the login and sign-up screens and returns through:

```text
/auth/google/callback
```

For local development, the redirect URI used by the frontend will be:

```text
http://localhost:3000/auth/google/callback
```

Make sure the backend and Google OAuth configuration allow that callback URL.

## Important Routes

Public routes:

- `/` - public home page
- `/login` - sign in
- `/sign-up` - create account
- `/onboarding` - onboarding entry
- `/auth/google/callback` - Google OAuth callback

Authenticated app routes:

- `/app` - app entry
- `/app/overview` - workspace overview
- `/app/datasets` - datasets
- `/app/datasets/new` - create dataset
- `/app/datasets/[id]` - dataset detail
- `/app/agents` - agents
- `/app/agents/new` - create agent
- `/app/agents/[id]` - agent chat/detail
- `/app/runs` - runs
- `/app/usage` - usage
- `/app/settings` - settings
- `/app/api-keys` - API keys
- `/app/billing` - billing
- `/app/team` - team
- `/app/feedback` - feedback
- `/app/governance` - governance

Workspace-scoped versions also exist under:

```text
/app/workspace/[workspaceSlug]/...
```

Example:

```text
/app/workspace/acme/datasets
```

## Project Structure

```text
app/
  App Router pages, layouts, public routes, auth routes, and workspace routes.

components/
  Reusable UI, shell, branding, theme, and screen components.

components/screens/
  Page-level product screens such as datasets, agents, overview, login, and settings.

components/shell/
  Authenticated application shell and navigation.

components/ui/
  Shared primitive components.

lib/
  API client, auth context, typed models, mock data, query helper, and utilities.

public/
  Grounded logos and product imagery.
```

## Auth And Local Storage

The app stores auth/workspace state in browser local storage:

- `grounded_api_key`
- `grounded_workspace_id`
- `grounded_workspace_name`
- `grounded_workspace_slug`
- `grounded_theme`

If you get stuck in an invalid auth state while developing, clear site data for `localhost:3000` or remove those keys from local storage.

## Development Workflow

Recommended flow before opening a PR:

```bash
npm install
npm run typecheck
npm run build
```

Use `npm run dev` while actively developing.

## Troubleshooting

### The app opens but authenticated pages redirect to login

The app did not find a valid API key or the saved API key failed backend validation. Sign in again or clear local storage.

### Login or sign-up fails immediately

Confirm the backend at `http://51.20.18.111:8000` is running and CORS includes your frontend origin (e.g. `https://grounded-rag.vercel.app`).

### Production shows API errors on Vercel

- Ensure `http://51.20.18.111:8000` is reachable from the browser.
- Add your Vercel URL to backend `CORS_ALLOWED_ORIGINS`.
- Ensure port `8000` is open on the server firewall.

## Deploying with Vercel

1. Push this repo to GitHub (`Grounded-RAG/Grounded-frontend`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repository.
3. Set the Vercel **project name** to `grounded-rag` (URL will be `https://grounded-rag.vercel.app`).
4. Framework preset: **Next.js** (auto-detected). Root directory: repository root.
5. Click **Deploy** (no environment variables required — API URL is hardcoded).

6. Add `https://grounded-rag.vercel.app` to backend `CORS_ALLOWED_ORIGINS`.

Optional: connect branch `refactor/clean-up` (or `main`) for automatic deploys on push.

CLI (after `npx vercel login`):

```bash
npx vercel link --project grounded-rag
npx vercel --prod
```

**Google OAuth:** add your Vercel callback URL to Google and the backend, e.g.:

```text
https://your-app.vercel.app/auth/google/callback
```

**Self-hosted (optional):** `Dockerfile.dev`, `docker-compose.dev.yml`, and `scripts/verify-deploy-health.sh` remain for AWS/Docker if you use them later; they are not used by Vercel.

### Google sign-in returns an error

Confirm that the backend OAuth configuration and Google console allow:

```text
http://localhost:3000/auth/google/callback
```

### Data screens are empty or show loading/errors

Confirm the backend has seeded workspaces, datasets, agents, runs, and API keys for the signed-in account.

### Port 3000 is already in use

Run the dev server on another port:

```bash
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

## Notes

This is the initial frontend foundation for Grounded. Some screens are fully connected to the backend, while others provide the product surface and structure that future backend work can continue wiring into.
