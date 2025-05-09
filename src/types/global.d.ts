interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (...args: any[]) => void) => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
  splashScreen: {
    appReady: () => void;
  };
  settings: {
    getSettings: () => Promise<{
      theme: 'dark' | 'light' | 'system';
      language: string;
    }>;
  };
}
