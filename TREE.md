# Repository File Index

_Auto-generated on 2025-09-30T18:04:08Z_

```
./
├── .github/
│   ├── CODEOWNERS
│   ├── CODEOWNERS.docx
│   ├── pull_request_template.docx
│   ├── pull_request_template.md
│   └── workflows/
│       ├── ci.yml
│       ├── codeql.yml
│       ├── deploy.yml
│       ├── docx-to-md.yml
│       ├── tree-index.yml
│       └── validate-themebuilder.yml
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── TREE.md
├── adr/
│   └── README.md
├── api/
│   ├── .dockerignore
│   ├── OpenApi/
│   │   └── mcp-proxy.yaml
│   ├── README.md
│   ├── Technijian.MCPX.AdminApi.csproj
│   ├── dockerfile
│   └── program.cs
├── api.tests/
│   ├── AllowedOriginsProviderTests.cs
│   ├── Fakes/
│   │   └── FakeDal.cs
│   ├── PublicConfigProviderTests.cs
│   └── Technijian.MCPX.AdminApi.Tests.csproj
├── config/
│   ├── effective/
│   │   └── expectede-prod.json
│   └── expected/
│       └── expected-prod.json
├── db/
│   ├── grants/
│   │   └── .gitkeep
│   ├── migrations/
│   │   ├── .gitkeep
│   │   ├── V202509230900__init_schema.sql
│   │   ├── V202509230905__seed_appconfig_featureflag.sql
│   │   ├── V20250928_2230__baseline.sql
│   │   ├── sp_Config_GetAll.sql
│   │   ├── sp_Config_GetValue.sql
│   │   ├── sp_Feature_IsEnabled.sql
│   │   ├── sp_Lookup_Get.sql
│   │   └── sp_Security_GetAllowedOrigins.sql
│   ├── seeds/
│   │   └── alpha_seed.sql
│   └── stored_procedures/
│       ├── .gitkeep
│       ├── sp_Config_GetAll.sql
│       ├── sp_Config_GetValue.sql
│       ├── sp_Feature_IsEnabled.sql
│       └── sp_Lookup_Get.sql
├── deploy/
│   └── docker-compose.yml
├── design/
│   ├── figma/
│   │   ├── README.md
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── Attributions.md
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── AuthProvider.tsx
│   │   │   │   │   ├── ForbiddenPage.tsx
│   │   │   │   │   ├── LoginCallback.tsx
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── LogoutPage.tsx
│   │   │   │   │   ├── RootGuard.tsx
│   │   │   │   │   ├── SimpleAuthProvider.tsx
│   │   │   │   │   └── SimpleLoginPage.tsx
│   │   │   │   ├── figma/
│   │   │   │   │   └── ImageWithFallback.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── AccessControl.tsx
│   │   │   │   │   ├── Config.tsx
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Sessions.tsx
│   │   │   │   │   └── SimpleDashboard.tsx
│   │   │   │   ├── shell/
│   │   │   │   │   ├── AppFooter.tsx
│   │   │   │   │   ├── AppHeader.tsx
│   │   │   │   │   ├── AppShell.tsx
│   │   │   │   │   └── AppSidebar.tsx
│   │   │   │   ├── states/
│   │   │   │   │   ├── NotFound.tsx
│   │   │   │   │   ├── OfflineBanner.tsx
│   │   │   │   │   ├── ServerError.tsx
│   │   │   │   │   └── SimpleNotFound.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── accordion.tsx
│   │   │   │       ├── alert-dialog.tsx
│   │   │   │       ├── alert.tsx
│   │   │   │       ├── aspect-ratio.tsx
│   │   │   │       ├── avatar.tsx
│   │   │   │       ├── badge.tsx
│   │   │   │       ├── breadcrumb.tsx
│   │   │   │       ├── button.tsx
│   │   │   │       ├── calendar.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── carousel.tsx
│   │   │   │       ├── chart.tsx
│   │   │   │       ├── checkbox.tsx
│   │   │   │       ├── collapsible.tsx
│   │   │   │       ├── command.tsx
│   │   │   │       ├── context-menu.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── drawer.tsx
│   │   │   │       ├── dropdown-menu.tsx
│   │   │   │       ├── form.tsx
│   │   │   │       ├── hover-card.tsx
│   │   │   │       ├── icons.tsx
│   │   │   │       ├── input-otp.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       ├── label.tsx
│   │   │   │       ├── menubar.tsx
│   │   │   │       ├── navigation-menu.tsx
│   │   │   │       ├── pagination.tsx
│   │   │   │       ├── popover.tsx
│   │   │   │       ├── progress.tsx
│   │   │   │       ├── radio-group.tsx
│   │   │   │       ├── resizable.tsx
│   │   │   │       ├── scroll-area.tsx
│   │   │   │       ├── select.tsx
│   │   │   │       ├── separator.tsx
│   │   │   │       ├── sheet.tsx
│   │   │   │       ├── sidebar.tsx
│   │   │   │       ├── skeleton.tsx
│   │   │   │       ├── slider.tsx
│   │   │   │       ├── sonner.tsx
│   │   │   │       ├── switch.tsx
│   │   │   │       ├── table.tsx
│   │   │   │       ├── tabs.tsx
│   │   │   │       ├── textarea.tsx
│   │   │   │       ├── toggle-group.tsx
│   │   │   │       ├── toggle.tsx
│   │   │   │       ├── tooltip.tsx
│   │   │   │       ├── use-mobile.ts
│   │   │   │       └── utils.ts
│   │   │   ├── guidelines/
│   │   │   │   └── Guidelines.md
│   │   │   ├── index.css
│   │   │   ├── main.tsx
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── tokens.json
│   │   └── vite.config.ts
│   └── themebuilder/
│       └── export/
│           ├── README.md
│           └── mcpx-kendobridge/
│               └── package.json
├── docs/
│   ├── 01_vision.docx
│   ├── 02_glossary.docx
│   ├── 03_actors_usecases.docx
│   ├── 04_context.docx
│   ├── 05_fr.docx
│   ├── 06_nfr.docx
│   ├── 07_data_contracts.docx
│   ├── 07a_db_grants_sp_signature.docx
│   ├── 08_ui_ux.docx
│   ├── 08a_UI Component Mapping.docx
│   ├── 08b_ui_ops_supplement.docx
│   ├── 09_test_strategy.docx
│   ├── 10_ci_cd.docx
│   ├── 11_monitoring.docx
│   ├── 12_evidence_pack.docx
│   ├── 13_compliance.docx
│   ├── 14_raci.docx
│   ├── 15_backlog.docx
│   ├── 16_dor_dod.docx
│   ├── 17_threat_model.docx
│   ├── README.md
│   ├── adr/
│   │   ├── ADR-001_transport_streamable_http.docx
│   │   ├── ADR-002_legacy_endpoints_flag.docx
│   │   ├── ADR-003_session_per_mcp_session_id.docx
│   │   ├── ADR-004_db_policy_sp_only_add_only_no_hard_coding.docx
│   │   ├── ADR-005_RTM on Prod DB Readonly Gate.docx
│   │   └── ADR_Index.docx
│   ├── config_reference.docx
│   └── error_catalog.docx
├── docs-md/
│   ├── .github/
│   │   ├── CODEOWNERS.md
│   │   └── pull_request_template.md
│   ├── docs/
│   │   ├── 01_vision.md
│   │   ├── 02_glossary.md
│   │   ├── 03_actors_usecases.md
│   │   ├── 04_context.md
│   │   ├── 05_fr.md
│   │   ├── 06_nfr.md
│   │   ├── 07_data_contracts.md
│   │   ├── 07a_db_grants_sp_signature.md
│   │   ├── 08_ui_ux.md
│   │   ├── 08a_UI Component Mapping.md
│   │   ├── 08b_ui_ops_supplement.md
│   │   ├── 09_test_strategy.md
│   │   ├── 10_ci_cd.md
│   │   ├── 11_monitoring.md
│   │   ├── 12_evidence_pack.md
│   │   ├── 13_compliance.md
│   │   ├── 14_raci.md
│   │   ├── 15_backlog.md
│   │   ├── 16_dor_dod.md
│   │   ├── 17_threat_model.md
│   │   ├── adr/
│   │   │   ├── ADR-001_transport_streamable_http.md
│   │   │   ├── ADR-002_legacy_endpoints_flag.md
│   │   │   ├── ADR-003_session_per_mcp_session_id.md
│   │   │   ├── ADR-004_db_policy_sp_only_add_only_no_hard_coding.md
│   │   │   ├── ADR-005_RTM on Prod DB Readonly Gate.md
│   │   │   └── ADR_Index.md
│   │   ├── config_reference.md
│   │   └── error_catalog.md
│   └── runbooks/
│       ├── deploy.md
│       ├── incident.md
│       ├── rollback.md
│       ├── rotate_telerik_license.md
│       └── scale_out.md
├── filelist.txt
├── runbooks/
│   ├── README.md
│   ├── deploy.docx
│   ├── incident.docx
│   ├── rollback.docx
│   ├── rotate_telerik_license.docx
│   └── scale_out.docx
├── scripts/
│   └── validate-themebuilder.sh
├── tests/
│   ├── api/
│   │   └── .gitkeep
│   ├── contract/
│   │   └── .gitkeep
│   ├── gherkin/
│   │   ├── .gitkeep
│   │   ├── 01_session_establish.feature
│   │   ├── 02_streamed_tool_call.feature
│   │   ├── 03_background_notification.feature
│   │   └── 04_origin_denied.feature
│   ├── perf/
│   │   ├── k6/
│   │   │   └── k6_sse_ttfb.js
│   │   └── k6_sse_ttfb.js
│   └── web/
│       └── .gitkeep
└── web/
    ├── .dockerignore
    ├── README.md
    ├── dockerfile
    ├── index.html
    ├── nginx.conf
    ├── package.json
    ├── src/
    │   ├── app.tsx
    │   ├── components/
    │   │   ├── sidenav.txt
    │   │   └── topbar.tsx
    │   ├── global.d.ts
    │   ├── index.tsx
    │   ├── lib/
    │   │   ├── api.ts
    │   │   ├── config.ts
    │   │   ├── msalapp.tsx
    │   │   └── sse.ts
    │   ├── main.tsx
    │   ├── routes/
    │   │   ├── access.tsx
    │   │   ├── config.tsx
    │   │   ├── dashboard.tsx
    │   │   └── sessions.tsx
    │   ├── styles/
    │   │   └── themebuilder-overrides.css
    │   └── types.ts
    ├── tsconfig.json
    └── vite.config.ts

54 directories, 235 files
```
