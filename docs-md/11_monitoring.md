> _Source: 

**MCPX‑KendoBridge — Monitoring, SLOs & Post‑Release Verification**

**Document:** docs/11_monitoring.docx  
**Project Code:** MCPX‑KendoBridge  
**Version:** 2.0.0 (Kendo Migration)  
**Last Updated:** 2025‑09‑27  
**Owner:** SRE Lead (Responsible) — DoSE (Accountable) — DocFactory
(Author) — Dev/QA/SecLead (Consulted)

**Purpose.** Define **service‑level indicators (SLIs)**, **service‑level
objectives (SLOs)**, alerting, dashboards, **24‑hour post‑release
checks**, and **evidence capture** for MCPX‑KendoBridge across **Alpha →
Beta → RTM → Prod**. This plan aligns with the Technijian GitHub‑first
SDLC, required CI/CD gates, and the project’s FR/NFR budgets (JSON
p50≤300 ms / p95≤800 ms; **SSE TTFB≤200 ms**; restart‑to‑ready≤30 s;
availability≥99.9%).

**DB & Secrets Compliance (applies to all instrumentation and logs):**

- **Add‑only** schema; **Stored‑procedure‑only** access;
  **No‑Hard‑Coding** of dynamic values
  (timeouts/keep‑alive/origins/child args)—all come from
  **AppConfig/FeatureFlag** via **sp_Config\_\***,
  **sp_Feature_IsEnabled**, **sp_Lookup_Get**.

- **No secrets** in logs, metrics, dashboards, or evidence. Secrets live
  only in **GitHub Environments**.

**1) Scope & Environments**

- **Service under monitor:** MCPX‑KendoBridge API (Streamable‑HTTP +
  SSE) and the read‑only **Admin Portal** (KendoReact Fluent v12).

- **Environments:** **Alpha → Beta → RTM → Prod** with **RTM validating
  on the Prod DB (read‑only)** for parity and drift detection prior to
  Prod promotion.

**2) SLOs (targets) & SLIs (how we measure)**

**2.1 SLO summary (per environment; Prod enforces error budgets)**

| **Domain**                  | **SLO Target**                        | **Notes**                                               |
|-----------------------------|---------------------------------------|---------------------------------------------------------|
| **Availability**            | **≥ 99.9% monthly**                   | Any 5xx for /mcp, /healthz, /ready counts against       |
| **Latency (non‑streaming)** | **p50 ≤ 300 ms; p95 ≤ 800 ms**        | Measured on /mcp JSON responses                         |
| **Streaming TTFB**          | **p95 ≤ 200 ms**                      | First byte for POST /mcp with Accept: text/event-stream |
| **Readiness**               | **restart‑to‑ready ≤ 30 s**           | From container start to /ready=ok                       |
| **Concurrency**             | **≥ 200 concurrent sessions/replica** | CPU‑bound before memory (watch saturation)              |

Error budget for 99.9% avail ≈ **43.2 min/month**. Burn alerts trigger
when consumption slope indicates breach risk.

**2.2 SLIs & instrumentation (vendor‑neutral naming; example Prometheus
metrics)**

| **SLI**               | **Source & Metric(s)**                                         | **Calculation / Notes**                              |
|-----------------------|----------------------------------------------------------------|------------------------------------------------------|
| **Availability**      | \`http_requests_total{path=~"/mcp                              | /ready                                               |
| **Latency (JSON)**    | http_server_duration_ms_bucket{path="/mcp",mode="json"}        | p50/p95 from histogram                               |
| **Streaming TTFB**    | sse_ttfb_ms_bucket{path="/mcp",mode="sse"}                     | Histogram across streamed calls                      |
| **Heartbeat Cadence** | sse_heartbeat_gap_ms_bucket{session_id!=""}                    | Expect modal near Network:SseKeepAliveSeconds × 1000 |
| **Readiness**         | \`ready_status{value=0                                         | 1}; restart_to_ready_seconds\`                       |
| **Sessions/Children** | session_count, child_up{session_id}, child_restart_count       | Per‑pod gauges/counters                              |
| **Config Fetch**      | config_fetch_duration_ms_bucket                                | From SP call to cache update; p95 ≤200 ms target     |
| **Security**          | Counters by error code: \`errors_total{code="origin_forbidden" | "feature_disabled"                                   |

**Structured logs (JSON)** must include: timestamp, level, requestId,
sessionId, childPid, path, status, latency_ms, mode=json\|sse, and
**never** include payload bodies or secrets.

**3) Alerting Policy (P1/P2/P3)**

Page on **P1**, notify on **P2**, ticket on **P3**. All alerts include
runbook links and recent requestIds/sessionIds.

| **Sev** | **Condition (sustained)**                                                                                | **Action & Runbook**                                                                                       |
|---------|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| **P1**  | **Availability \< 99% (rolling 10 min)** OR /ready failing \> 2 min OR **TTFB p95 \> 200 ms for 15 min** | Page on‑call; evaluate rollback vs forward‑fix; follow **Incident** runbook; consider **rollback** runbook |
| **P2**  | Error rate ≥ 1% (5 min); surge in origin_forbidden unrelated to abuse; child_restart_count rising        | Notify SRE & Dev; investigate ingress buffering, config drift; open issue                                  |
| **P2**  | Heartbeat gap p95 \> 2× configured interval (15 min)                                                     | Check ingress text/event-stream buffering and timeouts; verify DB Network:SseKeepAliveSeconds              |
| **P3**  | config_fetch_duration_ms p95 \> 200 ms (30 min)                                                          | Observe DB contention; plan tuning; verify SP grants                                                       |
| **P3**  | Front‑end synthetic failing (3/5 checks)                                                                 | Investigate Admin Portal routing/build; not user‑facing outage unless API down                             |

**Runbooks referenced:** runbooks/incident.docx, runbooks/rollback.docx,
runbooks/scale_out.docx, runbooks/deploy.docx.

**4) Dashboards (curated panels)**

Maintain one per environment; panels marked **(Key SLI)** feed SLO
summaries.

**4.1 Backend Overview (Key)**

- **Availability (Key SLI)** by endpoint (/mcp, /ready, /healthz)

- **Latency (Key SLI):** /mcp JSON p50/p95

- **Errors by code:** origin_forbidden, feature_disabled, timeout,
  internal_error

- **Readiness timeline:** status and **restart‑to‑ready** durations

- **Resource:** CPU/Mem/Network per pod; **session_count** per pod

**4.2 Streaming Quality**

- **TTFB p50/p95 (Key SLI)** for streamed calls

- **Heartbeat gap histogram** and time‑series (expected ≈
  Network:SseKeepAliveSeconds)

- **Active streams** & **disconnects** per minute

- **Child restarts** vs streams

**4.3 Sessions & Child Processes**

- **session_count** per replica (expect steady under HPA)

- **child_up/child_restart_count** progression

- **Sticky routing hit ratio** (requests with same Mcp-Session-Id
  reaching same pod)

**4.4 Config Parity (RTM)**

- Snapshot diff of /config/effective (non‑secret) against expected
  **Prod** values; any drift blocks promotion.

**4.5 Admin Portal (Front‑end Synthetic)**

- Availability of UI shell

- Browser‑measured **SSE TTFB** probe (optional)

- JS error rate (scrubbed; no secrets)

- Axe a11y smoke summary (if exported)

**5) 24‑Hour Post‑Release Checks (Prod)**

Within **24 hours** after Prod rollout:

1.  **Availability** ≥ 99.9%; **error rate** \< 1%.

2.  **Latency (JSON)** p50/p95 within budget.

3.  **Streaming TTFB** p95 ≤ 200 ms; **heartbeat gap** nominal.

4.  **Readiness** steady; no flapping.

5.  **Sessions/Children** stable; **child_restart_count** flat.

6.  **Security**: No unexpected spikes in
    origin_forbidden/feature_disabled.

7.  **Config**: /config/effective matches expected (non‑secret) values.

8.  **Evidence**: Export dashboard snapshots (images/PNGs or PDFs) and
    attach to the Release. **Retention ≥ 1 year**.

**6) Synthetic Monitoring & Probes**

- **API**:

  - GET /ready (every 30s) → expect 200 with {status, uptimeSeconds,
    sessionCount, childProcesses}.

  - POST /mcp JSON ping (every 60s) → latency check.

  - POST /mcp **SSE** ping (every 60–120s) → compute **TTFB** and
    heartbeat cadence.

- **Front‑end** (optional):

  - Load / and /sessions; assert no console errors; optional browser
    probe for SSE TTFB.

Synthetic jobs **must not** include secrets or dump payloads; capture
only envelope fields and timings.

**7) Observability: Logging, Metrics, Tracing**

**Logging (JSON):**

- Required fields: timestamp, level, requestId, sessionId, childPid,
  path, method, status, latency_ms, mode=json\|sse, origin_allowed:
  true\|false.

- **No payload bodies**, no secrets, no license content.

**Metrics:** Implement via OpenTelemetry Metrics or Prometheus client as
indicated in §2.2.

**Tracing (optional):**

- Propagate traceparent if present; correlate to requestId. Do not
  include payload bodies in spans.

**8) Alert Definitions (example PromQL / pseudo)**

Replace {job="mcp-proxy"} etc. with your labels.

- **P1 Availability:**

- (sum(rate(http_requests_errors_total{job="mcp-proxy",status=~"5.."}\[10m\]))

- / sum(rate(http_requests_total{job="mcp-proxy"}\[10m\]))) \> 0.01

- **P1 Readiness down:**

- avg_over_time(ready_status{job="mcp-proxy"}\[2m\]) \< 0.5

- **P1 Streaming TTFB p95 \> 200ms:**

- histogram_quantile(0.95,
  sum(rate(sse_ttfb_ms_bucket{job="mcp-proxy"}\[15m\])) by (le)) \> 200

- **P2 Heartbeat gap drift:**

- histogram_quantile(0.95,
  sum(rate(sse_heartbeat_gap_ms_bucket{job="mcp-proxy"}\[15m\])) by
  (le))

- \> (Network_SseKeepAliveSeconds\*2000)

**9) Evidence Pack (Monitoring Artifacts)**

Attach to the **Release** (Prod) and retain **≥ 1 year**:

- SLO dashboard screenshots (Availability, Latency, **TTFB**,
  Readiness).

- Alert timeline with links (if applicable).

- /ready and /config/effective outputs (non‑secret).

- Post‑release (24 h) checklist results.

- Version metadata: image digest, OpenAPI lint/diff,
  CodeQL/DepReview/SBOM references.

**10) Roles & RACI (Monitoring)**

| **Activity**              | **A** | **R**      | **C**                      | **I** |
|---------------------------|-------|------------|----------------------------|-------|
| SLO definition & review   | DoSE  | SRE Lead   | Dev Lead, QA Lead, SecLead | All   |
| Dashboard ownership       | DoSE  | SRE Lead   | Dev Lead                   | QA    |
| Alert tuning              | DoSE  | SRE Lead   | Dev Lead                   | QA    |
| Post‑release verification | DoSE  | SRE + QA   | Dev Lead                   | All   |
| Evidence export           | DoSE  | DocFactory | QA Lead                    | All   |

**11) Cross‑References**

- **FR/NFR:** docs/05_fr.docx, docs/06_nfr.docx (budgets, streaming,
  readiness).

- **Test Strategy:** docs/09_test_strategy.docx (SSE TTFB harness, axe
  smoke).

- **CI/CD:** docs/10_ci_cd.docx (gates and promotion; RTM parity on
  **Prod DB (read‑only)**).

- **Error Catalog:** docs/error_catalog.docx (code taxonomy for panels).

- **Runbooks:** deploy/rollback/incident/scale_out (alert response and
  drain behavior).

**12) Assumptions**

1.  Ingress passes **text/event-stream** without buffering, and
    idle/read timeouts accommodate heartbeats.

2.  RTM environment uses **Prod DB (read‑only)**; config parity diffs
    block promotion.

3.  App exposes metrics and logs per this spec and **never** logs
    secrets.

**13) Next Steps**

- Implement sse_ttfb_ms and sse_heartbeat_gap_ms histograms; wire
  dashboards/alerts per §4–§8.

- Add synthetic probes for streamed and non‑streamed calls in Beta/Prod.

- Automate the **24‑hour post‑release** evidence export in the deploy
  workflow.

**Footer (optional for Word header/footer):**  
*MCPX‑KendoBridge • Monitoring & SLOs • v2.0.0 • 2025‑09‑27 •
Confidential — Technijian Internal*
