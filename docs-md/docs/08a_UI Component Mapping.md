> _Source: docs/08a_UI Component Mapping.docx_

**Document: 08a – UI Component Mapping (shadcn → KendoReact Fluent 2)**

**Project:** MCPX-KendoBridge Admin Portal  
**Document ID:** TJ-MCPX-DOC-08a  
**Version:** 1.0.0  
**Status:** Draft  
**Date:** 2025-09-27  
**Owner:** UX Lead / Frontend Lead (Technijian)  
**Confidentiality:** Technijian Internal

**Document Control**

| **Version** | **Date**   | **Author**  | **Change Summary**                                 | **Status** |
|-------------|------------|-------------|----------------------------------------------------|------------|
| 1.0.0       | 2025-09-27 | UX/FE Leads | Initial shadcn/Radix → **KendoReact Fluent 2** map | Draft      |

**Approvals**

| **Role/Team**             | **Name** | **Signature/Date** | **Comment** |
|---------------------------|----------|--------------------|-------------|
| Director of Software Eng. |          |                    |             |
| Systems Architect         |          |                    |             |
| QA Lead                   |          |                    |             |
| DevSecOps / SRE           |          |                    |             |

**1. Purpose**

Provide a **1:1 migration map** from the Figma Make prototype (shadcn/Radix visuals) to **KendoReact (Fluent 2 theme)**, so developers implement a consistent, accessible, production UI without mixing libraries.

**2. Scope**

All portal routes: /login, /dashboard, /config, /config/keys, /flags, /lookups, /jobs, /audit, /evidence, /access, /security/cors.  
Design tokens come from **ThemeBuilder**; **KendoReact Fluent 2** is the **only** production UI library.

**3. Theme & Global Setup**

- **Theme import (CSS):**

- // web/src/main.tsx

- import '@progress/kendo-theme-fluent/dist/all.css'; // or ThemeBuilder package path

- **Theme import (ThemeBuilder export):**

- // Example if you vend a custom package from /design/themebuilder/export/mcpx-kendobridge

- import 'design/themebuilder/export/mcpx-kendobridge/dist/css/kendo-theme-fluent.css';

- **Providers at app root:** Kendo IntlProvider (dates/numbers), React Router, MSAL provider.

- **No hard-coded colors/sizes.** Use tokens and Kendo’s utilities.

**4. Component Mapping Table**

| **Prototype Element (shadcn/Radix)** | **KendoReact Fluent 2**                          | **Notes / Usage Pattern**                                       |
|--------------------------------------|--------------------------------------------------|-----------------------------------------------------------------|
| App Shell (Sidebar + Header)         | **Drawer**, **AppBar**, **Avatar**, **Menu**     | Drawer collapses on \<768px; AppBar hosts env badge & user menu |
| Card                                 | **Card**                                         | KPI tiles, section containers                                   |
| Button                               | **Button**                                       | Primary/secondary/tokenized sizes                               |
| Tabs                                 | **TabStrip**                                     | For segmented content                                           |
| Breadcrumb                           | **Breadcrumb**                                   | Reflect route hierarchy                                         |
| Table/DataGrid                       | **Grid**                                         | Server paging/filter/sort; CSV export                           |
| Pagination                           | **Grid** built-ins                               | Use pageable config                                             |
| Dialog/Modal                         | **Dialog**                                       | Confirmation/edit forms; focus trap                             |
| Toast/Notification                   | **Notification**                                 | Success/info/error; live region                                 |
| Tooltip                              | **Tooltip**                                      | Keyboard accessible                                             |
| Accordion/Disclosure                 | **ExpansionPanel** / **PanelBar**                | Choose based on nesting needs                                   |
| Dropdown Menu                        | **DropDownButton** / **Menu**                    | Menus for action lists; buttons for inline menus                |
| Select/Autocomplete                  | **DropDownList**, **ComboBox**, **AutoComplete** | Choose by search vs strict list                                 |
| Inputs (text/number/date)            | **Input**, **NumericTextBox**, **DatePicker**    | Kendo Form integrates validation                                |
| Switch/Toggle                        | **Switch**                                       | Feature flags, boolean config                                   |
| Progress Bar                         | **ProgressBar**                                  | Job progress                                                    |
| Skeleton/Placeholder                 | **Skeleton**                                     | Any load \>250ms                                                |
| Charts                               | **Charts**                                       | Line/area/bar for SLI trends                                    |
| Sidebar “Sheet”/Slide-over           | **Drawer**                                       | Use right-side Drawer for details                               |
| Resizable Panels                     | **Splitter**                                     | Instead of custom resizable divs                                |
| Carousel                             | **Carousel**                                     | Use sparingly for visuals                                       |

**5. Route-by-Route Mapping**

**5.1 /login**

- **Kendo**: minimal (MSAL handles redirect). Optional **Card** with status/spinner.

- **AC:** Redirect to AAD; on return route → /dashboard. No tokens in localStorage.

**5.2 /dashboard**

- **Cards**: Kendo **Card** x N (Health/Ready, Version/Uptime, Queue Depth, p50/p95, Error %).

- **Charts**: Kendo **Chart** (time-series for req rate & error %).

- **Env Badge**: **Badge** in **AppBar**; value from /config/effective.

**5.3 /config (Effective Config – read)**

- **Grid**: columns \[key, value, type, scope, lastChanged, tags\].

- **Actions**: CSV export; filter/search; server pagination.

- **A11y**: header cells labelled; keyboard nav.

**5.4 /config/keys (mutations)**

- **Grid** + **Dialog** for Add/Update (Kendo **Form** with validators).

- **Toasts** on success/failure (show requestId).

- **Audit** drawer: Kendo **Drawer** or **Dialog** with before→after JSON.

**5.5 /flags**

- **Grid** with **Switch** toggle; optional **DropDownList** for env/role targeting.

- **Badge** showing current evaluation for the viewing user/env.

**5.6 /lookups**

- **Grid** per domain with Add/Update **Dialog**; **Switch** to deprecate (add-only policy).

- Referential hints rendered below editor (read-only pointers).

**5.7 /jobs**

- **Create Job** form (Kendo **Form**); on submit → Job ID.

- **SSE Panel**: progress list + **ProgressBar**; **Notification** for status.

- **Reconnect** banner (visible when SSE reconnects with backoff).

**5.8 /audit**

- **Grid** with filters (actor/action/entity/date); details **Drawer** shows before→after.

- Export CSV.

**5.9 /evidence**

- **Grid**: releases + artifact links; **Badge** for attestation present.

- Inline checksum display.

**5.10 /access**

- **AutoComplete** for AAD users; role assignment via **Switch** or **DropDownList**.

- If Graph write disabled, **Dialog** to generate Change Request.

**5.11 /security/cors**

- **Grid** of allowed Origins; Add/Remove via **Dialog**; optional approval (two-person) captured in audit.

**6. Patterns (With Code Sketches)**

**6.1 Grid with Server Operations**

// Pseudocode: server paging/sorting/filtering

\<Grid

data={data}

pageable={{ buttonCount: 5, pageSizes: true }}

sort={sort}

filter={filter}

onDataStateChange={(e) =\> setState(e.dataState)}

/\>

**6.2 Form Dialog (Create/Update)**

\<Dialog title="Edit Config" onClose={close}\>

\<Form onSubmit={onSubmit} render={(form) =\> (

\<\>

\<Field name="key" component={Input} /\>

\<Field name="value" component={Input} /\>

\<Field name="type" component={DropDownList} data={types}/\>

\<DialogActionsBar\>

\<Button themeColor="primary" disabled={!form.allowSubmit}\>Save\</Button\>

\<Button onClick={close}\>Cancel\</Button\>

\</DialogActionsBar\>

\</\>

)}/\>

\</Dialog\>

**6.3 SSE Progress Pane**

// openEventStream returns an EventSource; render heartbeat + progress events

useEffect(() =\> {

const es = openEventStream(\`/jobs/\${id}/events\`);

es.onmessage = (e) =\> setItems((prev) =\> \[...prev, JSON.parse(e.data)\]);

es.onerror = () =\> setReconnecting(true);

return () =\> es.close();

}, \[id\]);

**7. Accessibility Mapping (WCAG 2.2 AA)**

- **Focus**: visible outlines on interactive elements; verify Drawer/Dialogs trap focus.

- **ARIA**: role/state on Switch, Dialog, Tabs, Progress; toasts use **live region**.

- **Keyboard**: full keyboard path for each page; Space/Enter on switches and toggles.

- **Contrast**: tokens ≥ 4.5:1; verify charts’ color ramps.

- **Axe CI**: run on /dashboard, /config, /jobs, /access flows.

**8. Visual & Responsive Rules**

- **Breakpoints**: desktop ≥1280, tablet 768–1279, mobile \<768.

- **Drawer**: expanded on desktop, icon-only on tablet, overlay on mobile.

- **Charts**: defer render below 768 or lazy-load when visible.

- **Skeletons**: show for any remote fetch \>250ms.

**9. Error & Empty States (Envelope-Driven)**

- Use standardized envelope { code, message, details?, requestId }.

- Empty grids show help text + primary action (e.g., “No flags yet — Add flag”).

- All failure toasts show requestId for support.

**10. ThemeBuilder Integration Tasks**

1.  Export Fluent 2 tokens (colors, radii, typography) from **ThemeBuilder**.

2.  Vend under design/themebuilder/export/mcpx-kendobridge.

3.  Import CSS/SCSS in web/src/main.tsx or global stylesheet.

4.  Validate token parity in /dashboard (contrast), /flags (switch color), /jobs (progress).

**11. Page Checklist (per route)**

- Kendo-only components used; no shadcn/Radix in production build.

- Keyboard path verified; axe shows **0 critical**.

- Grid operations server-driven; CSV export where applicable.

- Error envelope surfaced with requestId.

- Env badge from /config/effective.

- SSE panel meets **TTFB ≤ 200ms** and heartbeat **≤ 10s** (jobs).

- Tokens applied; contrast verified.

**12. Developer Handoff**

- **Story templates** reference this mapping.

- **PR checklist** includes: “Kendo-only”, “axe 0 critical”, “env badge wired”, “envelope errors”, “SSE thresholds (if applicable)”.

- **Visual parity**: attach side-by-side screenshots (Figma vs Kendo) in PR.

**13. Open Issues**

- Confirm whether **ExpansionPanel** or **PanelBar** best fits Config subsections.

- Decide on **AutoComplete** vs **ComboBox** for Access user search (volume expected).

- Validate ThemeBuilder package path & versioning strategy.

**End of Document — TJ-MCPX-DOC-08a v1.0.0**
