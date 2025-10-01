/**
 * index.tsx
 * Compatibility shim for tooling that expects an "index" module under /src.
 *
 * Why this file exists:
 *  - Our actual SPA entrypoint is src/main.tsx (mounted by Vite via index.html).
 *  - Some editors, generators, or CI checks reference src/index.tsx by convention.
 *  - To keep things simple and DRY, we just re-export the root <App /> component.
 *
 * Notes:
 *  - This file does NOT call ReactDOM.createRoot(); see src/main.tsx for that.
 *  - Importers can do `import App from './index';` if they prefer the index alias.
 */

export { default } from './app';
