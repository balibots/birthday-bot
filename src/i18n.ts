import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

export const DEFAULT_LANGUAGE = 'en';

i18next.on('failedLoading', function (lng, ns, msg) {
  console.log('[i18next] Failed to load:', { lng, ns });
  console.log(msg);
});

i18next.use(Backend).init({
  lng: DEFAULT_LANGUAGE,
  debug: false,
  ns: 'translation',
  fallbackLng: ['en'],
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
  },
  interpolation: {
    escapeValue: false,
  },
});
