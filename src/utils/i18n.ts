import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './constants';
// Change to check cookies, url language and then browser language
i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: DEFAULT_LANGUAGE,
    debug: false,
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'currentOnly',
  });

// NOTE: The IPC listener has been moved to the AuthProvider
// This helps centralize language state management

export default i18n;
