import {ipcRenderer, contextBridge, IpcRendererEvent} from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  }
});

// Expose specific API functions for the splash screen
contextBridge.exposeInMainWorld("splashScreen", {
  // Signal that the app is ready to show the main window
  appReady: () => {
    ipcRenderer.send("app-ready");
  }
});

// Use Electron's native theme approach - only for getting the initial theme
// The renderer will never change the theme via this API
contextBridge.exposeInMainWorld("darkMode", {
  // Get the current theme state
  getTheme: () => ipcRenderer.invoke("dark-mode:get")
});
