> _Source: docs/14_raci.docx_

**Document: 14 – RACI (Roles & Responsibilities)**

**Project:** MCPX-KendoBridge Admin Portal  
**Document ID:** TJ-MCPX-DOC-14  
**Version:** 1.1.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** Program Management (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author**         | **Change Summary**                                          | **Status** |
|-------------|------------|--------------------|-------------------------------------------------------------|------------|
| 1.0.0       | 2025-09-26 | Doc-Factory        | Initial RACI across SDLC                                    | Draft      |
| 1.1.0       | 2025-09-27 | Program Management | Align to MSAL PKCE, Kendo Fluent 2, SSE, SP-only DAL, gates | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| DevSecOps / SRE           |          |                    |             |
| Security / Compliance     |          |                    |             |
| Product Manager           |          |                    |             |

**Legend:** **R** = Responsible (does the work) · **A** = Accountable (final decision/owns outcome) · **C** = Consulted (two-way) · **I** = Informed (one-way)

**1. Core Roles**

- **Director of Software Engineering (DoSE)**

- **Product Manager (PM)**

- **Systems Architect (SA)**

- **Dev Lead (DL)**

- **UX Lead / Frontend Lead (UX/FE)**

- **QA Lead (QA)**

- **DevSecOps / SRE (SRE)**

- **DBA**

- **Security & Compliance (SEC)**

- **Release Manager (RM)**

- **Support / MSP Ops (OPS)**

- **Stakeholders / Client (STKH)**

**2. SDLC Phase RACI**

| **Activity / Deliverable**                               | **PM** | **DoSE** | **SA** | **DL**  | **UX/FE** | **QA**  | **DBA** | **SEC** | **SRE** | **RM** | **OPS** | **STKH** |
|----------------------------------------------------------|--------|----------|--------|---------|-----------|---------|---------|---------|---------|--------|---------|----------|
| **Sprint 0** scope, Vision, FR/NFR, roadmap              | **R**  | A        | C      | C       | C         | C       | C       | C       | C       | I      | I       | **I**    |
| System Context & Architecture, ADRs                      | I      | A        | **R**  | C       | C         | I       | C       | C       | C       | I      | I       | I        |
| UI/UX spec (Kendo Fluent 2 + ThemeBuilder)               | C      | I        | C      | C       | **R**     | C       | I       | I       | I       | I      | I       | I        |
| OpenAPI 3.1 contract                                     | I      | A        | **R**  | C       | C         | C       | C       | C       | C       | I      | I       | I        |
| DB schema + SP contracts (SP-only, add-only)             | I      | I        | C      | C       | I         | I       | **R**   | C       | I       | I      | I       | I        |
| Implementation (API, Web)                                | I      | I        | C      | **A/R** | **R**     | C       | C       | C       | C       | I      | I       | I        |
| Test Strategy (E2E, SSE, a11y, perf)                     | I      | I        | C      | C       | C         | **A/R** | C       | C       | C       | I      | I       | I        |
| Security review (RBAC, CORS, rate-limit, error envelope) | I      | I        | C      | C       | C         | C       | C       | **A/R** | C       | I      | I       | I        |
| CI/CD (lint/diff, CodeQL, SBOM, DocX→MD, TREE)           | I      | I        | C      | C       | I         | C       | I       | C       | **A/R** | C      | I       | I        |
| Monitoring & alerts (SSE TTFB/heartbeat, parity)         | I      | I        | C      | C       | I         | C       | I       | C       | **A/R** | I      | C       | I        |
| Evidence Pack (compile, attach, retention)               | I      | I        | C      | C       | I         | C       | C       | C       | **R**   | **A**  | I       | I        |
| Release approvals & gates (Alpha→Beta→RTM→Prod)          | I      | **A**    | C      | C       | I         | C       | C       | C       | C       | **R**  | I       | I        |
| Runbooks (deploy, rollback, incident, scale-out)         | I      | I        | C      | C       | I         | C       | C       | C       | **A/R** | C      | **R**   | I        |

**3. Epic-Level Ownership**

| **Epic (see Backlog)**          | **A** | **R** | **C**              | **I**    |
|---------------------------------|-------|-------|--------------------|----------|
| EP-01 Auth & RBAC (MSAL PKCE)   | DoSE  | DL    | SA, SEC, UX/FE, QA | SRE, OPS |
| EP-02 Admin Shell & Theming     | DoSE  | UX/FE | SA, DL, QA         | SRE      |
| EP-03 Health & Dashboard        | SA    | DL    | UX/FE, QA, SRE     | PM       |
| EP-04 Effective Config          | SA    | DL    | DBA, QA            | SEC      |
| EP-05 Config Mutations (+Audit) | SA    | DL    | DBA, SEC, QA       | SRE      |
| EP-06 Feature Flags             | SA    | DL    | DBA, SEC, QA       | SRE      |
| EP-07 Lookups                   | SA    | DL    | DBA, QA            | PM       |
| EP-08 Jobs & SSE                | SA    | DL    | UX/FE, QA, SRE     | SEC      |
| EP-09 Audit & Evidence          | DoSE  | SRE   | DL, QA, SEC, DBA   | PM, RM   |
| EP-10 Access (Graph or CR flow) | DoSE  | DL    | SEC, SA, QA        | OPS      |
| EP-11 CORS & Rate-Limit         | SEC   | DL    | SA, SRE, QA        | PM       |
| EP-12 Readiness & Parity Gate   | DoSE  | SA    | SRE, DL, DBA, QA   | RM       |
| EP-13 Observability             | DoSE  | SRE   | SA, DL, QA         | PM       |
| EP-14 DB Layer & Grants         | DoSE  | DBA   | SA, DL, SEC, QA    | SRE      |
| EP-15 CI/CD & Docs Visibility   | DoSE  | SRE   | DL, QA, SEC        | PM, RM   |

**4. Promotion Gate RACI**

| **Gate / Decision**                               | **A** | **R** | **C**                 | **I**   |
|---------------------------------------------------|-------|-------|-----------------------|---------|
| **Alpha → Beta** (CI green, evidence attached)    | DoSE  | RM    | SA, SRE, QA, SEC      | PM, OPS |
| **Beta → RTM** (OpenAPI diff/waivers, SBOM)       | DoSE  | RM    | SA, SRE, QA, SEC      | PM      |
| **RTM → Prod** (**Parity = 0 critical**, perf OK) | DoSE  | RM    | SA, SRE, QA, SEC, DBA | PM, OPS |

**Blocking conditions:** parity \> 0 critical, SSE TTFB/heartbeat SLO breach, CodeQL high/critical, secret-scan confirmed leak.

**5. Change Procedures (selected)**

**5.1 CORS Allow-List Edit**

- **R:** DL

- **A:** SEC

- **C:** SA, SRE

- **I:** PM, OPS  
  **Steps:** PR → approval (SEC) → deploy → audit entry verified → smoke from intended Origins.

**5.2 Access Assignment (Graph Write Enabled)**

- **R:** DL

- **A:** SEC

- **C:** SA, PM

- **I:** OPS  
  **Steps:** Admin consent → role/group update → audit entry → propagation notice.

**5.3 DB SP Contract Change (Breaking)**

- **R:** DBA

- **A:** SA

- **C:** DL, SEC, QA

- **I:** SRE, RM  
  **Steps:** New \_v2 SP + ADR → grants PR → signature snapshot diff approved → contract tests updated.

**5.4 Emergency Change / Rollback**

- **R:** RM

- **A:** DoSE

- **C:** SA, SRE, DL, SEC

- **I:** PM, OPS  
  **Trigger:** P1 incident. Revert to last green release + expected config; capture incident report in Evidence Pack.

**6. Document Ownership (by ID)**

| **Doc ID** | **Title**                     | **A** | **R** | **C**            | **I** |
|------------|-------------------------------|-------|-------|------------------|-------|
| 01         | Vision Brief                  | DoSE  | PM    | SA, DL, SEC      | STKH  |
| 02         | Glossary                      | PM    | PM    | SA               | All   |
| 03         | Actors & Use Cases            | SA    | SA    | PM, QA, SEC      | DL    |
| 04         | System Context & Architecture | SA    | SA    | DL, SRE, DBA     | PM    |
| 05         | NFRs                          | DoSE  | SA    | QA, SRE, SEC     | DL    |
| 07         | Data Contracts                | SA    | DBA   | DL, QA           | SEC   |
| 07a        | DB Grants & SP Signature      | SA    | DBA   | SEC, DL          | SRE   |
| 08         | UI/UX Spec                    | DoSE  | UX/FE | SA, QA           | DL    |
| 09         | Test Strategy                 | DoSE  | QA    | SA, DL, SRE      | SEC   |
| 10         | CI/CD                         | DoSE  | SRE   | SA, QA, SEC      | RM    |
| 11         | Monitoring & Observability    | DoSE  | SRE   | SA, QA           | RM    |
| 12         | Evidence Pack                 | DoSE  | SRE   | QA, SEC, DL, DBA | PM    |
| 15         | Backlog                       | PM    | PM    | DoSE, SA, DL     | All   |
| 16         | DoR / DoD                     | DoSE  | PM    | SA, QA, SEC      | DL    |

**7. Decision Rights & Escalation**

- **Technical Architecture:** SA (A), DoSE (tiebreaker)

- **Security Policy / Exceptions:** SEC (A), DoSE (tiebreaker)

- **Release / Rollback:** DoSE (A), RM (executes)

- **Scope / Priority:** PM (A), DoSE (tiebreaker)

- **Production Incident (P1):** DoSE declares; RM leads; SRE/DL execute; SEC reviews

**Escalation clock:** P1 engage within **15 min**, MTTR target **≤ 60 min** (see runbooks).

**8. Meeting & Artifact Cadence**

| **Cadence**     | **Owner** | **Participants**       | **Outputs**                                   |
|-----------------|-----------|------------------------|-----------------------------------------------|
| Sprint Planning | PM        | SA, DL, UX/FE, QA, SRE | Updated backlog; sprint goals; capacity       |
| Arch Review     | SA        | DL, DBA, SEC, SRE      | ADRs; design approvals                        |
| Release Review  | RM        | DoSE, SA, SRE, QA, SEC | Go/No-Go; Evidence Pack receipt               |
| Postmortem (P1) | SRE       | DL, SA, SEC, RM, PM    | RCA; corrective actions; ADRs/runbook updates |

**9. Compliance & Evidence Responsibilities**

- **Evidence Pack completeness:** **A:** DoSE · **R:** SRE

- **SBOM / CodeQL / Secrets scanning:** **A:** SRE · **R:** SRE

- **OpenAPI diff & waivers:** **A:** SA · **R:** DL

- **Parity report (RTM↔Prod):** **A:** SA · **R:** DL/DBA · **C:** SRE

- **A11y report (axe):** **A:** QA · **R:** QA/UX

**10. Acceptance Criteria (RACI)**

1.  All activities mapped with clear **A** and **R**; no activity has multiple **A**’s.

2.  Promotion gates list accountable approvers and blocking conditions.

3.  Change procedures (CORS, Access, DB contract, Emergency) specify **A/R/C/I** and are linked from runbooks.

4.  Evidence responsibilities assigned and reflected in CI/CD.

5.  RACI kept in sync with **Backlog** epics and **DoR/DoD**.

**End of Document — TJ-MCPX-DOC-14 v1.1.0**
