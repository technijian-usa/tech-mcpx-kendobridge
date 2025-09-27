> _Source: docs/adr/ADR_Index.docx_

**Title:** MCPX‑KendoBridge — ADR Index  
**Version:** 1.0.0 (Draft) • **Last Updated:** 2025‑09‑26

| **ADR \#** | **Title**                                                | **Status**   | **Date**   | **Summary**                                                                 |
|------------|----------------------------------------------------------|--------------|------------|-----------------------------------------------------------------------------|
| ADR‑001    | Transport: **Streamable‑HTTP + SSE** (vs WS/gRPC)        | **Accepted** | 2025‑09‑26 | SSE supports incremental outputs, cache‑friendly infra, minimal client deps |
| ADR‑002    | **Legacy HTTP+SSE** endpoints behind flag                | **Accepted** | 2025‑09‑26 | /messages + /sse gated by EnableLegacyHttpSse, default **off**              |
| ADR‑003    | Session: **one child per Mcp‑Session‑Id**                | **Accepted** | 2025‑09‑26 | Requires sticky routing; isolates state; enables streaming fan‑out          |
| ADR‑004    | DB Policy: **SP‑only**, **add‑only**, **No‑Hard‑Coding** | **Accepted** | 2025‑09‑26 | All dynamic values via AppConfig/FeatureFlag SPs; secrets in envs only      |
