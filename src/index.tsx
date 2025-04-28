import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter/opsz-italic.css';
import { App } from './App/App.tsx';
import './index.css';
import i18n from './utils/i18n';
import { I18nextProvider } from 'react-i18next';

import { useMemo, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { IndexRouting } from './index-routing';
import { getDesignTokens } from './styles/theme';
import { AuthProvider, useAuth } from './providers/auth';

// Create caches for RTL and LTR text direction
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [],
});

// Base application with theme and direction handling
export const AppWithTheme = () => {
  const { langDir, theme: themeFromAuth } = useAuth();

  // Use cache based on text direction (RTL or LTR)
  const emotionCache = useMemo(() => (langDir === 'rtl' ? cacheRtl : cacheLtr), [langDir]);

  // Create theme based on theme from AuthProvider and language direction
  const theme = useMemo(
    () => createTheme(getDesignTokens(themeFromAuth === 'dark' ? 'dark' : 'light', langDir)),
    [themeFromAuth, langDir]
  );

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IndexRouting />
      </ThemeProvider>
    </CacheProvider>
  );
};

// App wrapped with providers
const AppWithProviders = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppWithTheme />
      </AuthProvider>
    </I18nextProvider>
  );
};

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create root only if it doesn't exist
let root = (window as any).__reactRoot;
if (!root) {
  root = ReactDOM.createRoot(rootElement);
  (window as any).__reactRoot = root;
}

// Render our app
root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);
