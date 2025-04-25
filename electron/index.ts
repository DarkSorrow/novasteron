import {fileURLToPath} from "node:url";
import path from "node:path";
import {app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeTheme} from "electron";
import {registerLlmRpc} from "./rpc/llmRpc.ts";
import fs from "node:fs";
import * as i18nBackend from "i18next-electron-fs-backend";
import i18NextMainConfig from "./localization/i18n.mainconfig.ts";
import MenuBuilder from "./menu/menu.ts";
import whitelist from "./localization/whitelist.ts";
import { electronStore } from "./utils/store.ts";
import type i18n from "i18next";
// No longer need themeManager since we're using nativeTheme
// import { themeManager } from "./theme/themeManager.ts";

// Set application name for Windows taskbar
if (process.platform === 'win32') {
  app.setAppUserModelId('com.novasteron.app');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── index.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let menuBuilder: MenuBuilder;
let tray: Tray | null = null;
let splashScreen: BrowserWindow | null = null;

// Get platform-specific icon path
const getIconPath = () => {
  const iconBase = path.join(process.env.VITE_PUBLIC, "icons");
  switch (process.platform) {
    case "win32":
      return path.join(iconBase, "win", "icon.ico");
    case "darwin":
      return path.join(iconBase, "mac", "icon.icns");
    default:
      return path.join(iconBase, "png", "512x512.png");
  }
};

// Get platform-specific tray icon path
const getTrayIconPath = () => {
  const iconBase = path.join(process.env.VITE_PUBLIC, "icons", "png");
  // Use smaller icons for tray to ensure good visibility
  switch (process.platform) {
    case "win32":
      return path.join(iconBase, "32x32.png");
    case "darwin":
      return path.join(iconBase, "16x16.png"); // macOS tray icons look best at 16x16
    default:
      return path.join(iconBase, "24x24.png");
  }
};

function createTray(
  theme: 'dark' | 'light' | 'system',
  language: string,
  i18NextMainConfig: typeof i18n
) {
  tray = new Tray(getTrayIconPath());
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: i18NextMainConfig.t('open', { name: 'Novasteron' }), 
      click: () => {
        if (win) {
          win.show();
        } else {
          createWindow(theme, language);
        }
      }
    },
    { type: 'separator' },
    { 
      label: i18NextMainConfig.t('quit'), 
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Novasteron');
  tray.setContextMenu(contextMenu);

  // On macOS, click should open the app
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      if (win) {
        win.show();
      } else {
        createWindow(theme, language);
      }
    });
  }
}

function createSplashScreen() {
  splashScreen = new BrowserWindow({
    width: 500,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashScreen.loadFile(path.join(process.env.VITE_PUBLIC, "splash.html"));
  splashScreen.center();
  splashScreen.removeMenu();
  
  // Ensure splash screen is visible
  splashScreen.show();
  splashScreen.focus();

  splashScreen.on('closed', () => {
    splashScreen = null;
  });

  return splashScreen;
}

function createWindow(theme: 'dark' | 'light' | 'system', language: string) {
  // Create the main window but don't show it yet
  // It will only be shown after receiving the 'app-ready' signal from the renderer
  // Handler to get the current system theme
  ipcMain.handle('settings-get', () => {
    return {
      theme: theme,
      language: language
    };
  });

  win = new BrowserWindow({
    icon: getIconPath(),
    title: 'Novasteron',
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      // For debugging
      devTools: true
    },
    width: 1000,
    height: 700,
    show: false // Initially hidden until React app signals it's ready
  });
  
  // For debugging
  win.webContents.openDevTools();

  registerLlmRpc(win);

  // Listen for native theme updates and notify renderer
  nativeTheme.on('updated', () => {
    if (win && !win.isDestroyed()) {
      // Send the settings event with theme information
      win.webContents.send('settings-updated', { 
        theme: nativeTheme.themeSource
      });
    }
  });

  // Open external links in the default browser
  win.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith("file://"))
      return {action: "allow"};

    void shell.openExternal(url);
    return {action: "deny"};
  });

  if (VITE_DEV_SERVER_URL)
    void win.loadURL(VITE_DEV_SERVER_URL);
  else
    void win.loadFile(path.join(RENDERER_DIST, "index.html"));

  // Create and build the menu - IMPORTANT: Do this before i18n setup
  menuBuilder = new MenuBuilder(win, app.name);
  menuBuilder.buildMenu(i18NextMainConfig); // Build menu with initial config
  
  // Set up i18n backend
  i18nBackend.mainBindings(ipcMain, win, fs);

  // Set up necessary bindings to update the menu items
  // based on the current language selected
  i18NextMainConfig.on('initialized', () => {
    // Build menu once i18n is ready
    menuBuilder.buildMenu(i18NextMainConfig);
    
    // Send settings event with both theme and language
    win?.webContents.send('settings-updated', { 
      language: i18NextMainConfig.language,
      theme: nativeTheme.themeSource
    });
  });

  // Handle language changes
  i18NextMainConfig.on('languageChanged', (lng) => {
    if (i18NextMainConfig.isInitialized) {
      // Rebuild menu with new translations
      menuBuilder.buildMenu(i18NextMainConfig);
      electronStore.set('language', lng);
      // Send settings event with language change
      win?.webContents.send('settings-updated', { language: lng });
    }
  });

  // Make sure the menu is created and shown
  Menu.setApplicationMenu(Menu.getApplicationMenu());
}

// Handle app ready event from the React app
ipcMain.on('app-ready', () => {
  // Close splash screen if it exists
  if (splashScreen) {
    splashScreen.close();
  }
  
  // Show main window
  if (win) {
    win.show();
    win.focus();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  } else {
    i18nBackend.clearMainBindings(ipcMain);
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const theme = electronStore.get('theme') as 'dark' | 'light' | 'system';
    const language = electronStore.get('language') as string | undefined ?? 'en';
    createWindow(theme, language);
  }
});

app.whenReady().then(() => {
  let theme = electronStore.get('theme') as 'dark' | 'light' | 'system';
  let language = electronStore.get('language') as string | undefined;
  
  // Initialize language if not set
  if (!language) {
    const detectedLanguage = app.getLocale();
    language = whitelist.getLanguageName(detectedLanguage);
    electronStore.set('language', language);
    
    // Force i18next to use this language if it's already initialized
    if (i18NextMainConfig.isInitialized && i18NextMainConfig.language !== language) {
      i18NextMainConfig.changeLanguage(language);
    }
  } else {
    // Ensure i18next is using the stored language
    if (i18NextMainConfig.isInitialized && i18NextMainConfig.language !== language) {
      i18NextMainConfig.changeLanguage(language);
    }
  }
  
  // Initialize theme if not set
  if (!theme) {
    theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    electronStore.set('theme', theme);
  } else {
    nativeTheme.themeSource = theme;
  }
  
  // First, create and show splash screen
  createSplashScreen();
  
  // Then initialize the app window (but don't show it yet)
  createWindow(theme, language);
  createTray(theme, language, i18NextMainConfig);
});
