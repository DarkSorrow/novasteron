import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter/opsz-italic.css";
import {App} from "./App/App.tsx";
import "./index.css";
import i18n from "./utils/i18n";
import { I18nextProvider, useTranslation } from "react-i18next";

import { useMemo, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

import { getDesignTokens } from './styles/theme';
import { RTL_LANG } from "./utils/constants.ts";
import { AuthProvider, useAuth } from "./providers/auth";

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: "muiltr",
  stylisPlugins: [],
});

export const BaseApp = () => {
    const { lang, langDir, theme: themeFromAuth } = useAuth();
        // Use both language direction and theme from AuthProvider
    const emotionCache = useMemo(
      () => (langDir === 'rtl' ? cacheRtl : cacheLtr),
      [langDir]
    );
    
    // Create theme based on theme from AuthProvider and language direction
    const theme = useMemo(
      () => createTheme(getDesignTokens(themeFromAuth === 'dark' ? 'dark' : 'light', langDir)),
      [themeFromAuth, langDir],
    );

    console.log(themeFromAuth, langDir);

    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </CacheProvider>
    );
};

// App wrapped with providers
const AppWithProviders = () => {
    return (
        <I18nextProvider i18n={i18n}>
            <AuthProvider>
                <BaseApp />
            </AuthProvider>
        </I18nextProvider>
    );
};

// Create root only once
const root = ReactDOM.createRoot(document.getElementById("root")!);

// Render our app
root.render(
    <React.StrictMode>
        <AppWithProviders />
    </React.StrictMode>
);
