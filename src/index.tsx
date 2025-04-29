import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import { useMemo, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IndexRouting } from './index-routing';
import { getDesignTokens } from './styles/theme';
import { AuthProvider, useAuth } from './providers/auth';
import { database } from './services/database';
import '@fontsource-variable/inter/opsz-italic.css';
import './index.css';

// Initialize database before app renders
const initDatabase = async () => {
  try {
    await database.init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // We could show a user-friendly error message here
    // or implement a retry mechanism
  }
};

// Initialize database immediately
initDatabase();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Single retry attempt
      retryDelay: 1000, // Fixed delay of 1 second
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Mutation error:', error);
        // We could show a user-friendly error message here
      }
    }
  },
});

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
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </I18nextProvider>
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
};

// Get root element
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Render our app
root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);
