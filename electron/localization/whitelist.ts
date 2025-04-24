// Contains a whitelist of languages for our app
const whitelistMap: Record<string, string> = {
  en: 'English',
  // af: 'Afrikaans', //Afrikaans
  ar: 'عربى', // Arabic
  // am: 'አማርኛ', // Amharic
  // bg: 'български', // Bulgarian
  // ca: 'Català', // Catalan
  // cs: 'čeština', // Czech
  // da: 'Dansk', // Danish
  // de: 'Deutsche', // German
  // el: 'Ελληνικά', // Greek
  // es: 'Español', // Spanish
  // et: 'Eestlane', // Estonian
  // fa: 'فارسی', // Persian
  // fi: 'Suomalainen', // Finnish
  // fil: 'Pilipino', // Filipino
  fr: 'Français', // French
  // gu: 'ગુજરાતી', // Gujarati
  // he: 'עברית', // Hebrew
  // hi: 'हिंदी', // Hindi
  // hr: 'Hrvatski', // Croatian
  // hu: 'Magyar', // Hungarian
  // id: 'Indonesia', // Indonesian
  // it: 'Italiano', // Italian
  // ja: '日本語' // Japanese
  // kn: 'ಕನ್ನಡ', // Kannada
  // ko: '한국어', // Korean
  // lt: 'Lietuvis', // Lithuanian
  // lv: 'Latvietis', // Latvian
  // ml: 'മലയാളം', // Malayalam
  // mr: 'मराठी', // Marathi
  // ms: 'Melayu', // Malay
  // nl: 'Nederlands', // Dutch
  // no: 'norsk', // Norwegian
  // pl: 'Polskie', // Polish
  // pt: 'Português', // Portuguese
  // ro: 'Română', // Romanian
  // ru: 'Pусский', // Russian
  // sk: 'Slovenský', // Slovak
  // sr: 'Српски', // Serbian
  // sv: 'Svenska', // Swedish
  // sw: 'Kiswahili', // Swahili
  // ta: 'தமிழ்', // Tamil
  // te: 'తెలుగు', // Telugu
  // th: 'ไทย', // Thai
  // tr: 'Türk', // Turkish
  // uk: 'Українська', // Ukranian
  // vi: 'Tiếng Việt', // Vietnamese
  zh_CN: '简体中文', // Chinese
};

const whitelist = (function () {
  const keys = Object.keys(whitelistMap);
  const clickFunction = function (channel: string, lng: string, i18nextMainBackend: any) {
    return function (menuItem: any, browserWindow: any, event: any) {
      console.log(`Language change requested: ${lng}`);

      // Make sure we're not changing to the same language
      if (i18nextMainBackend.language === lng) {
        console.log(`Already using language: ${lng}`);
        return;
      }

      // Change the language in i18next
      console.log(`Changing language from ${i18nextMainBackend.language} to ${lng}`);
      i18nextMainBackend.changeLanguage(lng);

      // Wait a moment for the change to take effect
      setTimeout(() => {
        // Send unified settings update to the renderer
        if (browserWindow && !browserWindow.isDestroyed()) {
          console.log(`Sending settings-updated event with language: ${lng}`);
          browserWindow.webContents.send('settings-updated', { language: lng });
        }
      }, 100);
    };
  };

  return {
    langs: keys,
    buildSubmenu: function (channel: string, i18nextMainBackend: any) {
      console.log(`Building language submenu with ${keys.length} languages`);
      const submenu = [];

      for (const key of keys) {
        submenu.push({
          label: whitelistMap[key],
          type: 'radio',
          checked: i18nextMainBackend.language === key,
          click: clickFunction(channel, key, i18nextMainBackend),
        });
      }

      return submenu;
    },
    // A helper method to get language names for UI display
    // it should parse the appLocale value taken from ['fr-FR'] for example
    getLanguageName: function (code?: string): string {
      console.log('*********** getLanguageName', code);
      if (!code) return 'en';
      if (whitelistMap[code]) return code;
      const localCode = code.split('-')[0];
      if (!localCode) return 'en';
      return whitelistMap[localCode] ? localCode : 'en';
    },
  };
})();

export default whitelist;
