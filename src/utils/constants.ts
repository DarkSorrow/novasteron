interface List {
  [lang: string]: string;
}

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_LIST: List = {
  en: 'English',
  fr: 'Français',
  //'es': 'Español',
  //'de': 'Deutsch',
  //'it': 'Italiano',
  ar: 'اللغة العربية',
  zh: '中文 (简体)',
  //'zh': '中文 (繁體)',
  //'ja': '日本語',
  //'pt': 'Português',
  //'hi': 'हिन्दी',
  //'ru': 'Русский',
};

export const RTL_LANG: Record<string, boolean> = {
  ar: true,
  fa: true,
  he: true,
  ps: true,
  ur: true,
};

export const SUPPORTED_LANGUAGES: string[] = Object.keys(LANGUAGE_LIST);
