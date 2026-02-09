# TextOps – Final Report  
## Full-Scale Advanced Front-End Application Development

This document is the technical report for the TextOps SPA, covering architecture, technical justification, performance, test results, and deployment as required by the assignment.

---

## Mandatory Technical Requirements – Compliance Summary

| Requirement | Implementation | Location / Evidence |
|-------------|----------------|---------------------|
| **State management** | Redux Toolkit with asynchronous thunks | `store/slices/jobsSlice.js`: `createAsyncThunk` for `fetchJobs`, `createJob`, `cancelJob`, `deleteJob` |
| **Routing** | Nested + protected routes; lazy loading | `App.jsx`: `<ProtectedRoute>`, nested `<Route>`, `React.lazy()` for `HomePage`, `JobDetailPage`; `<Suspense>` |
| **Performance** | memo, useCallback, useMemo | Section 3 below; e.g. `JobList.jsx`, `JobCard.jsx`, `JobForm.jsx`, `Dashboard.jsx`, chart components |
| **Forms** | Complex form with async validation | `components/forms/JobForm.jsx`: react-hook-form, `validateJobTypeAsync`, `validateFileAsync`, conditional options |
| **Testing** | ≥ 75% coverage of critical logic; edge cases | Vitest; coverage restricted to critical logic; 89 tests, 87%+ lines/functions – Section 4 |
| **Architecture** | Container/Presenter; clear layers | Section 1; `containers/` vs `components/`, `store/`, `services/`, `hooks/`, `utils/` |

---

## 1. Architecture Description

### 1.1 Module Structure and Diagram

The app follows a **layered, Container/Presenter** structure:

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

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Pages** | `src/pages/` | Route-level screens (HomePage, JobDetailPage). |
| **Containers** | `src/containers/` | Connect Redux and routing; pass data and callbacks to presentational components. |
| **Components** | `src/components/` | Presentational and shared UI (jobs, forms, charts, layout, common). |
| **Store** | `src/store/` | Redux store, slices, selectors. |
| **Services** | `src/services/` | API client and WebSocket; no UI. |
| **Hooks** | `src/hooks/` | Reusable logic (useJobMetrics, useJobProgress, useWebSocket). |
| **Utils** | `src/utils/` | Pure helpers (formatters, validators, calculations). |

### 1.2 Data Flow

- **User action** → Presenter (e.g. JobList) → **callback prop** → Container → **dispatch(thunk)** or effect → **API / WebSocket** → **Store** (slice: pending/fulfilled/rejected) → **Selectors** → Container → **props** → UI.

Containers are the only place that use `useSelector` and `useDispatch` for a given flow; presentational components receive data and callbacks via props only.

### 1.3 Design Patterns

- **Container/Presenter:** Containers (e.g. `JobListContainer`, `JobDetailContainer`) hold Redux state and side effects; they pass `jobs`, `onCancel`, `onDelete`, `job`, etc., to presentational components (`JobList`, `JobCard`, `JobDetailView`). Presentational components do not use Redux directly.
- **Redux Toolkit:** Single store with slices (jobs, metrics, alerts, system). Async work is done with `createAsyncThunk` (e.g. `fetchJobs`, `createJob`, `cancelJob`, `deleteJob` in `store/slices/jobsSlice.js`).
- **Nested routing:** A single layout route renders `<Outlet />`; child routes are Home (dashboard) and Job Detail. **Protected routes:** The main area is wrapped in `ProtectedRoute` in `App.jsx` (extensible with auth). **Lazy loading:** `HomePage` and `JobDetailPage` are loaded with `React.lazy()` and rendered inside `<Suspense>`.

---

## 2. Technical Justification

### 2.1 Why React

- **Ecosystem:** Rich set of libraries (Redux Toolkit, React Router, react-hook-form, Recharts) that fit the project’s needs.
- **Hooks:** Local state and side effects (e.g. `useJobProgress`, `useWebSocket`) are encapsulated in hooks, keeping components and containers focused.
- **Performance:** Combined with memoization and lazy loading, React supports a responsive UI for real-time metrics and large lists.
- **Widely used and documented**, which helps maintenance and onboarding.

### 2.2 State Management – Redux Toolkit

Centralized state is implemented with **Redux Toolkit** and **asynchronous thunks**:

- **Predictable state:** All job and metrics state lives in the store; updates go through actions and reducers.
- **DevTools:** Redux DevTools allow inspecting actions and state over time.
- **Thunks for async:** `createAsyncThunk` is used for all job API calls in `store/slices/jobsSlice.js`: `fetchJobs`, `createJob`, `cancelJob`, `deleteJob`. Thunks handle loading and error state in the slice (e.g. `fetchJobs.pending` / `fulfilled` / `rejected`).

**Data flow (summary):** UI → dispatch(thunk) → API (jobService) → slice (pending/fulfilled/rejected) → selectors → UI via containers.

---

## 3. Performance Analysis

### 3.1 Optimizations (with code references)

- **Memoization**
  - **React.memo:** Used to avoid re-renders when props are unchanged in: `JobList.jsx`, `JobCard.jsx`, `Dashboard.jsx`, `Header.jsx`, `Sidebar.jsx`, `AlertContainer.jsx`, `Alert.jsx`, `FileUpload.jsx`, `JobTypeSelector.jsx`, `StatCard.jsx`, `ProgressBar.jsx`, `VirtualTable.jsx`, `JobMetrics.jsx`, `JobProgress.jsx`, and chart components (`MetricsChart.jsx`, `ProgressChart.jsx`, `ThroughputChart.jsx`, `SystemMetricsChart.jsx`).
  - **useCallback:** Used for stable event handlers and callbacks:
    - `JobForm.jsx`: `validateJobTypeAsync`, `validateFileAsync`, `handleFileSelect`, `handleJobTypeChange`, `handleOptionsChange`, `onSubmit`.
    - `JobCard.jsx`: `handleCancel`, `handleDelete`, `handleSelect`.
    - `FileUpload.jsx`: `handleFileChange`, `handleRemove`.
  - **useMemo:** Used for derived data and heavy computation:
    - `JobList.jsx`: sorted list of jobs.
    - `Dashboard.jsx`: `hasMetrics` and stats from selectors.
    - `JobForm.jsx`: `showSortOptions`, `showDedupOptions`.
    - Chart components: `chartData` in `SystemMetricsChart.jsx`, `MetricsChart.jsx`, `ThroughputChart.jsx`, `ProgressChart.jsx`.
    - `VirtualTable.jsx`: row renderer.
- **Selector stability:** In `useJobProgress.js`, metrics from Redux use a stable empty array (`EMPTY_METRICS`) when absent to avoid unnecessary rerenders (Redux “selector memoization” good practice).
- **Lazy loading:** Route-level components are loaded with `React.lazy()` and wrapped in `<Suspense>` in `App.jsx` to reduce initial bundle size: `HomePage`, `JobDetailPage`.
- **Virtual list:** `VirtualTable` (react-window) is used for large lists to limit DOM nodes and keep scrolling performant.

These choices avoid redundant re-renders and heavy recomputation in list and chart components.

---

## 4. Test Results

### 4.1 Strategy

- **Unit tests** target business logic and interactions: store (slices, reducers, thunks), services (api, jobService), utils (formatters, calculations), and components (JobList, JobCard, ProgressBar, Dashboard loading).
- **Coverage:** Vitest is configured so that **only critical logic** is measured (jobs flow, store, services, utils, key components and hooks). Thresholds are **≥ 75%** for lines, statements, functions, and branches on that set (assignment: “Test coverage ≥ 75% of critical logic”).

### 4.2 Running Tests

From the project root (TextOps):

```bash
npm run test:coverage
```

Use `npm run test:coverage -- --run` for a single run (e.g. in CI).

### 4.3 Test Execution and Coverage Output

All tests pass. Example terminal output:

```
 Test Files  10 passed (10)
      Tests  89 passed (89)
   Duration  ~4s
```

**Coverage summary (critical logic only):**

```
=============================== Coverage summary ===============================
Statements   : 87.19% ( 640/734 )
Branches     : 89.54% ( 137/153 )
Functions    : 87.5% ( 28/32 )
Lines        : 87.19% ( 640/734 )
================================================================================
```

**Per-file (critical logic):**

| File / area           | Lines  | Statements | Branches | Functions |
|-----------------------|--------|------------|----------|-----------|
| jobService.js         | 100%   | 100%       | 100%     | 100%      |
| jobsSlice.js          | 94.78% | 94.78%     | 100%     | 83.33%    |
| jobSelectors.js       | 100%   | 100%       | 88.88%   | 33.33%    |
| api.js                | 92.85% | 92.85%     | 86.66%   | 100%      |
| JobList.jsx           | 100%   | 100%       | 100%     | 100%      |
| JobCard.jsx           | 96.09% | 96.09%     | 71.42%   | 100%      |
| Dashboard.jsx         | 86.76% | 86.76%     | 85.71%   | 100%      |
| JobListContainer.jsx  | 81.39% | 81.39%     | 100%     | 100%      |
| useJobProgress.js     | 87.5%  | 87.5%      | 87.5%    | 100%      |
| calculations.js       | 100%   | 100%       | 90.9%    | 100%      |
| formatters.js         | 100%   | 100%       | 100%     | 100%      |
| **All files (critical)** | **87.19%** | **87.19%** | **89.54%** | **87.5%** |

Tests include edge cases (errors, race conditions, loading states, validation). An HTML report is generated under `coverage/` for detailed inspection.

**Statement:** Unit tests cover the store, services, utils, and key components; **coverage for critical logic is ≥ 75%** (currently 87%+). Tests run successfully locally and in CI (see Deployment plan).

---

## 5. Deployment Plan

### 5.1 Build Steps

1. **Install dependencies:** `npm ci` (or `npm install`).
2. **Build:** `npm run build` (Vite).
3. **Output:** Production assets in `dist/` (e.g. `dist/index.html`, `dist/assets/`).

### 5.2 Environment

- Configure `VITE_API_BASE_URL` and `VITE_WS_URL` for the target backend (e.g. `https://api.example.com/api`, `wss://api.example.com`). For local dev, use `.env` with `http://localhost:3001/api` and `http://localhost:3001`.

### 5.3 CI/CD Pipeline

The project includes a **GitHub Actions workflow** at `.github/workflows/ci.yml` that runs on every push and pull request to `main` or `master`:

1. **Checkout** code.
2. **Setup Node.js** (v20) with npm cache.
3. **Install dependencies:** `npm ci`.
4. **Lint:** `npm run lint`.
5. **Unit tests with coverage:** `npm run test:coverage` (must meet 75% thresholds).
6. **Build:** `npm run build`.

Optional next steps: deploy `dist/` to a static host (e.g. Vercel, Netlify) or run E2E (e.g. `npm run test:e2e`) in a separate job. Only code that passes lint, tests, and build is suitable for merge or deploy.

---

## 6. Core Features (4–5 Required)

The application implements **5 core features** that align with course themes:

| # | Feature | Description | Theme |
|---|---------|-------------|--------|
| 1 | **List/filter jobs** | Dashboard shows jobs; filter by status (all, running, completed, etc.). | State (Redux), selectors |
| 2 | **Create job (form + validation)** | JobForm: file upload, job type, conditional options (sort/dedup). Async validation via custom validators. | Forms, async validation |
| 3 | **Job detail & actions** | Job detail page; cancel/delete from list and detail. | Routing, state |
| 4 | **Real-time updates** | WebSocket updates for job progress and system metrics. | State, performance |
| 5 | **Dashboard/charts** | Stats cards and system metrics charts (CPU, memory, etc.). | Performance (memo, useMemo) |

**Backend:** The app uses the **TextOps-backend** (Node/Express) for REST and WebSocket. It can be replaced or supplemented by a mock (e.g. JSON-Server) with the frontend pointed at the corresponding base URL.

---

## 7. Rubric Alignment (Summary)

| Criteria | Weight | Implementation |
|----------|--------|----------------|
| **I. Architecture & structure** | 30% | Layered structure; Container/Presenter; Redux Toolkit; nested and protected routing; lazy loading; clear separation of store, services, components, hooks, utils. |
| **II. Functionality** | 30% | All core features (list/filter, create job with async validation, detail/actions, real-time, dashboard/charts) and protected routes work as intended. |
| **III. Optimization & performance** | 20% | memo, useCallback, useMemo; lazy loading; stable selectors; VirtualTable for large lists; no redundant re-renders in measured flows. |
| **IV. Testing** | 10% | **≥ 75% coverage of critical logic** (achieved 87%+); 89 tests; edge cases and interactions covered; tests run successfully. |
| **V. Documentation (report)** | 10% | This REPORT.md: architecture and diagram, technical justification, performance analysis with code references, test results with coverage, deployment and CI/CD. |

---

*TextOps – Technical Report for Full-Scale Advanced Front-End Application Development.*
