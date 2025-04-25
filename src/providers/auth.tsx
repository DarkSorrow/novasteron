import { createContext, useMemo, useContext, useReducer, useEffect } from "react";
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, RTL_LANG, LANGUAGE_LIST } from "../utils/constants";

type direction = "ltr" | "rtl";
interface AuthState {
  status: "idle" | "signOut" | "signIn";
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
      type: "SIGN_IN";
      token: string | null;
      exp: Date;
      homeURL: string;
    }
  | {
      type: "SWITCH_THEME";
      theme: string;
    }
  | {
      type: "SWITCH_LANGUAGE";
      lang: string;
      langDir: direction;
    }
  | {
      type: "SWITCH_SETTINGS";
      lang: string;
      langDir: direction;
      theme: string;
    }
  | { type: "SIGN_OUT" }

interface AuthContextActions {
  signIn: (accessToken: any) => void;
  signOut: () => void;
}

interface AuthContextType extends AuthState, AuthContextActions {}

// Constants for localStorage keys
const STORAGE_TOKEN = 'auth_token';

const AuthContext = createContext<AuthContextType>({
  status: "idle",
  userToken: null,
  exp: null,
  homeURL: "",
  theme: 'system',
  lang: DEFAULT_LANGUAGE,
  langDir: "ltr",
  openMenu: true,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  // Initial state with synchronous initialization
  const [state, dispatch] = useReducer(AuthReducer, {
    status: "idle",
    userToken: null,
    exp: null,
    homeURL: "",
    lang: DEFAULT_LANGUAGE,
    theme: 'system',
    langDir: "ltr",
    openMenu: true
  });
  
  // Initialize theme and set up listeners for changes from Electron
  useEffect(() => {
    // Initialize theme from Electron's native theme
    const initThemeAndListeners = async () => {
      try {
        // INITIAL VALUE SHOULD BE THE WHOLE SETTINGS NOT JUST THEME
        // !!!!!!!!!!!! this way it is the start and we get both language and theme at the same
        // time. During the rest of the application lifecylce this won't be needed as a user won't be
        // able to change both at the same time
        // Get initial theme from Electron
        const settings = await window.ipcRenderer.invoke('settings-get');
        
        // Update auth state with initial theme
        console.log('Settings from Electron*****:', settings);
        dispatch({
          type: "SWITCH_SETTINGS",
          lang: settings.language,
          langDir: RTL_LANG[settings.language] ? 'rtl' : 'ltr',
          theme: settings.theme
        });
        
        // Also change i18n language to match
        if (settings.language && i18n.language !== settings.language) {
          i18n.changeLanguage(settings.language);
        }
        
        // Handler for settings updates from the main process
        const handleSettingsUpdate = (_: any, data: { theme?: string; language?: string }) => {
          console.log('Settings updated from Electron:', data);
          
          // Handle theme updates if provided
          if (data.theme) {
            dispatch({
              type: "SWITCH_THEME",
              theme: data.theme
            });
          }
          
          // Handle language updates if provided
          if (data.language) {
            const direction = RTL_LANG[data.language] ? 'rtl' : 'ltr';
            
            dispatch({
              type: "SWITCH_LANGUAGE",
              lang: data.language,
              langDir: direction
            });
            
            i18n.changeLanguage(data.language);
          }
        };
        
        // Register the listener for the unified settings update event
        window.ipcRenderer.on('settings-updated', handleSettingsUpdate);
        
        // Clean up on unmount
        return () => {
          window.ipcRenderer.off('settings-updated', handleSettingsUpdate);
        };
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        // Fallback to system preference for theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({
          type: "SWITCH_THEME",
          theme: prefersDark ? 'dark' : 'light'
        });
      }
    };
    
    void initThemeAndListeners();
  }, [i18n]);

  const authActions: AuthContextActions = useMemo(
    () => ({
      signIn: async (accessToken: any) => {
        const expire = new Date(accessToken.exp * 1000);
        const token = accessToken.token || null;
        
        if (token) {
          localStorage.setItem(STORAGE_TOKEN, JSON.stringify({
            token,
            exp: expire
          }));
        }
        
        dispatch({
          type: "SIGN_IN",
          token,
          exp: expire,
          homeURL: "",
        });
      },
      
      signOut: async () => {
        localStorage.removeItem(STORAGE_TOKEN);
        dispatch({ type: "SIGN_OUT" });
      }
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ ...state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        ...prevState,
        status: "signIn",
        userToken: action.token,
        exp: action.exp,
        homeURL: action.homeURL,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        status: "signOut",
        userToken: null,
      };
    case "SWITCH_THEME":
      return {
        ...prevState,
        theme: action.theme,
      };
    case "SWITCH_LANGUAGE":
      return {
        ...prevState,
        lang: action.lang,
        langDir: action.langDir,
      };
    case "SWITCH_SETTINGS":
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
    throw new Error("useAuth must be inside an AuthProvider with a value");
  }
  return context;
};
