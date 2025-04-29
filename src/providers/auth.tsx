import { createContext, useMemo, useContext, useReducer, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useExternalState } from '../hooks/useExternalState';
import { llmState } from '../state/llmState';
import { electronLlmRpc } from '../rpc/llmRpc';
import { database } from '../services/database';
import { DEFAULT_LANGUAGE, RTL_LANG } from '../utils/constants';
import { Model } from '../types/schema';

type direction = 'ltr' | 'rtl';
type SeverityType = 'error' | 'warning' | 'info' | 'success';

export interface Openi18nOption {
  open: boolean;
  severity: SeverityType;
  i18nMessage: string;
  i18nObject?: any;
}

interface AuthState {
  status: 'idle' | 'signOut' | 'signIn';
  userToken: string | null;
  exp: Date | null;
  homeURL: string;
  lang: string;
  theme: string;
  langDir: direction;
  openMenu: boolean;
  // Model related state
  selectedModel: Model | null;
  models: any[];
  isLoading: boolean;
  modelError: Error | null;
  snackbar: Openi18nOption;
  // Database and connection state
  databaseError: Error | null;
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
  | { type: 'SIGN_OUT' }
  | { type: 'LOAD_MODEL'; model: Model }
  | { type: 'SET_MODEL_ERROR'; error: Error | null }
  | { type: 'SET_MUTATION'; snackbar: Openi18nOption }
  | { type: 'SET_DATABASE_ERROR'; error: Error | null };

interface AuthContextActions {
  signIn: (accessToken: any) => void;
  signOut: () => void;
  loadModel: (model: Model) => Promise<void>;
  setOpenSnackbar: (open: boolean, severity: SeverityType, i18nMessage: string, i18nObject?: any) => void;
}

interface AuthContextType extends AuthState, AuthContextActions {
  database: typeof database;
}

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
  selectedModel: null,
  models: [],
  isLoading: false,//maybe remove
  modelError: null,//maybe remove
  snackbar: { open: false, severity: 'info', i18nMessage: '' },
  databaseError: null,
  signIn: () => {},
  signOut: () => {},
  loadModel: async () => {},
  setOpenSnackbar: () => {},
  database: database,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  const [state, dispatch] = useReducer(AuthReducer, {
    status: 'idle',
    userToken: null,
    exp: null,
    homeURL: '',
    lang: DEFAULT_LANGUAGE,
    theme: 'system',
    langDir: 'ltr',
    openMenu: true,
    selectedModel: null,
    models: [],
    isLoading: false,
    modelError: null,
    snackbar: { open: false, severity: 'info', i18nMessage: '' },
    databaseError: null,
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
        return;
      }
    };

    void initSettingsAndListeners();
  }, []);

  const loadModel = useCallback(async (model: Model) => {
    await electronLlmRpc.loadSelectedModel(model.modelURI);
    dispatch({ type: 'LOAD_MODEL', model });
  }, [state.models]);

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
      loadModel,
      setOpenSnackbar: async (open: boolean, severity: SeverityType, i18nMessage: string, i18nObject?: any) => {
        dispatch({
          type: 'SET_MUTATION',
          snackbar: {
            open,
            severity,
            i18nMessage,
            i18nObject,
          }
        });
      },
    }),
    [loadModel]
  );

  return (
    <AuthContext.Provider value={{ ...state, ...authActions, database }}>
      {children}
    </AuthContext.Provider>
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
        selectedModel: null,
        models: [],
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
    case 'LOAD_MODEL':
      return {
        ...prevState,
        selectedModel: action.model,
        modelError: null,
      };
    case 'SET_MODEL_ERROR':
      return {
        ...prevState,
        modelError: action.error,
        isLoading: false,
      };
    case 'SET_MUTATION':
      return {
        ...prevState,
        snackbar: action.snackbar,
      };
    case 'SET_DATABASE_ERROR':
      return {
        ...prevState,
        databaseError: action.error,
      };
    default:
      return prevState;
  }
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be inside an AuthProvider with a value');
  }
  return context;
};
