/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  readonly VITE_CHAT_API_URL?: string;
  readonly VITE_PUSHER_KEY?: string;
  readonly VITE_PUSHER_CLUSTER?: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
