# TextOps – Technical Report

This document describes the architecture, technical choices, performance optimizations, test strategy, and deployment plan for the TextOps dashboard application.

---

## 1. Architecture Description

### 1.1 Module Structure

The frontend is organized in clear layers:

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Pages** | `src/pages/` | Route-level screens (HomePage, JobDetailPage). |
| **Containers** | `src/containers/` | Connect Redux and routing; pass data and callbacks to presentational components. |
| **Components** | `src/components/` | Presentational and shared UI (jobs, forms, charts, layout, common). |
| **Store** | `src/store/` | Redux store, slices, and selectors. |
| **Services** | `src/services/` | API client and WebSocket; no UI. |
| **Hooks** | `src/hooks/` | Reusable logic (useJobMetrics, useJobProgress, useWebSocket). |
| **Utils** | `src/utils/` | Pure helpers (formatters, validators, calculations). |

### 1.2 Data Flow

- **User action** → UI (Presenter) → **callback prop** → Container → **dispatch(thunk)** or effect → **API / WebSocket** → **Store** (slice: pending/fulfilled/rejected) → **Selectors** → Container → **props** → UI.

Containers are the only place that use `useSelector` and `useDispatch` for a given flow; presentational components receive data and callbacks via props only.

### 1.3 Design Patterns

- **Container/Presenter:** Containers (e.g. `JobListContainer`, `JobDetailContainer`) hold Redux state and side effects; they pass `jobs`, `onCancel`, `onDelete`, `job`, etc., to presentational components (`JobList`, `JobCard`, `JobDetailView`). Presentational components do not use Redux directly.
- **Redux Toolkit:** Single store with slices (jobs, metrics, alerts, system). Async work is done with `createAsyncThunk` (e.g. `fetchJobs`, `createJob`, `cancelJob`, `deleteJob`).
- **Nested routing:** A single layout route renders `<Outlet />`; child routes are Home (dashboard) and Job Detail. Protected routes wrap the layout so that route guards can be extended with auth checks later.

### 1.4 Diagram (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│  UI (Presenter)                                                  │
│  JobList, JobCard, JobDetailView, Dashboard, JobForm, Charts      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ props (data, callbacks)
┌───────────────────────────▼─────────────────────────────────────┐
│  Containers                                                      │
│  JobListContainer, JobDetailContainer                             │
│  useSelector, useDispatch, route params                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ dispatch(thunks), effects
┌───────────────────────────▼─────────────────────────────────────┐
│  Store (Redux) / Services (API, WebSocket)                        │
│  jobsSlice, metricsSlice, jobService, api, websocket              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Justification

### 2.1 Why React

- **Ecosystem:** Rich set of libraries (Redux, React Router, React Hook Form, Recharts) that fit the project’s needs.
- **Hooks:** Local state and side effects (e.g. `useJobProgress`, `useWebSocket`) are encapsulated in hooks, which keeps components and containers focused.
- **Performance:** Combined with memoization and lazy loading, React supports a responsive UI for real-time metrics and large lists.
- **Team familiarity:** React is widely used and well documented, which helps maintenance and onboarding.

### 2.2 State Management – Redux Toolkit

Centralized state is implemented with **Redux Toolkit** and **asynchronous thunks**:

- **Predictable state:** All job and metrics state lives in the store; updates go through actions and reducers.
- **DevTools:** Redux DevTools allow inspecting actions and state over time.
- **Thunks for async:** `createAsyncThunk` is used for all API calls: `fetchJobs`, `createJob`, `cancelJob`, `deleteJob` (see `store/slices/jobsSlice.js`). Thunks handle loading and error state in the slice (e.g. `fetchJobs.pending` / `fulfilled` / `rejected`).

**Data flow (summary):** UI → dispatch(thunk) → API (jobService) → slice (pending/fulfilled/rejected) → selectors → UI via containers.

---

## 3. Performance Analysis

### 3.1 Optimizations and Code References

- **Memoization**
  - **memo:** Used to avoid re-renders when props are unchanged:
    - `JobList.jsx`, `JobCard.jsx`, `Dashboard.jsx`, `Header.jsx`, `Sidebar.jsx`, `AlertContainer.jsx`, `Alert.jsx`, `FileUpload.jsx`, `JobTypeSelector.jsx`, `StatCard.jsx`, `ProgressBar.jsx`, `VirtualTable.jsx`, `JobMetrics.jsx`, `JobProgress.jsx`, and chart components: `MetricsChart.jsx`, `ProgressChart.jsx`, `ThroughputChart.jsx`, `SystemMetricsChart.jsx`.
  - **useCallback:** Used for event handlers and stable function references:
    - `JobForm.jsx`: `validateJobTypeAsync`, `validateFileAsync`, `handleFileSelect`, `handleJobTypeChange`, `handleOptionsChange`, `onSubmit`.
    - `JobCard.jsx`: `handleCancel`, `handleDelete`, `handleSelect`.
    - `FileUpload.jsx`: `handleFileChange`, `handleRemove`.
  - **useMemo:** Used for derived data and heavy computation:
    - `JobList.jsx`: sorted list of jobs.
    - `Dashboard.jsx`: `hasMetrics` and stats from selectors.
    - `JobForm.jsx`: `showSortOptions`, `showDedupOptions`.
    - Chart components: `chartData` in `SystemMetricsChart.jsx`, `MetricsChart.jsx`, `ThroughputChart.jsx`, `ProgressChart.jsx`.
    - `VirtualTable.jsx`: row renderer.

- **Lazy loading:** Route-level components are loaded with `React.lazy()` and wrapped in `<Suspense>` to reduce initial bundle size: `HomePage`, `JobDetailPage` (see `App.jsx`).

- **Virtual list:** `VirtualTable` (react-window) is used for large lists to limit DOM nodes and keep scrolling performant.

These choices avoid redundant re-renders and heavy recomputation in list and chart components.

---

## 4. Test Results

### 4.1 Strategy

- **Unit tests** target business logic and interactions: store (slices, reducers, thunks), services (api, jobService), utils (formatters, calculations), and a growing set of components (e.g. JobList, JobCard, ProgressBar, Dashboard loading).
- **Coverage:** Vitest is configured to report coverage for `src/services`, `src/store`, `src/utils`, and (when enabled) `src/components`, `src/pages`, `src/hooks`. The goal is **≥ 20% of components/services** covered by tests and **≥ 75% coverage on critical logic** (store, services, utils).

### 4.2 Running Tests

From the project root (TextOps):

```bash
npm run test:coverage
```

- **Test run:** All tests should pass. Fix any failing tests (e.g. MSW handlers for `createJob` with FormData) before relying on coverage numbers.
- **Coverage output:** The terminal prints a summary and a table by file. An HTML report is generated under `coverage/` for inspection.

### 4.3 Example Summary (Placeholder)

After a successful full run, the report should look conceptually like:

```
 Test Files  X passed
      Tests  Y passed
   Coverage  (see table below)
```

| Category    | Lines | Statements | Branches | Functions |
|------------|-------|------------|----------|-----------|
| store/      | ≥75%  | …          | …        | …         |
| services/   | ≥75%  | …          | …        | …         |
| utils/      | ≥75%  | …          | …        | …         |
| components/ | (≥20% of files covered) | … | …        | …         |

**Statement:** Unit tests cover the store, services, utils, and at least 20% of components; coverage for critical logic (store, services, utils) is aimed at ≥ 75%. Tests run successfully in CI (see Deployment plan).

---

## 5. Deployment Plan

### 5.1 Build

- **Install:** `npm ci` (or `npm install`).
- **Build:** `npm run build` (Vite).
- **Output:** Production assets in `dist/` (e.g. `dist/index.html`, `dist/assets/`).

### 5.2 Environment

- Configure `VITE_API_BASE_URL` and `VITE_WS_URL` for the target backend (e.g. `https://api.example.com/api`, `wss://api.example.com`). For local dev, use `.env` with `http://localhost:3001/api` and `http://localhost:3001`.

### 5.3 CI/CD Pipeline

A **potential CI/CD pipeline** (e.g. GitHub Actions) runs on every push/PR to the main branch:

1. **Checkout** code.
2. **Setup Node** (e.g. Node 20).
3. **Install dependencies:** `npm ci`.
4. **Lint:** `npm run lint`.
5. **Unit tests with coverage:** `npm run test:coverage`.
6. **Build:** `npm run build`.

Optional steps:

- **Deploy:** Upload `dist/` to a static host (e.g. Vercel, Netlify) or attach the build as an artifact.
- **E2E:** Run Playwright (e.g. `npm run test:e2e`) in a separate job or stage.

CI ensures that only code that passes lint and tests and builds successfully can be merged or deployed. The pipeline is implemented in **`.github/workflows/ci.yml`** in the frontend repo (TextOps): on push or pull request to `main`/`master`, it runs install → lint → test:coverage → build.

---

## 6. Core Features (Mapping to Requirements)

The application implements **5 core features** that align with course themes:

| # | Feature | Description | Course theme |
|---|---------|-------------|--------------|
| 1 | **List/filter jobs** | Dashboard shows jobs; filter by status (all, running, completed, etc.). | State (Redux), selectors |
| 2 | **Create job (form + validation)** | JobForm: file upload, job type, conditional options (sort/dedup). Async validation via custom validators. | Forms, async validation |
| 3 | **Job detail & actions** | Job detail page; cancel/delete from list and detail. | Routing, state |
| 4 | **Real-time updates** | WebSocket updates for job progress and system metrics. | State, performance |
| 5 | **Dashboard/charts** | Stats cards and system metrics charts (CPU, memory, etc.). | Performance (memo, useMemo) |

**Backend:** The app uses the **TextOps-backend** (Node/Express) for REST and WebSocket. For assignment wording that asks for a “mock or public API,” the same backend can be replaced or supplemented by JSON-Server (e.g. `db.json` for jobs) with the frontend pointed at that base URL; WebSocket can remain on a minimal backend or be simulated in the frontend (e.g. timers) and documented accordingly.

---

## 7. Routing (Nested, Protected, Lazy)

- **Nested structure:** A single **layout route** (path `/`) renders a layout component that includes `<Outlet />`. Child routes:
  - `index` → HomePage (dashboard).
  - `job/:jobId` → JobDetailPage.
- **Protected routes:** The main area is wrapped in a `ProtectedRoute` (or equivalent); guards can be extended with authentication checks.
- **Lazy loading:** `HomePage` and `JobDetailPage` are loaded with `React.lazy()` and rendered inside `<Suspense>` in `App.jsx`.

---

## 8. Forms (Complex Form and Async Validation)

The main complex form is **JobForm** (create job): file upload, job type selector, and conditional options (sort order, dedup case-sensitive). **Asynchronous validation** is implemented with custom validators passed to react-hook-form’s `register(..., { validate: asyncFn })`, e.g.:

- `validateJobTypeAsync` – ensures a job type is selected (with a short async delay for demonstration).
- `validateFileAsync` – ensures a file is selected.

These validators run asynchronously and integrate with react-hook-form’s error state and submit flow.
