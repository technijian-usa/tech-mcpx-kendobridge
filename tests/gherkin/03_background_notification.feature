# MCPX-KendoBridge — Background notifications via GET /mcp
# FR mapping: FR-001 Transport, FR-006 Session-scoped notifications
# Note: In CI, use the "fake child" process to deterministically emit notifications.
# Guardrails: No-Hard-Coding; DB-driven keepalive/config; secrets are never logged or asserted.

Feature: Receive background notifications on an open SSE subscription
  As an MCP client with a session, I want to subscribe to server-initiated notifications over SSE

  Background:
    Given the base API url for environment "<env>" is configured
    And a valid bearer token is available for environment "<env>"
    And the test environment uses a fake child that can emit "notification" events on command
    And I ensure "/ready" returns healthy within 30 seconds
    And I have a fresh session id

  @e2e @sse @notifications @ci-fake-child @alpha @beta @rtm @prod
  Scenario Outline: One subscriber receives a background notification
    Given I open an SSE subscription on GET "/mcp" with "Mcp-Session-Id" "<sessionId>"
    When I trigger the child to emit a "notification" event for session "<sessionId>"
    Then within 10 seconds the SSE stream receives an event:
      | event | message |
      | json  | contains "notification" |

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @sse @notifications @fanout @ci-fake-child @alpha @beta @rtm @prod
  Scenario Outline: Multiple subscribers in the same session receive the notification (fan-out)
    Given I open two SSE subscriptions on GET "/mcp" with "Mcp-Session-Id" "<sessionId>"
    When I trigger the child to emit a "notification" event for session "<sessionId>"
    Then both subscribers receive at least one "event: message" frame within 10 seconds

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |
