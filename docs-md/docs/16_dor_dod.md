> _Source: docs/16_dor_dod.docx_

**Document: 16 – DoR / DoD (Definition of Ready / Definition of Done)**

**Project:** MCPX-KendoBridge Admin Portal  
**Document ID:** TJ-MCPX-DOC-16  
**Version:** 1.1.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** Program Management (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author**         | **Change Summary**                                                       | **Status** |
|-------------|------------|--------------------|--------------------------------------------------------------------------|------------|
| 1.0.0       | 2025-09-26 | Doc-Factory        | Initial DoR/DoD checklist                                                | Draft      |
| 1.1.0       | 2025-09-27 | Program Management | Align to MSAL PKCE, Kendo Fluent 2, SP-only DAL, SSE SLOs, Evidence Pack | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| DevSecOps / SRE           |          |                    |             |
| Security / Compliance     |          |                    |             |
| QA Lead                   |          |                    |             |

**1) Purpose & Scope**

This document defines **entry** (Ready) and **exit** (Done) criteria for:

- **User Stories / Tasks**

- **Epics**

- **Release Promotions** (Alpha → Beta → RTM → Prod)

It ensures each increment is implementable, testable, secure, compliant, and observable, with auditable evidence.

**2) DoR — User Story / Task (all must be true)**

**A. Clarity & Traceability**

- [ ] Story has **clear objective** and acceptance criteria; links to **UC / FR / NFR**.

- [ ] Dependencies identified (API endpoints, SPs, feature flags, tokens, configs).

- [ ] Any blocking ADRs or approvals listed (security, DB, access).

**B. Design & UX**

- [ ] Figma frame(s) referenced by route name; **component mapping to KendoReact Fluent 2** is specified.

- [ ] ThemeBuilder tokens to be used are identified (no hard-coded colors/sizes).

**C. Architecture & Contracts**

- [ ] OpenAPI path(s) defined or updated (status codes, error envelope).

- [ ] DB impact documented: **SP-only** contracts; **add-only** schema; migration stub named.

**D. Security & Privacy**

- [ ] RBAC behavior defined (Portal.Admin / Portal.Viewer).

- [ ] CORS behavior defined; rate-limit class (JSON/SSE) identified.

- [ ] No secrets in code; config keys are **non-secret** or point to secret store.

**E. Testability**

- [ ] Test plan notes unit / component / contract / E2E (+ negative cases).

- [ ] Perf need called out (e.g., SSE TTFB, p95 latency) with thresholds.

- [ ] A11y expectations noted (keyboard path, labels, contrast).

**F. Operability**

- [ ] Logging fields & metrics to emit (requestId/jobId/latency/heartbeat) specified.

- [ ] Monitoring widgets/alerts impact noted (if any).

**G. Done Definition Stubs**

- [ ] “Evidence to collect” listed (reports, signatures, screenshots, SBOM slice, etc.).

- [ ] Story sized and groomed; team capacity confirmed.

**3) DoD — User Story / Task (all must be true)**

**A. Code & Build**

- [ ] Implementation merged; **KendoReact Fluent 2 only** (no shadcn/Radix).

- [ ] MSAL PKCE flows honored for any auth path; UI hides unauthorized actions, server enforces RBAC.

- [ ] API uses **error envelope** consistently; no secrets returned.

- [ ] DB access via **stored procedures only**; migrations follow **add-only** rules.

**B. Tests**

- [ ] Unit & component tests pass; contract tests align with OpenAPI.

- [ ] E2E (Playwright) exercised for happy & negative paths (403/429/CORS).

- [ ] A11y (axe) **0 critical**.

- [ ] If SSE involved: verified **TTFB ≤ 200 ms** and **heartbeat ≤ 10 s** (local/dev profile).

**C. Quality Gates (CI)**

- [ ] Lint/format passed; **CodeQL / Dependency Review / Secret Scan** green.

- [ ] OpenAPI lint/diff green (or waiver recorded).

- [ ] SBOM generated.

**D. Observability**

- [ ] Logs include requestId (and jobId where applicable).

- [ ] Metrics added/updated (latency histos, SSE counters).

- [ ] Dashboards/widgets updated if new SLI/SLO affected.

**E. Docs & Evidence**

- [ ] FR/UX/Context updated as needed.

- [ ] **DocX→MD mirror** reflects changes.

- [ ] Story-level evidence attached (screenshots, test outputs, perf snippet).

**F. Review & Handover**

- [ ] Code review approvals received; risk notes captured.

- [ ] Runbooks updated if operational behavior changed.

**4) DoR — Epic (all must be true)**

- [ ] Epic decomposed into groomed stories with DoR met.

- [ ] Architecture impact reviewed; ADRs drafted/approved.

- [ ] OpenAPI coverage enumerated; breaking-change strategy (versioning) defined.

- [ ] DB plan: new **SP signatures** sketched; grants impact noted.

- [ ] Security review done (RBAC, CORS, rate-limit, error taxonomy).

- [ ] Monitoring additions defined (metrics, dashboards, alerts).

- [ ] Rollout/flag plan and fallback defined.

**5) DoD — Epic (all must be true)**

- [ ] All stories meet Story DoD; **Epic demo** complete.

- [ ] OpenAPI diff is non-breaking (or waivers documented); artifacts ready.

- [ ] **SPs implemented**; **EXECUTE-only** grants merged; **signature snapshot** captured.

- [ ] SSE SLOs verified where applicable (TTFB/heartbeat).

- [ ] Dashboards & alerts live; runbooks updated.

- [ ] Epic section added to release notes; risks & follow-ups logged.

**6) Promotion Gates — Release Level**

**6.1 Alpha → Beta (must pass all)**

- [ ] CI green: build/tests, OpenAPI lint/diff, CodeQL, Dependency Review, Secret Scan.

- [ ] A11y axe 0 critical.

- [ ] Evidence Pack: build/test reports, OpenAPI diff, SBOM, scanners, **docs mirror** + **TREE.md** present.

**6.2 Beta → RTM (all above +)**

- [ ] Perf smoke executed (k6 SSE TTFB if applicable) within thresholds.

- [ ] DB migrations & **SP signature snapshot** produced.

- [ ] Monitoring dashboards created/updated; alert policies committed.

**6.3 RTM → Prod (all above +)**

- [ ] **Config parity = 0 critical diffs** (intended Prod vs RTM effective).

- [ ] Readiness stable; no alert storms; on-call sign-off.

- [ ] Approvals recorded (protected environment rules).

**7) Quick Checklists (copy into PRs)**

**7.1 Story DoR (paste in description)**

- ACs linked to UC/FR/NFR

- Figma → Kendo map noted; tokens identified

- OpenAPI endpoints & responses listed

- SP-only plan / migration name

- RBAC/CORS/rate-limit behavior

- Test plan (unit/component/contract/E2E/a11y/perf)

- Logs/metrics to emit

- Evidence to attach

**7.2 Story DoD (paste in checklist)**

- Kendo Fluent 2 only; MSAL PKCE where applicable

- Unit/comp/contract/E2E green; axe 0 critical

- OpenAPI diff green/waived; SBOM + scanners green

- SSE SLOs met (if used)

- Logs/metrics added; dashboards updated (if needed)

- Docs updated; DocX→MD mirror ok

- Evidence attached; reviewers approved

**7.3 Release Gate (PR to promote)**

- Evidence Pack complete (see 12)

- Perf smoke attached

- SP signature snapshot attached

- Parity report attached (RTM only)

- Approvals recorded

**8) Non-Negotiables (apply everywhere)**

- **SP-only DAL**; **add-only** schema; audit on all mutations.

- **Error envelope** for all errors (code/message/details?/requestId).

- **CORS allow-list** per env; deny by default.

- **Rate limiting** enforced; **429 + Retry-After** when breached.

- **No secrets in code or /config/effective**.

- **KendoReact Fluent 2** as the only production UI library.

- **MSAL PKCE** for SSO; server-side RBAC authoritative.

- **SSE budgets**: **TTFB ≤ 200 ms**, **heartbeat ≤ 10 s**.

**9) Roles & Ownership (who enforces)**

| **Area**        | **Accountable** | **Responsible**   |
|-----------------|-----------------|-------------------|
| DoR quality     | PM              | DL / SA / UX / QA |
| DoD enforcement | DoSE            | DL / QA / SRE     |
| Security gates  | SEC             | DL / SA / SRE     |
| DB contracts    | SA              | DBA               |
| Evidence Pack   | DoSE            | SRE               |
| Release gates   | DoSE            | RM                |

**10) Acceptance Criteria (Document)**

- Checklists adopted in PR templates.

- CI validates presence of required artifacts at each gate.

- Evidence Pack includes **signature snapshot**, **perf smoke**, **parity** where applicable.

- DoR/DoD reviewed quarterly and updated via ADR if practices change.

**End of Document — TJ-MCPX-DOC-16 v1.1.0**
