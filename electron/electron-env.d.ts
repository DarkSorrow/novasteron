/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── index.js
     * │ │ └── preload.mjs
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer;

  // Splash screen API
  splashScreen: {
    appReady: () => void;
  };

  // Dark mode API - only for getting the initial theme
  darkMode: {
    getTheme: () => Promise<{
      shouldUseDarkColors: boolean;
      themeSource: 'dark' | 'light' | 'system';
    }>;
  };
}
