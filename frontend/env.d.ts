/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_MODE: string
  readonly DASHSCOPE_API_KEY: string
  readonly DEEPSEEK_API_KEY: string
  readonly DOUBAO_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
