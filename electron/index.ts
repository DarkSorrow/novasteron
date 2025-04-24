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
// No longer need themeManager since we're using nativeTheme
// import { themeManager } from "./theme/themeManager.ts";

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

function createTray() {
  tray = new Tray(getTrayIconPath());
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open Novasteron', 
      click: () => {
        if (win) {
          win.show();
        } else {
          createWindow();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
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
        createWindow();
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

function createWindow() {
  // Create the main window but don't show it yet
  // It will only be shown after receiving the 'app-ready' signal from the renderer
  win = new BrowserWindow({
    icon: getIconPath(),
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
        theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light' 
      });
    }
  });

  // Handler to get the current system theme
  ipcMain.handle('dark-mode:get', () => {
    return {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      themeSource: nativeTheme.themeSource
    };
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
    console.log('i18NextMainConfig initialized - rebuilding menu');
    // Build menu once i18n is ready
    menuBuilder.buildMenu(i18NextMainConfig);
    
    // Send settings event with both theme and language
    win?.webContents.send('settings-updated', { 
      language: i18NextMainConfig.language,
      theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    });
  });

  // Handle language changes
  i18NextMainConfig.on('languageChanged', (lng) => {
    console.log(`Language changed to ${lng} - rebuilding menu`);
    if (i18NextMainConfig.isInitialized) {
      // Rebuild menu with new translations
      menuBuilder.buildMenu(i18NextMainConfig);
      
      // Send settings event with language change
      win?.webContents.send('settings-updated', { language: lng });
    }
  });

  // Make sure the menu is created and shown
  Menu.setApplicationMenu(Menu.getApplicationMenu());
}

// Handle app ready event from the React app
ipcMain.on('app-ready', () => {
  console.log('Received app-ready signal from renderer');
  
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
    createWindow();
  }
});

app.whenReady().then(() => {
  console.log('*********** theme', nativeTheme.themeSource);
  console.log('******** i18n', app.getLocale());
  const theme = electronStore.get('theme') as 'dark' | 'light' | 'system';
  const language = electronStore.get('language');
  if (!language) {
    const languages = app.getLocale();
    electronStore.set('language', whitelist.getLanguageName(Array.isArray(languages) ? languages[0] : languages));
  }
  if (!theme) {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    electronStore.set('theme', theme);
  }
  console.log('*********** test', {
    theme,
    language
  });
  
  // First, create and show splash screen
  createSplashScreen();
  
  // Then initialize the app window (but don't show it yet)
  createWindow();
  createTray();
});
