/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_APP_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}