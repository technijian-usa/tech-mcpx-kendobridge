\# MCPX Admin (Technijian)



Read-only admin portal for MCPX with a \*\*.NET 8 API\*\*, \*\*React 18 + KendoReact (Fluent 2)\*\* UI, \*\*DB-driven config/CORS\*\*, \*\*Azure AD (MSAL)\*\* auth, and \*\*SSE\*\* keepalives.  

No secrets in code. All DB access is \*\*stored-procedure only\*\*. Theming is sourced from a \*\*ThemeBuilder export\*\* vendored in the repo.



---



\## 🧱 Repo layout



/api # ASP.NET Core 8 Admin API (JWT + SSE + DB-driven CORS)

/api/openapi/admin-api.yaml # OpenAPI for the Admin API

/api/Dockerfile # API container image

/api/appsettings.json # Minimal Serilog + hosts (no secrets)



/api.Tests # Unit tests for providers/DAL

├── Fakes/FakeDal.cs

├── AllowedOriginsProviderTests.cs

└── PublicConfigProviderTests.cs



/db

├── migrations/V20250928\_2230\_\_baseline.sql

├── stored\_procedures/\*.sql

└── seeds/alpha\_seed.sql # Non-secret config + CORS (per-environment copies recommended)



/web # React 18 + Vite; KendoReact Fluent 2 via ThemeBuilder

├── Dockerfile

├── nginx.conf

├── index.html

├── vite.config.ts

├── tsconfig.json

└── src/

├── app.tsx

├── main.tsx

├── index.tsx

├── global.d.ts

├── types.ts

├── components/{TopBar.tsx,SideNav.tsx}

├── lib/{config.ts,api.ts,msalApp.tsx,sse.ts}

└── routes/{Dashboard.tsx,Sessions.tsx,Config.tsx,Access.tsx}



design/themebuilder/export/mcpx-kendobridge/ # ThemeBuilder package (SCSS/CSS + package.json)

.github/workflows/{ci.yml,deploy.yml} # CI gates + GHCR deploy

deploy/docker-compose.yml # SPA + API composition on server



yaml

Copy code



---



\## 🔐 SDLC guardrails (enforced by CI)



\- \*\*No secrets\*\* in code or DB. Use environment secrets (GitHub Environments, Key Vault).  

\- \*\*DB access = SP-only\*\*; no ad-hoc SQL in code.  

\- \*\*Add-only migrations\*\*; idempotent `CREATE OR ALTER` SPs.  

\- \*\*Theming:\*\* UI must import the \*\*ThemeBuilder package\*\* only (no direct base-theme imports).  

\- \*\*JWT auth\*\* with scope policy; \*\*SSE\*\* can require auth via DB toggle.  

\- \*\*DB-driven CORS\*\* allow-list (no static CORS lists in code).



---



\## ⚙️ Prerequisites



\- SQL Server 2022 (or Azure SQL) reachable from the API.

\- Node 20+, npm.

\- .NET SDK 8.0+.

\- Azure AD:

&nbsp; - One \*\*SPA\*\* app registration (public client).

&nbsp; - One \*\*API\*\* app registration (exposes scope, e.g., `Access.Admin`).

&nbsp; - Add SPA redirect URI (e.g., `http://localhost:5173`) and grant API permissions to the SPA.



---



\## 🗃️ Database setup



Run the baseline, SPs, and \*\*non-secret\*\* seed for your environment (alpha shown):



```sql

-- db/migrations/V20250928\_2230\_\_baseline.sql

-- db/stored\_procedures/\*.sql

-- db/seeds/alpha\_seed.sql  (edit values first)

Seed keys you must set (non-secret):



AzureAd:TenantId, AzureAd:ClientId, AzureAd:RedirectUri, AzureAd:Scope



Auth:Authority (or compute from tenant), Auth:Audience (API App ID URI / clientId)



Auth:RequiredScope (e.g., Access.Admin)



Sse:HeartbeatSeconds (e.g., 15)



Security:SseRequireAuth (true/false)



Add local origin to dbo.Security\_AllowedOrigin (e.g., http://localhost:5173)



🧪 Run locally

1\) Start API (http://localhost:5000)



bash

Copy code

cd api

\# Provide a real connection string; never commit this.

export SQL\_CONN\_STRING="Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True;"

dotnet run

2\) Start Web (http://localhost:5173)



bash

Copy code

cd web

npm install

npm run dev

The web dev server proxies /config, /access, /health, /readiness, /sessions/stream to http://localhost:5000.



🚀 Docker (optional local build)

bash

Copy code

\# API

cd api

docker build -t mcpx-admin-api:dev .

docker run --rm -p 5000:5000 -e SQL\_CONN\_STRING="..." mcpx-admin-api:dev



\# Web

cd web

docker build -t mcpx-admin-web:dev .

docker run --rm -p 8080:80 mcpx-admin-web:dev

\# browse http://localhost:8080

📦 CI \& Deploy

CI: .github/workflows/ci.yml



Validates ThemeBuilder vendor package, import rules, casing pitfalls.



Builds Web \& API and runs unit tests.



Optional CodeQL scan.



Deploy: .github/workflows/deploy.yml



Builds \& pushes images to GHCR.



SSH/SCP the compose file to the server and docker compose up -d.



Per-environment secrets required in GitHub:

DEPLOY\_HOST, DEPLOY\_USER, DEPLOY\_SSH\_KEY, DEPLOY\_PATH, SQL\_CONN\_STRING (plus optional DEPLOY\_PORT, GHCR\_USERNAME, GHCR\_PAT).



🎨 Theming (ThemeBuilder → KendoReact)

The theme package lives at:



swift

Copy code

design/themebuilder/export/mcpx-kendobridge/

&nbsp; ├── package.json  # "name": "mcpx-kendobridge"

&nbsp; └── dist/{scss,css}/...

The web app imports once:



ts

Copy code

// web/src/main.tsx

import 'mcpx-kendobridge/dist/scss/index.scss';

CI fails if base theme CSS/SCSS is imported directly anywhere under web/src.



🔧 Troubleshooting

SSE shows “Disconnected”



Check /readiness.



Verify Sse:HeartbeatSeconds is set.



If Security:SseRequireAuth=true, confirm MSAL scope/consent works and the web app appended ?access\_token=….



CORS blocked



Add your origin to dbo.Security\_AllowedOrigin.



Reload; API reads allow-list dynamically.



MSAL redirects repeatedly



Confirm SPA redirect URI and scope in DB match your Azure AD registrations.



Clear storage (localStorage/sessionStorage) and retry.



Theme guard fails



Ensure design/themebuilder/export/mcpx-kendobridge/dist/\*\* is committed and that web/src imports from that package (not from @progress/kendo-theme-\*).



🧭 Coding standards

C#: nullable enabled, 30s command timeout, SP-only DAL, idempotent SPs.



TS/React: strict TS, function components, small helpers in src/lib, no inline secrets, minimal inline styles (ThemeBuilder governs look).



Casing (Linux): Dockerfile capitalized; openapi/ lower-case; component filenames match imports exactly (TopBar.tsx, SideNav.tsx).



📄 License / Third-party

KendoReact requires a commercial license. CI can activate via KENDO\_UI\_LICENSE secret (optional step in ci.yml).

