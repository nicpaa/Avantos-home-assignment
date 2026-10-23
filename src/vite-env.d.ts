/// <reference types="vite/client" />

// Types the env vars from .env.example; Vite's default typing is `any`.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TENANT_ID?: string;
  readonly VITE_BLUEPRINT_ID?: string;
  readonly VITE_DATA_SOURCES?: string;
}
