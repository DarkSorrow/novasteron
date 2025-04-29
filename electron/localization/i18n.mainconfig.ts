import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { app } from 'electron';

import { electronStore } from '../utils/store';
import whitelist from './whitelist';

// On Mac, the folder for resources isn't
// in the same directory as Linux/Windows;
// https://www.electron.build/configuration/contents#extrafiles
import path from 'path';
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';
const prependPath = isMac && !isDev ? path.join(process.resourcesPath, '..') : '.';

i18next.use(Backend).init({
  backend: {
    loadPath: prependPath + '/electron/localization/locales/{{lng}}/{{ns}}.json',
    addPath: prependPath + '/electron/localization/locales/{{lng}}/{{ns}}.missing.json',
  },
  debug: false, // Enable debug to see more information
  defaultNS: 'translation',
  saveMissing: true, // Save missing translations to help identify issues
  lng: whitelist.getLanguageName(electronStore.get('language', app.getLocale()) as string),
  fallbackLng: 'en', // Set fallback to ensure something displays
  supportedLngs: whitelist.langs,
  initImmediate: false, // This can help ensure synchronous loading of resources
});

// Handle initialization success
i18next.on('initialized', options => {
  console.log('i18next initialized with language:', i18next.language);
  console.log('Available resources:', Object.keys(i18next.services.resourceStore.data));
});

// Handle initialization errors
i18next.on('failedLoading', (lng, ns, msg) => {
  console.error(`Failed loading translation - lng: ${lng}, ns: ${ns}, msg: ${msg}`);
});

// Handle missing keys
i18next.on('missingKey', (lng, ns, key, value) => {
  console.warn(`Missing translation key - lng: ${lng}, ns: ${ns}, key: ${key}`);
});

export default i18next;
