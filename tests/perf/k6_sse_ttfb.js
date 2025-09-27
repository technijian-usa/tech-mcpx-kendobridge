import http from 'k6/http';
import { check, sleep } from 'k6';

// NFR budgets: SSE TTFB p95 ≤ 200 ms (intra-VPC). JSON p50≤300 ms / p95≤800 ms (documented elsewhere).
// Policies: No-Hard-Coding of secrets; all dynamic values come from DB via SPs. (Compliance banner)

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    'http_req_waiting{endpoint:/mcp}': ['p(95)<200'], // waiting == time to first byte (TTFB)
    'checks': ['rate>0.99'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://beta.example.com/api';

export default function () {
  const url = `${BASE_URL}/mcp`;
  const headers = {
    'Accept': 'text/event-stream',
    'Content-Type': 'application/json',
    'Mcp-Session-Id': 'k6-' + __ITER, // routing only; not an auth secret
  };
  const body = JSON.stringify({ jsonrpc: '2.0', id: String(__ITER), method: 'ping', params: { stream: true } });

  const res = http.post(url, body, { headers, timeout: '120s', tags: { endpoint: '/mcp' } });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'TTFB <= 200ms (p95 target)': (r) => r.timings.waiting <= 200,
  });

  sleep(1);
}
