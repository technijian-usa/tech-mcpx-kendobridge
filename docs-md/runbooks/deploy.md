> _Source: runbooks/deploy.docx_

**Runbook: Deploy (Alpha → Beta → RTM → Prod)**

**Project:** MCPX-KendoBridge Admin Portal  
**Runbook ID:** TJ-MCPX-RB-01  
**Version:** 1.1.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** Release Manager / DevSecOps (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author** | **Change Summary**                                                            | **Status** |
|-------------|------------|------------|-------------------------------------------------------------------------------|------------|
| 1.0.0       | 2025-09-26 | RM + SRE   | Initial deploy procedure                                                      | Draft      |
| 1.1.0       | 2025-09-27 | RM + SRE   | Added parity gate, SSE perf smoke, SP-signature snapshot, DocX→MD/TREE checks | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| Security & Compliance     |          |                    |             |
| QA Lead                   |          |                    |             |

**1) Purpose**

Define the **repeatable, auditable** steps to deploy the Admin API & Web across **Alpha → Beta → RTM → Prod**, including DB migrations, parity checks, SSE smoke, and Evidence Pack creation.

**2) Scope**

- **API (.NET 8)**, **Web (React + KendoReact Fluent 2)**, **SQL Server 2022** migrations/SPs

- **Azure SSO** config references (no changes here)

- **Environments:** Alpha, Beta, RTM, Prod

- **Out-of-scope:** non-admin/tenant apps

**3) Pre-Deploy Checklist (per environment)**

**Blocking items must be ✅ before proceeding.**

**A. Release Inputs**

- ✅ Commit SHA & tag selected; release notes draft started

- ✅ OpenAPI path casing verified in CI (matches repo folder)

- ✅ DocX→MD mirror & TREE.md present at release commit

**B. Secrets & Config**

- ✅ No secrets in repo; env secrets present (incl. **KENDO_UI_LICENSE**)

- ✅ config/expected/expected-prod.json (canonical) maintained (for RTM→Prod)

- ✅ CORS allow-list correct for target env

**C. Database**

- ✅ Migrations are **add-only**; no destructive DDL

- ✅ App principal **EXECUTE-only** grants in place (no table DML)

- ✅ SP **signature snapshot** collector available (runs post-deploy)

**D. Quality Gates (CI green)**

- ✅ Build/tests (API & Web)

- ✅ OpenAPI lint/diff (waivers recorded if needed)

- ✅ CodeQL, Dependency Review, Secret Scan

- ✅ SBOM generated

- ✅ axe (a11y) shows **0 critical**

**E. Observability**

- ✅ Dashboards exist (Executive, API Perf, **SSE Health**, Readiness & Parity)

- ✅ Alert policies committed (p95 breach, 5xx spike, **SSE heartbeat gap**, parity blocked)

**4) Deploy Steps (Alpha → Beta → RTM → Prod)**

**Step 1 — Announce & Freeze (5–10 min)**

- Notify \#release channel (env, window, SHA)

- Freeze non-urgent merges to main until deploy completes

**Step 2 — Build & Artifact Stage**

- CI builds API & Web

- **Activate Kendo license** in CI before npm run build

- Upload artifacts (API package, Web build, SBOM, test reports)

**Step 3 — Database Migrations**

- Apply migrations to target env (idempotent, **add-only**)

- Verify:

  - App user has **only EXECUTE** on whitelisted SPs

  - No table DML rights

**Step 4 — API Deploy**

- Roll out API package (slot or rolling)

- Wait for **/healthz** green; then **/ready** green

**Step 5 — Web Deploy**

- Publish static build to target hosting

- Run synthetic: login (MSAL) → /dashboard cards render; env badge correct

**Step 6 — Post-Deploy Verification (Alpha/Beta)**

- Contract tests (OpenAPI) against target

- **SSE Smoke (k6):** validate **TTFB ≤ 200 ms** and heartbeat **≤ 10 s**

- Quick UI passes: /config, /flags, /jobs stream, /evidence list

**Step 7 — Evidence Capture (Alpha/Beta)**

- Attach to the release:

  - Build/test outputs, OpenAPI diff, CodeQL & Dependency Review, Secret Scan, **SBOM**

  - **k6 SSE** results, dashboard screenshots (Executive, **SSE Health**)

  - docs-md/\*\* snapshot and TREE.md at commit

**Step 8 — Promote**

- Repeat Steps 3–7 for **Beta**, then **RTM**

**Step 9 — RTM Parity Gate (before Prod)**

- Generate **Config Parity Report** (RTM effective vs intended Prod): **0 critical diffs required**

- Run **SP Signature Snapshot** and attach to release

- Confirm alerts quiet (no p95/5xx/heartbeat issues)

**Step 10 — Prod Deploy**

- Repeat Steps 3–7

- After web/API live:

  - Re-run **SSE Smoke**

  - Confirm parity widget green (N/A in Prod), dashboards stable

**5) Rollback (summary; see runbooks/rollback.docx)**

Trigger if any **P1** breach occurs (availability, readiness flapping, SSE failure, parity regression in RTM):

- Re-deploy prior green release (API & Web)

- Restore prior **expected config** if changed

- Post-incident evidence and RCA required

**6) Evidence Pack (what to attach per environment)**

- Build/test reports; **OpenAPI diff**; **CodeQL/Dependency/Secrets** summaries

- **SBOM** (+ attestation if used)

- **k6 SSE** smoke results; parity report (RTM)

- **SP signature snapshot** (RTM/Prod)

- Dashboard screenshots; alert policy export

- Approvals log (protected environments)

Retention: **≥ 1 year** per release tag.

**7) Operational Checks After Go-Live**

- Dashboards: request rate, p95, error %, **SSE first-event** trend, heartbeat gaps

- Logs: error envelope codes (spikes), auth failures

- Alerts: ensure no flapping; tune thresholds if noisy

**8) Communication Templates**

**Start notice (Slack):**

Deploying **{env}** for MCPX-KendoBridge. SHA {abcd123}. Window {HH:MM–HH:MM}. Expect minor restarts. Ping @RM for status.

**Success:**

**{env}** deploy complete. Health/Ready ✅. SSE smoke ✅ (TTFB {ms}, heartbeat {s}). Evidence attached to release {tag}.

**Rollback:**

**{env}** rollback executed to release {tag_prev} due to {reason}. Incident opened. Updates to follow.

**9) Acceptance Criteria (Deploy Runbook)**

- All **Pre-Deploy** checks pass; CI green

- Migrations applied with **no** destructive DDL; app principal restricted to **EXECUTE**

- API/Web healthy; synthetics pass; **SSE TTFB ≤ 200 ms**, heartbeat ≤ 10 s

- **RTM parity = 0 critical** before Prod

- Evidence Pack complete and attached; alerts quiet post-deploy

**10) Appendix — Quick Commands (reference)**

**k6 SSE Smoke (example):**

k6 run tests/perf/k6_sse_ttfb.js -e BASE_URL=https://{env-host}/api -e TOKEN={bearer}

**Parity (concept):**

\# Compare intended Prod vs RTM effective (non-secrets)

\# Attach JSON diff to release

**Signature Snapshot (SQL):**

EXEC dbo.sp_Signature_Collect;

-- export latest snapshot and attach to release

**End of Runbook — TJ-MCPX-RB-01 v1.1.0**
