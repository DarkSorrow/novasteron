import { createContext, useMemo, useContext, useReducer, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, RTL_LANG } from '../utils/constants';

type direction = 'ltr' | 'rtl';
interface AuthState {
  status: 'idle' | 'signOut' | 'signIn';
  userToken: string | null;
  exp: Date | null;
  homeURL: string;
  lang: string;
  theme: string;
  langDir: direction;
  openMenu: boolean;
}

type AuthAction =
  | {
      type: 'SIGN_IN';
      token: string | null;
      exp: Date;
      homeURL: string;
    }
  | {
      type: 'SWITCH_THEME';
      theme: string;
    }
  | {
      type: 'SWITCH_LANGUAGE';
      lang: string;
      langDir: direction;
    }
  | {
      type: 'SWITCH_SETTINGS';
      lang: string;
      langDir: direction;
      theme: string;
    }
  | { type: 'SIGN_OUT' };

interface AuthContextActions {
  signIn: (accessToken: any) => void;
  signOut: () => void;
}

interface AuthContextType extends AuthState, AuthContextActions {}

// Constants for localStorage keys
const STORAGE_TOKEN = 'auth_token';

const AuthContext = createContext<AuthContextType>({
  status: 'idle',
  userToken: null,
  exp: null,
  homeURL: '',
  theme: 'system',
  lang: DEFAULT_LANGUAGE,
  langDir: 'ltr',
  openMenu: true,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  // Initial state with synchronous initialization
  const [state, dispatch] = useReducer(AuthReducer, {
    status: 'idle',
    userToken: null,
    exp: null,
    homeURL: '',
    lang: DEFAULT_LANGUAGE,
    theme: 'system',
    langDir: 'ltr',
    openMenu: true,
  });

  const handleLanguageChange = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
      document.documentElement.dir = RTL_LANG[language] ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    },
    [i18n.changeLanguage]
  );

  // Create a stable handler function for settings updates
  const handleSettingsUpdate = useCallback(
    (_: any, data: { theme?: string; language?: string }) => {
      console.log('Settings updated from Electron:', data);

      // Handle theme updates if provided
      if (data.theme) {
        dispatch({
          type: 'SWITCH_THEME',
          theme: data.theme,
        });
      }

      // Handle language updates if provided
      if (data.language) {
        const direction = RTL_LANG[data.language] ? 'rtl' : 'ltr';

        dispatch({
          type: 'SWITCH_LANGUAGE',
          lang: data.language,
          langDir: direction,
        });

        handleLanguageChange(data.language);
      }
    },
    [handleLanguageChange]
  );

  // Initialize settings and set up listeners for changes from Electron
  useEffect(() => {
    const initSettingsAndListeners = async () => {
      try {
        // Get initial settings from Electron
        const settings = await window.settings.getSettings();
        console.log('Initial settings from Electron:', settings);

        if (settings && settings.language && settings.theme) {
          // Determine text direction based on language
          const direction = RTL_LANG[settings.language] ? 'rtl' : 'ltr';

          // Update auth state with initial settings
          dispatch({
            type: 'SWITCH_SETTINGS',
            lang: settings.language,
            langDir: direction,
            theme: settings.theme,
          });

          // Also change i18n language to match
          if (i18n.language !== settings.language) {
            handleLanguageChange(settings.language);
          }
        }

        // Register the listener for the unified settings update event
        window.ipcRenderer.on('settings-updated', handleSettingsUpdate);

        // Clean up on unmount
        return () => {
          window.ipcRenderer.off('settings-updated', handleSettingsUpdate);
        };
      } catch (error) {
        console.error('Failed to initialize settings:', error);
        // Fallback to system preference for theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({
          type: 'SWITCH_THEME',
          theme: prefersDark ? 'dark' : 'light',
        });
      }
    };

    void initSettingsAndListeners();
  }, []);

  const authActions: AuthContextActions = useMemo(
    () => ({
      signIn: async (accessToken: any) => {
        const expire = new Date(accessToken.exp * 1000);
        const token = accessToken.token || null;

        if (token) {
          localStorage.setItem(
            STORAGE_TOKEN,
            JSON.stringify({
              token,
              exp: expire,
            })
          );
        }

        dispatch({
          type: 'SIGN_IN',
          token,
          exp: expire,
          homeURL: '',
        });
      },

      signOut: async () => {
        localStorage.removeItem(STORAGE_TOKEN);
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ ...state, ...authActions }}>{children}</AuthContext.Provider>
  );
};

const AuthReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...prevState,
        status: 'signIn',
        userToken: action.token,
        exp: action.exp,
        homeURL: action.homeURL,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        status: 'signOut',
        userToken: null,
      };
    case 'SWITCH_THEME':
      return {
        ...prevState,
        theme: action.theme,
      };
    case 'SWITCH_LANGUAGE':
      return {
        ...prevState,
        lang: action.lang,
        langDir: action.langDir,
      };
    case 'SWITCH_SETTINGS':
      return {
        ...prevState,
        lang: action.lang,
        langDir: action.langDir,
        theme: action.theme,
      };
  }
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be inside an AuthProvider with a value');
  }
  return context;
};
