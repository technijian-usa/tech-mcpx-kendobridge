> _Source: docs/08_ui_ux.docx_

**Document: 08 – UI / UX Specification**

**Project:** MCPX-KendoBridge Admin Portal  
**Document ID:** TJ-MCPX-DOC-08  
**Version:** 1.2.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** UX Lead / Frontend Lead (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author**    | **Change Summary**                                                                                                            | **Status** |
|-------------|------------|---------------|-------------------------------------------------------------------------------------------------------------------------------|------------|
| 1.0.0       | 2025-09-26 | Doc-Factory   | Initial Figma prototype notes                                                                                                 | Draft      |
| 1.1.0       | 2025-09-27 | UX + FE Leads | Swap shadcn/Radix → **KendoReact (Fluent 2)**; ThemeBuilder tokens; MSAL PKCE auth; env badge; SSE progress UI; Evidence link | Draft      |
| 1.2.0       | 2025-09-27 | UX + FE Leads | **Added /sessions page** (session monitor + terminate), acceptance criteria updates, cross-links to 08a                       | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| Security/Compliance       |          |                    |             |
| QA Lead                   |          |                    |             |

**1. Purpose**

Define the **production UI/UX** for the Admin Portal using **KendoReact (Fluent 2 theme)** with **ThemeBuilder tokens**. This converts the Figma Make prototype (shadcn/Radix visuals) into a **1:1 component map**, adds **Azure SSO (MSAL PKCE)** flows, and specifies accessibility, routing, streaming (SSE), and the new **Sessions** view.

**2. Scope**

Web SPA only (React + KendoReact). API behavior lives in FR/NFR and OpenAPI. Personas: **Portal.Admin** (full), **Portal.Viewer** (read-only).

**3. Design System & Theming**

**3.1 Component Library (single source)**

- **Production:** @progress/kendo-react-\* with @progress/kendo-theme-fluent.

- **No mixed systems** in production (no shadcn/Radix). Any non-mapped Figma element must be replaced with the nearest Kendo component.

**3.2 ThemeBuilder Tokens (source of truth)**

- Tokens exported from **ThemeBuilder** (vendored under design/themebuilder/export/...).

- Import the generated Fluent 2 CSS/SCSS; **do not** hard-code palette or radii.

- Tokens govern color, radius, spacing, typography, and chart palette.

**3.3 Responsiveness & Layout**

- Shell uses **Kendo Drawer** (sidebar) + **Kendo AppBar** (header).

- Breakpoints: ≥1280 (desktop), 768–1279 (tablet), \<768 (compact). Drawer collapses to icons in compact.

**4. Authentication UX (MSAL PKCE)**

**4.1 Login**

- Unauthenticated users are redirected to AAD.

- On success, route to **/dashboard**; show **environment badge** (Alpha/Beta/RTM/Prod) sourced from /config/effective.

- Tokens are **not** stored in localStorage. Prefer session storage or secure cookie per app decision.

**4.2 Roles & Visibility**

- **Server is authoritative**. UI hides actions where role lacks permission, but API enforces RBAC.

- Viewer: read-only; Admin: CRUD on config/flags/lookups, jobs, CORS allow-list, access (if enabled), and **terminate session**.

**5. Information Architecture & Routing**

| **Route**      | **Roles**    | **Purpose / Key Modules**                                                                                                |
|----------------|--------------|--------------------------------------------------------------------------------------------------------------------------|
| /login         | Public       | AAD redirect start (MSAL)                                                                                                |
| /dashboard     | Admin/Viewer | Health/Ready cards; p50/p95/error%; uptime; version; queue depth; environment badge                                      |
| /sessions      | Admin/Viewer | **Session monitor**: list active/background sessions (ID, user/role, start, last heartbeat, status); Admin can terminate |
| /config        | Admin/Viewer | **Effective config** grid (non-secrets); export                                                                          |
| /config/keys   | Admin        | App config CRUD dialogs; audit panel                                                                                     |
| /flags         | Admin        | Feature flags list + toggles (optional scoping by env/role)                                                              |
| /lookups       | Admin        | Lookup tables (add/update/deprecate); referential hints                                                                  |
| /jobs          | Admin        | Job launcher form; **SSE progress** viewer with heartbeats + reconnect                                                   |
| /audit         | Admin        | Audit trail filters; details drawer; export                                                                              |
| /evidence      | Admin/Viewer | Releases grid; Evidence Pack artifacts; checksums/attestations                                                           |
| /access        | Admin        | AAD user search + role assignment (if Graph write enabled) or Change-Request generator                                   |
| /security/cors | Admin        | CORS allow-list editor with optional two-person approval                                                                 |

**6. Component Mapping (Figma → KendoReact Fluent 2)**

| **Figma / Prototype Element**     | **KendoReact Fluent 2**                         | **Notes**                                            |
|-----------------------------------|-------------------------------------------------|------------------------------------------------------|
| App Shell (sidebar + header)      | **Drawer**, **AppBar**, **Avatar**, **Menu**    | Environment badge in AppBar; user menu with sign-out |
| Cards / KPIs                      | **Card**, **Typography**                        | Dashboard tiles; compact variants for tablet/mobile  |
| Tables / Lists                    | **Grid**                                        | Server paging/sorting/filtering; CSV export          |
| Charts (latency, error%)          | **Charts (React)**                              | Line/area for time-series; use tokens for color      |
| Forms (config/flags/lookups/jobs) | **Form**, **Inputs**, **DropDowns**, **Switch** | Validation summary; async submit with toasts         |
| Dialogs / Modals                  | **Dialog**                                      | Confirmations, edit forms, error details             |
| Notifications / Toasts            | **Notification**                                | Success/warn/error with requestId                    |
| Breadcrumbs / Nav                 | **Breadcrumb**                                  | Reflect IA; show current page                        |
| Tabs / Segments                   | **TabStrip**                                    | Use where prototype shows segmented controls         |
| Progress Bar / Skeletons          | **ProgressBar**, **Skeleton**                   | Job progress; loading placeholders                   |
| Tooltips                          | **Tooltip**                                     | Keyboard accessible; no hover-only critical info     |
| “Sheet”/Slide-over details        | **Drawer** (right side)                         | Details & audit panels                               |
| Resizable Panels                  | **Splitter**                                    | Prefer over custom resizers                          |

**7. Pages — Detailed UI Behavior**

**7.1 Dashboard**

- **Cards:** Health/Ready, Version/Uptime, Queue depth, p50/p95 latency, Error rate.

- **Charts:** Request rate & error percentage (last 15m/1h).

- **Env Badge:** color + label from /config/effective.

- **Empty/Error states:** friendly copy + retry.

- **A11y:** announce live updates politely.

**7.2 Effective Config (/config)**

- **Grid Columns:** key, description, value, type, scope, last changed (who/when), tags.

- **Filtering/Paging:** server-side; search by key/tag.

- **Export:** CSV.

- **Secrets:** never shown.

**7.3 App Config Keys (/config/keys)**

- **Add/Update dialogs** with validation; **audit panel** (before→after).

- **Idempotency:** send Idempotency-Key on submit; dedupe retries.

- **Toasts** on success/failure (include requestId).

**7.4 Feature Flags (/flags)**

- **Grid + Switch** toggle; optional targeting by env/role; all changes audited.

- Display current evaluation (true/false) for current user/env.

**7.5 Lookups (/lookups)**

- **Grid per domain**; add/update/deprecate (soft-delete).

- Warn if referenced; show referential hints.

**7.6 Jobs & Streaming (/jobs)**

- **Create Job** form → Job ID.

- Open **SSE** to /jobs/{id}/events:

  - Events: progress (with %/message), **heartbeat** every ≤10s, terminal completed\|failed.

  - **Reconnect** with backoff; if supported, use Last-Event-ID.

  - **TTFB target ≤ 200ms** for first event.

- **Progress UI:** progress bar, event log list, final status with duration.

- **Errors:** standardized envelope; show requestId.

**7.7 Audit (/audit)**

- Filters: actor, action, entity, date.

- **Grid + Drawer** (before→after JSON).

- CSV export.

**7.8 Evidence (/evidence)**

- Releases list; artifact links (OpenAPI diff, CodeQL, SBOM, axe, **k6**, parity, approvals).

- Show checksums/attestations.

- Link from footer “Evidence” and dashboard quick-actions.

**7.9 Access (/access)**

- Search AAD user; view role/group; **Assign/Remove** if Graph write enabled.

- If not enabled: **Generate Change Request** (pre-filled), copy/download.

**7.10 Security / CORS (/security/cors)**

- Env selector; **Allowed Origins** grid.

- Optional two-person approval.

- All edits audited.

**7.11 Sessions (/sessions) — new**

**Goal:** Visibility into active/background sessions; allow **Admin** to terminate a session. **Viewer** is read-only.

- **Layout:** **Grid** (server paging/sort/filter).  
  **Columns:** sessionId, user, role, clientIp, startedAt, lastHeartbeat, status (active\|idle\|ended).

- **Live Indicators:**

  - status badge;

  - “Last heartbeat” auto-updates (poll or SSE if available);

  - row shimmer (**Skeleton**) during refresh.

- **Actions (Admin only):** Terminate per row → confirm **Dialog** → success **Notification** (shows requestId).

- **Errors:** envelope surfaced inline; never expose stack traces.

- **A11y:** keyboard row actions, labelled buttons, focus returned to row after action.

- **Feature Flag:** expose **Terminate** only when API endpoint is enabled.

**8. Accessibility (WCAG 2.2 AA)**

- Keyboard operable paths for all pages; **visible focus**.

- Labels, ARIA roles/states; toasts use **live region**.

- Contrast via tokens ≥ 4.5:1.

- Axe checks run in CI; **0 critical** before merge.

**9. Content & Copy Guidelines**

- Errors: concise, actionable; include **requestId**.

- Empty states: explain purpose + next step (e.g., “No sessions yet — check back soon”).

- Time/number formats: ISO in logs/tooltips; humanized in UI (e.g., “2m 13s”).

**10. Performance & Reliability UX**

- **Skeletons** for grids/charts \>250 ms load.

- **Optimistic UI** for quick toggles (flags), rollback on failure.

- **SSE reconnection** banner with jittered backoff.

- Bundle size budget for initial route: **≤ 500 KB gz**; defer heavy charts until visible.

**11. Security & Privacy UX**

- No secrets or stack traces in UI.

- Env info (host/origin) is Admin-only.

- Evidence links visible to Viewer but without mutating controls.

- Session **Terminate** confirms impact and logs audit context.

**12. KendoReact Implementation Notes**

- Install: @progress/kendo-react-buttons, -inputs, -layout, -grid, -charts, -dialog, -form, etc.

- Theme: @progress/kendo-theme-fluent (or ThemeBuilder package).

- Providers: Kendo Intl + Router + MSAL provider at app root.

- Grid: use server operations (onDataStateChange) for paging/sorting/filtering.

**13. Navigation, States & Guards**

- **Auth Guard:** redirect unauthenticated → /login; after SSO, return to intended route.

- **Role Guard:** hide unauthorized actions; disabled buttons show tooltip “Requires Admin role.”

- **Environment Badge:** read from /config/effective (e.g., EnvironmentName).

**14. Telemetry & Observability Hooks**

- Log page views and key actions with **requestId** correlation.

- **SSE metrics:** connection start/stop, first-event ms, heartbeat gap, reconnects.

- **Sessions:** log terminate events with sessionId + actor; expose “last heartbeat” as a metric.

- UI error boundary logs unhandled exceptions (redacted) with requestId.

**15. Acceptance Criteria (UI/UX)**

1.  All mapped pages implemented in **KendoReact Fluent 2** with ThemeBuilder tokens; no shadcn/Radix in production.

2.  AAD login (MSAL PKCE) + route guards; **Viewer** cannot mutate.

3.  Dashboard renders health/ready, p50/p95, error rate; env badge from config.

4.  Jobs page streams **SSE** with **TTFB ≤ 200 ms** and **heartbeat ≤ 10 s**; supports reconnect.

5.  Effective config shows **non-secrets only**; CSV export works.

6.  **Sessions page present**:

    - Viewer: read-only list;

    - Admin: **Terminate** with confirm dialog → success toast with requestId;

    - “Last heartbeat” updates without page reload.

7.  Accessibility: axe CI **0 critical**; keyboard/focus paths verified.

8.  Evidence page lists release artifacts with checksums; footer/header link present.

9.  Initial route bundle **≤ 500 KB gz**.

**16. Cross-References & Appendices**

- **08a – UI Component Mapping (shadcn → KendoReact Fluent 2)**: concrete component substitutions and code sketches.

- **09 – Test Strategy**: E2E for /sessions, negative RBAC, SSE k6 thresholds.

- **11 – Monitoring**: SSE TTFB/heartbeat dashboards; session heartbeat metric.

- **12 – Evidence Pack**: a11y report, k6 results, screenshots.

**17. Open Issues**

- Confirm Sessions data source (poll vs SSE).

- Decide Terminate behavior for long-running jobs (graceful cancel vs hard stop).

- Finalize default dashboard chart windows (15m vs 1h).
