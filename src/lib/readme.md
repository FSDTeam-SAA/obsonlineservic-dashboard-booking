# Core Libraries and Helpers

- `api.ts`: Standardized Axios client with automatic 401 token refresh (silent auth) and resilient exponential backoff retry interceptors.
- `utils.ts`: Standard layout/class merging utility functions (e.g. cn).
- `indexed-db-storage.ts`: Promise-based IndexedDB utility helpers for local browser caching.
