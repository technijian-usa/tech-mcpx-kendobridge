# MCPX-KendoBridge — Session Establishment & Header Echo
# FR mapping: FR-001 Transport, FR-002 Sessioning, FR-011 Error Envelope
# NFR references: Availability, Restart-to-Ready
# Guardrails: No-Hard-Coding; all dynamic values (timeouts/keepalive/origins/child args) come from DB via SPs.

Feature: Establish MCP session and receive Mcp-Session-Id
  In order to isolate traffic to a dedicated child process per session
  As an MCP client
  I want the server to issue and echo an Mcp-Session-Id and require it for SSE subscriptions

  Background:
    Given the base API url for environment "<env>" is configured
    And a valid bearer token is available for environment "<env>"
    And I capture "Network:SseKeepAliveSeconds" from GET "/config/effective"
    And I ensure "/ready" returns healthy within 30 seconds

  @e2e @session @alpha @beta @rtm @prod
  Scenario Outline: New session id is issued on first JSON call
    When I POST "/mcp" with body:
      """
      { "jsonrpc":"2.0", "id":"1", "method":"ping", "params":{} }
      """
    Then the response status is 200
    And the response header "Mcp-Session-Id" exists and is not empty
    And the "Content-Type" is "application/json"
    And the response body is a valid JSON-RPC envelope

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @session @alpha @beta @rtm @prod
  Scenario Outline: Session id is echoed on subsequent calls
    Given I have a previously issued "Mcp-Session-Id" value
    When I POST "/mcp" with headers:
      | Mcp-Session-Id | <sessionId> |
    And body:
      """
      { "jsonrpc":"2.0", "id":"2", "method":"ping", "params":{} }
      """
    Then the response status is 200
    And the response header "Mcp-Session-Id" equals "<sessionId>"

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @session @sse @alpha @beta @rtm @prod
  Scenario Outline: GET /mcp requires Mcp-Session-Id header for SSE
    When I GET "/mcp" without "Mcp-Session-Id" header
    Then the response status is 400
    And the error envelope has code "missing_session_id"

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @session @sse @alpha @beta @rtm @prod
  Scenario Outline: GET /mcp opens an SSE channel for the provided session
    Given I have a previously issued "Mcp-Session-Id" value
    When I GET "/mcp" with headers:
      | Mcp-Session-Id | <sessionId> |
    Then the response "Content-Type" is "text/event-stream"
    And I observe at least 1 heartbeat comment within "<keepAliveSeconds>*2" seconds

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |
