# MCPX-KendoBridge — Origin allow-list enforcement
# FR mapping: FR-007 Security:AllowedOrigins, FR-011 Error Envelope
# Security rule: Origin header must match the allow-list values stored in DB AppConfig (queried via SPs).

Feature: Deny requests from disallowed Origin with a stable error envelope
  To protect the service from unauthorized web contexts, requests with non-allowed Origin are rejected

  Background:
    Given the base API url for environment "<env>" is configured
    And a valid bearer token is available for environment "<env>"
    And I ensure "/ready" returns healthy within 30 seconds

  @e2e @security @alpha @beta @rtm @prod
  Scenario Outline: Disallowed Origin is rejected with 403 and canonical error envelope
    When I POST "/mcp" with headers:
      | Origin | https://evil.example |
    And body:
      """
      { "jsonrpc":"2.0", "id":"41", "method":"ping", "params":{} }
      """
    Then the response status is 403
    And the error envelope has code "origin_forbidden"
    And the error envelope contains a non-empty "message" and optional "requestId"

    Examples:
      | env  |
      | alpha|
      | beta |
      | rtm  |
      | prod |

  @e2e @security @alpha @beta @rtm @prod
  Scenario Outline: Allowed Origin succeeds
    When I POST "/mcp" with headers:
      | Origin | https://chat.openai.com |
    And body:
      """
      { "jsonrpc":"2.0", "id":"42", "method":"ping", "params":{} }
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
