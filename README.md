# TextOps Dashboard

A React dashboard for creating and monitoring text-processing jobs (sort, deduplication, and more). Includes real-time progress, metrics, and authentication.

## Features

- **Authentication** — Register and log in; protected routes for job details
- **Job management** — Create jobs (e.g. sort, dedup) with file upload and options
- **Job list & detail** — View jobs, open full output, download result files
- **Real-time updates** — WebSocket-driven job progress and live metrics
- **Charts & metrics** — System metrics and throughput visualizations (Recharts)
- **Responsive UI** — Layout with sidebar, alerts, and lazy-loaded pages

## Tech stack

| Area        | Technology              |
| ----------- | ----------------------- |
| Build       | [Vite](https://vite.dev) 7 |
| UI          | [React](https://react.dev) 19 |
| State       | [Redux Toolkit](https://redux-toolkit.js.org/) |
| Routing     | [React Router](https://reactrouter.com/) 7 |
| Forms       | [React Hook Form](https://react-hook-form.com/) |
| HTTP        | [Axios](https://axios-http.com/) |
| Real-time   | [Socket.IO](https://socket.io/) client |
| Charts      | [Recharts](https://recharts.org/) |

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **npm** (or yarn/pnpm)
- **TextOps backend** running and reachable (see backend repo for setup)

## Quick start

### 1. Clone and install

```bash
git clone <repo-url>
cd TextOps
npm install
```

### 2. Environment

Copy the example env and point to your backend API:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API base URL (no trailing slash)
VITE_API_BASE_URL=http://localhost:3001/api
```

For production or staging, set the same variable to your deployed API URL.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app will talk to the URL in `VITE_API_BASE_URL`.

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev` | Start Vite dev server          |
| `npm run build` | Production build → `dist/`   |
| `npm run preview` | Preview production build   |
| `npm run lint` | Run ESLint                     |

## Project structure

```
src/
├── components/     # Reusable UI
│   ├── common/     # AlertContainer, StatCard, ProgressBar, VirtualTable
│   ├── charts/     # SystemMetricsChart, ThroughputChart, ProgressChart
│   ├── forms/      # JobForm, FileUpload, JobTypeSelector
│   ├── jobs/       # JobCard, JobList, JobDetailView, JobProgress, JobMetrics
│   └── layout/     # Layout, Header, Sidebar, Dashboard
├── containers/     # JobListContainer, JobDetailContainer
├── hooks/          # useWebSocket, useJobProgress, useJobMetrics
├── pages/           # HomePage, LoginPage, RegisterPage, JobDetailPage
├── services/        # api (axios), jobService, websocket
├── store/            # Redux store, slices (auth, jobs, alerts, metrics, system), selectors
├── utils/             # formatters, validators, calculations
├── App.jsx
└── main.jsx
```

## Deployment (GitHub Pages)

The repo includes a workflow to build and deploy the frontend to GitHub Pages (e.g. `https://<user>.github.io/TextOps/` or a custom domain path like `https://aspandyar.me/TextOps/`).

1. **Settings → Pages** → **Source**: **GitHub Actions**
2. Ensure only the **“Deploy to GitHub Pages”** workflow is used (remove any default Jekyll “pages build and deployment” workflow in `.github/workflows/` if present)
3. Push to `main` or run **Actions → Deploy to GitHub Pages → Run workflow**

Build output uses base path ` /TextOps/` so the app works when served under that path. See [.github/DEPLOY-PAGES-SETUP.md](.github/DEPLOY-PAGES-SETUP.md) for troubleshooting (e.g. `/src/main.jsx` MIME type errors).

**Production API:** Set `VITE_API_BASE_URL` in the environment where you build (e.g. in the workflow or your CI) so the deployed app calls your production backend.

## License

Private / unlicensed unless stated otherwise.
