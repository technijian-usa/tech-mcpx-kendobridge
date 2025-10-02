<!--

&nbsp; Technijian – MCPX Admin: Pull Request Template

&nbsp; Purpose:

&nbsp;   Enforce SDLC guardrails: no hard-coded secrets, SP-only DB access, add-only

&nbsp;   migrations, ThemeBuilder is the single source of theming, and CI gates pass.

&nbsp; Instructions:

&nbsp;   1) Complete the checklist (all items must be ✅ or N/A with explanation).

&nbsp;   2) Fill out the change summary and testing notes.

&nbsp;   3) Attach screenshots for UI changes, and paste relevant logs for API.

-->



\## Summary of Changes

<!-- What does this PR do? Keep it crisp. -->

\- 



\### Type of Change

\- \[ ] Feature

\- \[ ] Bug fix

\- \[ ] Refactor / Cleanup

\- \[ ] Docs / Config / CI

\- \[ ] Database (migration / seed)

\- \[ ] Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



---



\## SDLC Guardrails (Required)



\### 🔒 Secrets \& Config

\- \[ ] No secrets committed (tokens, passwords, conn strings, license files).

\- \[ ] All dynamic values read from DB or env (no hard-coded env-specific literals).

\- \[ ] If added: new \*\*NON-SECRET\*\* keys live in `dbo.AppConfig` (+ seeds per env).



\### 🗄️ Database Rules

\- \[ ] Only \*\*add-only\*\* migrations (no destructive alters/drops).

\- \[ ] All data access is \*\*SP-only\*\* (no ad-hoc SQL in code).

\- \[ ] New/updated SPs are idempotent (`CREATE OR ALTER`) and documented.

\- \[ ] `sp\_Lookup\_Get`, `sp\_Config\_\*`, `sp\_Security\_GetAllowedOrigins` contracts preserved.



\### 🧩 API Rules

\- \[ ] No hard-coded origins/IDs; authority/audience/scope come from DB.

\- \[ ] JWT enforced where required (scope policy), SSE auth toggle respected.

\- \[ ] CORS allow-list is DB-driven; \*\*no\*\* static CORS lists in code.



\### 🎨 UI/Theming Rules

\- \[ ] \*\*ThemeBuilder\*\* package is the single theming source (`mcpx-kendobridge`).

\- \[ ] No direct `@progress/kendo-theme-\*/dist/\*` imports under `web/src`.

\- \[ ] Import exists: `mcpx-kendobridge/dist/scss/index.scss`.



\### 🧪 Tests \& Evidence

\- \[ ] Unit tests updated/added where meaningful (API providers, helpers).

\- \[ ] All CI jobs pass locally (or in Actions) including theme-guard.



---



\## Risk \& Rollout

\*\*Risk level:\*\* Low / Medium / High  

\*\*Rollback plan:\*\* Revert PR and redeploy previous image tag.  

\*\*Dependencies:\*\* (list services/keys/migrations that must exist)



---



\## Screenshots / Logs (as applicable)

<!-- UI: before/after screenshots. API: sample logs or responses. -->

\- 



---



\## Checklist

\- \[ ] CI green (build, tests, theme-guard).

\- \[ ] No new warnings introduced (TypeScript, .NET build).

\- \[ ] Dockerfiles build locally (if applicable).

\- \[ ] OpenAPI specs updated if endpoints changed.



---



\## Reviewer Notes

<!-- Anything you want reviewers to focus on -->

\- 



