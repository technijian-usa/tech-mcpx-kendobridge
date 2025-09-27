> _Source: docs/15_backlog.docx_

**Document: 15 – Backlog**

**Project:** MCPX-KendoBridge Admin Portal  
**Document ID:** TJ-MCPX-DOC-15  
**Version:** 1.1.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** Product & Engineering Leads (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author**     | **Change Summary**                                        | **Status** |
|-------------|------------|----------------|-----------------------------------------------------------|------------|
| 1.0.0       | 2025-09-26 | Doc-Factory    | Initial epics & stories                                   | Draft      |
| 1.1.0       | 2025-09-27 | Prod+Eng Leads | Align to MSAL, Kendo Fluent 2, SSE, parity, CI path fixes | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| Security/Compliance       |          |                    |             |
| QA Lead                   |          |                    |             |

**1. Prioritization & Traceability**

- **Method:** MoSCoW per epic/story; RICE used ad-hoc for tie-breakers.

- **Traceability tags:** *(UC-xx)* Use Cases, *(FR-…)* Functional Requirements, *(NFR-…)* Non-Functional, *(MON-…)* Monitoring, *(CI-…)* CI/CD.

**2. Epics (with key stories)**

**EP-01 Auth & RBAC (Must)**

- **US-01.1** As an admin, I sign in via **MSAL PKCE** and land on /dashboard. *(UC-01, FR-AUTH-01/02, NFR-SEC-01)*  
  **AC:** 302 to AAD; JWT validated; env badge visible.

- **US-01.2** As a viewer, I can read but not mutate. *(UC-01, FR-AUTH-03)*  
  **AC:** Mutations return 403; UI hides controls.

**EP-02 Admin Shell & Theming (Must)**

- **US-02.1** Convert prototype to **KendoReact (Fluent 2)** shell (Drawer/AppBar). *(08 UI/UX)*  
  **AC:** No shadcn/Radix in prod bundle.

- **US-02.2** Import **ThemeBuilder** package; tokens drive styling. *(08 UI/UX)*  
  **AC:** Single CSS/SCSS import; visual parity to Figma.

**EP-03 Health & Dashboard (Must)**

- **US-03.1** Cards for Health/Ready, Version/Uptime, p50/p95, Error %, Queue Depth. *(UC-02, FR-HEALTH-01/02, MON-SLO)*  
  **AC:** /healthz p95 ≤ 150ms; charts render.

**EP-04 Effective Config (Must)**

- **US-04.1** Read **/config/effective** grid (non-secrets). *(UC-03, FR-CONF-01/02)*  
  **AC:** CSV export; filter/sort server-side.

**EP-05 App Config Mutations (Must)**

- **US-05.1** CRUD via sp_Config_SetValue with **AuditEvent**. *(UC-04, FR-CONF-03/04)*  
  **AC:** Audit who/what/when (before→after); idempotency header honored.

**EP-06 Feature Flags (Must)**

- **US-06.1** Toggle flags; optional scoping by env/role. *(UC-05, FR-FLAG-01/02/03)*  
  **AC:** Audit entries; evaluation visible.

**EP-07 Lookups (Should)**

- **US-07.1** Manage lookup values with **add-only** policy. *(UC-06, FR-LOOK-01/02)*  
  **AC:** Deprecation instead of delete; referential hints.

**EP-08 Jobs & SSE (Must)**

- **US-08.1** Launch job & stream progress/heartbeats. *(UC-07, FR-JOB-01/02/04, NFR-SSE)*  
  **AC:** **TTFB ≤ 200ms**, heartbeat ≤ 10s, reconnect works.

- **US-08.2** SSE background notifications require Mcp-Session-Id. *(UC-07)*  
  **AC:** Missing header ⇒ 400 envelope.

**EP-09 Audit & Evidence (Should)**

- **US-09.1** Audit UI with filters & export. *(UC-08, FR-AUD-01/02)*

- **US-09.2** Evidence page lists artifacts (OpenAPI diff, CodeQL, SBOM, axe, **k6**, parity, approvals). *(UC-11, 12 Evidence Pack)*

**EP-10 Access Control (Graph) (Could)**

- **US-10.1** Assign/remove users via Graph (if enabled) or produce **Change Request**. *(UC-10, FR-ACCESS-01/02)*

**EP-11 Security / CORS & Rate-limit (Must)**

- **US-11.1** CORS allow-list editor with audit. *(UC-09, FR-CORS-01/03)*

- **US-11.2** Rate-limit policy (429 envelope + Retry-After). *(UC-13, FR-ERR-02, NFR-SEC-07)*

**EP-12 Readiness & Parity (Must)**

- **US-12.1** /ready drives RTM gate; **parity = 0 critical** to promote. *(UC-12, NFR-GATE-01, 10 CI/CD)*

**EP-13 Observability (Must)**

- **US-13.1** SSE metrics (first-event ms, heartbeat gap, reconnects). *(MON-SSE)*

- **US-13.2** Alerts: p95 breach, 5xx spike, **heartbeat gap \> 15s**, parity blocked. *(11 Monitoring)*

**EP-14 DB Layer & Grants (Must)**

- **US-14.1** Implement mutation SPs + **AuditEvent**. *(07 Data Contracts)*

- **US-14.2** **EXECUTE-only** grants for app_mcpx; no table DML. *(07a Grants)*

- **US-14.3** SP **signature snapshot** collected and attached to release. *(07a Grants §Evidence)*

**EP-15 CI/CD & Docs Visibility (Must)**

- **US-15.1** Fix OpenAPI path case or folder name; CI passes on Linux. *(10 CI/CD)*

- **US-15.2** Canonicalize expected-config filename; update parity job. *(10 CI/CD, 12 Evidence)*

- **US-15.3** Remove duplicate placeholder k6 file; keep single **tests/perf/k6_sse_ttfb.js**. *(09 Test Strategy)*

- **US-15.4** **DocX→MD** mirror and **TREE.md** generated on push. *(10 CI/CD, 12 Evidence)*

**3. Sprint Plan (2-week sprints)**

**Sprint 1 (Must)**

- EP-01 US-01.1/01.2 (MSAL PKCE, RBAC)

- EP-02 US-02.1/02.2 (Shell + ThemeBuilder)

- EP-03 US-03.1 (Dashboard basics)

- EP-15 US-15.1 (OpenAPI path fix)

**Exit:** Login E2E green; dashboard renders; CI green; axe 0 critical.

**Sprint 2 (Must)**

- EP-04 US-04.1 (Effective config read)

- EP-05 US-05.1 (Config upsert + audit)

- EP-11 US-11.1 (CORS editor)

- EP-15 US-15.2/15.3 (parity filename; k6 file)

**Exit:** Config CRUD audited; parity file canonical; k6 path unified.

**Sprint 3 (Must)**

- EP-06 US-06.1 (Flags)

- EP-07 US-07.1 (Lookups)

- EP-08 US-08.1 (Jobs + SSE stream)

- EP-13 US-13.1 (SSE metrics)

**Exit:** **TTFB ≤ 200ms** met in perf smoke; heartbeat ≤ 10s; SSE dashboard exists.

**Sprint 4 (Should)**

- EP-09 US-09.1/09.2 (Audit & Evidence)

- EP-12 US-12.1 (Parity gate + /ready integration)

- EP-13 US-13.2 (Alerts)

**Exit:** Evidence Pack complete; parity widget + alert wired; promotion Beta→RTM ready.

**Sprint 5 (Could/Policy)**

- EP-10 US-10.1 (Access via Graph or CR flow)

- EP-11 US-11.2 (Rate-limit policy live)

**Exit:** 429 envelope verified; Access flow selected and working.

**4. Story Details (samples)**

**US-08.1 Launch Job & Stream (SSE) — Must**  
**DoR:** API endpoint defined; SSE event schema; job types; perf targets.  
**AC:**

1.  POST returns Job ID; idempotency prevents dups.

2.  First SSE event **≤ 200ms**; heartbeat ≤ 10s.

3.  Reconnect resumes; final state with duration.  
    **DoD:** Unit/integration + Playwright tests; **k6** threshold met; monitoring panels live; docs updated.

**US-15.1 OpenAPI Path Fix — Must**  
**AC:** CI references match actual folder (api/openapi/ or api/OpenApi/); Linux runner green.  
**DoD:** Commit with CI passing; note in 10 CI/CD.

**5. Non-Feature Work (Hardening / Compliance)**

- **HF-01** Add Content-Security-Policy headers (report-only burn-in). *(NFR-SEC-08)*

- **HF-02** SBOM signing/attestation (if infra available). *(12 Evidence)*

- **HF-03** A11y manual keyboard path review. *(NFR-A11Y)*

- **HF-04** Runbook drills: rollback & incident. *(Runbooks)*

**6. Dependencies & Assumptions**

- Azure AD app registration (redirect URIs, app roles/groups).

- SQL Server reachable; app_mcpx login/user provisioned.

- ThemeBuilder export available in repo.

- Monitoring backend (Grafana/Azure Monitor/ELK) and alerting channel configured.

**7. Definition of Ready (DoR) — per story**

- Clear acceptance criteria & negative paths.

- Data contracts & API paths known; SPs identified.

- Test approach noted (unit/integ/E2E/perf/a11y).

- Security notes (RBAC, CORS, rate-limit) captured.

**8. Definition of Done (DoD) — per story**

- Code + tests merged; **CI green**; **axe 0 critical**.

- Docs updated (FR/NFR/UI/Monitoring as relevant).

- Evidence artifacts attached (OpenAPI diff, test outputs, SBOM, etc.).

- Metrics and alerts visible on dashboards.

**9. Backlog Register (condensed)**

| **ID**  | **Title**                        | **Epic** | **Priority** | **Links (UC/FR/NFR)** |
|---------|----------------------------------|----------|--------------|-----------------------|
| US-01.1 | MSAL PKCE login                  | EP-01    | **M**        | UC-01, FR-AUTH-01/02  |
| US-02.1 | Kendo shell (Drawer/AppBar)      | EP-02    | **M**        | 08 UI/UX              |
| US-03.1 | Dashboard cards & charts         | EP-03    | **M**        | UC-02, FR-HEALTH-02   |
| US-04.1 | Effective config grid            | EP-04    | **M**        | UC-03, FR-CONF-01/02  |
| US-05.1 | Config upsert + audit            | EP-05    | **M**        | UC-04, FR-CONF-04     |
| US-06.1 | Flags toggle                     | EP-06    | **M**        | UC-05, FR-FLAG-01..03 |
| US-08.1 | Jobs SSE stream                  | EP-08    | **M**        | UC-07, FR-JOB-01..04  |
| US-09.2 | Evidence page                    | EP-09    | **S**        | UC-11, 12 Evidence    |
| US-11.1 | CORS allow-list editor           | EP-11    | **M**        | UC-09, FR-CORS-01/03  |
| US-11.2 | Rate-limit policy                | EP-11    | **S**        | UC-13, FR-ERR-02      |
| US-12.1 | RTM parity gate                  | EP-12    | **M**        | UC-12, NFR-GATE-01    |
| US-13.1 | SSE metrics & dashboards         | EP-13    | **M**        | 11 Monitoring         |
| US-14.1 | Mutation SPs + AuditEvent        | EP-14    | **M**        | 07 Data Contracts     |
| US-14.2 | EXECUTE-only grants              | EP-14    | **M**        | 07a Grants            |
| US-15.1 | OpenAPI path case fix            | EP-15    | **M**        | 10 CI/CD              |
| US-15.2 | Parity filename canonicalization | EP-15    | **M**        | 10 CI/CD, 12 Evidence |
| US-15.3 | Unify k6 perf script             | EP-15    | **M**        | 09 Test Strategy      |
| US-15.4 | DocX→MD + TREE.md pipelines      | EP-15    | **M**        | 10 CI/CD              |

**End of Document — TJ-MCPX-DOC-15 v1.1.0**
