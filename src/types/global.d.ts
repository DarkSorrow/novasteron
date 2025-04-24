interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (...args: any[]) => void) => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
  };
  splashScreen: {
    appReady: () => void;
  };
  darkMode: {
    toggle: () => Promise<boolean>;
    system: () => Promise<boolean>;
    getTheme: () => Promise<{
      shouldUseDarkColors: boolean;
      themeSource: 'system' | 'light' | 'dark';
    }>;
  };
} 