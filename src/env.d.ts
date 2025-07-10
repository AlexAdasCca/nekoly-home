/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_ANNOUNCEMENT_LIST_CODE: string
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
