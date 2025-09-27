# MCPX-KendoBridge — Streamed tool call over SSE
# FR mapping: FR-001 Transport, FR-005 STDIO routing, FR-012 Graceful shutdown
# NFR references: Streaming TTFB ≤ 200ms, JSON p50/p95 latency

Feature: Stream a tool call over Server-Sent Events (SSE)
  To receive incremental outputs, an MCP client requests SSE and expects timely first byte and heartbeats

  Background:
    Given the base API url for environment "<env>" is configured
    And a valid bearer token is available for environment "<env>"
    And I capture "Network:SseKeepAliveSeconds" from GET "/config/effective"
    And I ensure "/ready" returns healthy within 30 seconds
    And I have a fresh session id

  @e2e @sse @perf @alpha @beta @rtm @prod
  Scenario Outline: POST /mcp streams when Accept is text/event-stream
    When I POST "/mcp" with headers:
      | Accept          | text/event-stream |
      | Mcp-Session-Id  | <sessionId>       |
    And body:
      """
      { "jsonrpc":"2.0", "id":"9", "method":"ping", "params":{"stream":true} }
      """
    Then the response "Content-Type" is "text/event-stream"
    And time to first byte is ≤ 200 ms
    And I receive SSE events named "message" with monotonically increasing "id" values
    And I observe heartbeat comments every ~ "<keepAliveSeconds>" seconds (± 1 second)

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @json @alpha @beta @rtm @prod
  Scenario Outline: POST /mcp returns JSON when Accept is not set
    When I POST "/mcp" without an "Accept" header and with body:
      """
      { "jsonrpc":"2.0", "id":"10", "method":"ping", "params":{} }
      """
    Then the response status is 200
    And the "Content-Type" is "application/json"
    And the response body is a valid JSON-RPC envelope

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |
