import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next.on('failedLoading', function (lng, ns, msg) {
  console.log('[i18next] Failed to load:', { lng, ns });
  console.log(msg);
});

i18next.use(Backend).init({
  lng: 'en',
  debug: false,
  ns: 'translation',
  fallbackLng: ['pt'],
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
  },
  interpolation: {
    escapeValue: false,
  },
});
