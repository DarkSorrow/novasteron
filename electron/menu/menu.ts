import { Menu, shell, BrowserWindow, MenuItemConstructorOptions, nativeTheme } from 'electron';
import * as i18nBackend from 'i18next-electron-fs-backend';
import whitelist from '../localization/whitelist';
import i18n from '../localization/i18n.mainconfig';
import { electronStore } from '../utils/store';
const isMac = process.platform === 'darwin';

interface MenuBuilderInterface {
  buildMenu: (i18nextMainBackend: typeof i18n) => Menu;
}

class MenuBuilder implements MenuBuilderInterface {
  mainWindow: BrowserWindow;
  appName: string;

  constructor(mainWindow: BrowserWindow, appName: string) {
    this.mainWindow = mainWindow;
    this.appName = appName;
  }

  buildMenu(i18nextMainBackend: typeof i18n): Menu {
    const menu = Menu.buildFromTemplate(this.defaultTemplate(i18nextMainBackend));
    Menu.setApplicationMenu(menu);
    return menu;
  }

  defaultTemplate(i18nextMainBackend: typeof i18n): MenuItemConstructorOptions[] {
    const currentThemeSource = nativeTheme.themeSource;

    return [
      // { role: "appMenu" }
      ...(isMac
        ? ([
            {
              label: this.appName,
              submenu: [
                {
                  role: 'about',
                  label: i18nextMainBackend.t('About'),
                },
                {
                  type: 'separator',
                },
                {
                  type: 'separator',
                },
                {
                  role: 'hide',
                  label: i18nextMainBackend.t('Hide'),
                },
                {
                  role: 'hideothers',
                  label: i18nextMainBackend.t('Hide Others'),
                },
                {
                  role: 'unhide',
                  label: i18nextMainBackend.t('Unhide'),
                },
                {
                  type: 'separator',
                },
                {
                  role: 'quit',
                  label: i18nextMainBackend.t('Quit'),
                },
                {
                  type: 'separator',
                },
              ],
            },
          ] as MenuItemConstructorOptions[])
        : []),
      // { role: "fileMenu" }
      {
        label: i18nextMainBackend.t('File'),
        submenu: [
          isMac
            ? {
                role: 'close',
                label: i18nextMainBackend.t('Quit'),
              }
            : {
                role: 'quit',
                label: i18nextMainBackend.t('Exit'),
              },
        ] as MenuItemConstructorOptions[],
      },
      // { role: "editMenu" }
      {
        label: i18nextMainBackend.t('Edit'),
        submenu: [
          {
            role: 'undo',
            label: i18nextMainBackend.t('Undo'),
          },
          {
            role: 'redo',
            label: i18nextMainBackend.t('Redo'),
          },
          {
            type: 'separator',
          },
          {
            role: 'cut',
            label: i18nextMainBackend.t('Cut'),
          },
          {
            role: 'copy',
            label: i18nextMainBackend.t('Copy'),
          },
          {
            role: 'paste',
            label: i18nextMainBackend.t('Paste'),
          },
          ...(isMac
            ? ([
                {
                  role: 'pasteAndMatchStyle',
                  label: i18nextMainBackend.t('Paste and Match Style'),
                },
                {
                  role: 'delete',
                  label: i18nextMainBackend.t('Delete'),
                },
                {
                  role: 'selectAll',
                  label: i18nextMainBackend.t('Select All'),
                },
                {
                  type: 'separator',
                },
                {
                  label: i18nextMainBackend.t('Speech'),
                  submenu: [
                    {
                      role: 'startSpeaking',
                      label: i18nextMainBackend.t('Start Speaking'),
                    },
                    {
                      role: 'stopSpeaking',
                      label: i18nextMainBackend.t('Stop Speaking'),
                    },
                  ] as MenuItemConstructorOptions[],
                },
              ] as MenuItemConstructorOptions[])
            : ([
                {
                  role: 'delete',
                  label: i18nextMainBackend.t('Delete'),
                },
                {
                  type: 'separator',
                },
                {
                  role: 'selectAll',
                  label: i18nextMainBackend.t('Select All'),
                },
              ] as MenuItemConstructorOptions[])),
        ] as MenuItemConstructorOptions[],
      },
      // { role: "viewMenu" }
      {
        label: i18nextMainBackend.t('View'),
        submenu: [
          {
            role: 'reload',
            label: i18nextMainBackend.t('Reload'),
          },
          {
            role: 'forceReload',
            label: i18nextMainBackend.t('Force Reload'),
          },
          {
            role: 'toggleDevTools',
            label: i18nextMainBackend.t('Toggle Developer Tools'),
          },
          {
            type: 'separator',
          },
          {
            role: 'resetZoom',
            label: i18nextMainBackend.t('Reset Zoom'),
          },
          {
            role: 'zoomIn',
            label: i18nextMainBackend.t('Zoom In'),
          },
          {
            role: 'zoomOut',
            label: i18nextMainBackend.t('Zoom Out'),
          },
          {
            type: 'separator',
          },
          {
            role: 'togglefullscreen',
            label: i18nextMainBackend.t('Toggle Fullscreen'),
          },
        ] as MenuItemConstructorOptions[],
      },
      // language menu
      {
        label: i18nextMainBackend.t('Language'),
        submenu: whitelist.buildSubmenu(
          i18nBackend.changeLanguageRequest,
          i18nextMainBackend
        ) as MenuItemConstructorOptions[],
      },
      // Theme preference menu using nativeTheme directly
      {
        label: i18nextMainBackend.t('theme.title'),
        submenu: [
          {
            label: i18nextMainBackend.t('theme.system'),
            type: 'radio',
            checked: currentThemeSource === 'system',
            click: () => {
              nativeTheme.themeSource = 'system';
              this.notifyThemeChange();
            },
          },
          {
            label: i18nextMainBackend.t('theme.light'),
            type: 'radio',
            checked: currentThemeSource === 'light',
            click: () => {
              nativeTheme.themeSource = 'light';
              this.notifyThemeChange();
            },
          },
          {
            label: i18nextMainBackend.t('theme.dark'),
            type: 'radio',
            checked: currentThemeSource === 'dark',
            click: () => {
              nativeTheme.themeSource = 'dark';
              this.notifyThemeChange();
            },
          },
        ],
      },
      // { role: "windowMenu" }
      {
        label: i18nextMainBackend.t('Window'),
        submenu: [
          {
            role: 'minimize',
            label: i18nextMainBackend.t('Minimize'),
          },
          {
            role: 'zoom',
            label: i18nextMainBackend.t('Zoom'),
          },
          ...(isMac
            ? ([
                {
                  type: 'separator',
                },
                {
                  role: 'front',
                  label: i18nextMainBackend.t('Front'),
                },
                {
                  type: 'separator',
                },
                {
                  role: 'window',
                  label: i18nextMainBackend.t('Window'),
                },
              ] as MenuItemConstructorOptions[])
            : ([
                {
                  role: 'close',
                  label: i18nextMainBackend.t('Close'),
                },
              ] as MenuItemConstructorOptions[])),
        ] as MenuItemConstructorOptions[],
      },
      // help menu
      {
        role: 'help',
        label: i18nextMainBackend.t('Help'),
        submenu: [
          {
            label: i18nextMainBackend.t('Learn More'),
            click: async () => {
              await shell.openExternal('https://electronjs.org');
            },
          },
        ],
      },
    ];
  }

  // Helper method to notify renderer of theme changes
  private notifyThemeChange(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      electronStore.set('theme', nativeTheme.themeSource);
      this.mainWindow.webContents.send('settings-updated', {
        theme: nativeTheme.themeSource,
      });
    }
  }
}

export default MenuBuilder;
