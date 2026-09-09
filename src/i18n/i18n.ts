// ============================================
// LIFE'S — Configuración de i18next
// ============================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector) // detecta el idioma del navegador la primera vez
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es', // si no reconoce el idioma, arranca en español
    supportedLngs: ['es', 'en'],
    interpolation: {
      escapeValue: false, // React ya escapa el HTML solo
    },
    detection: {
      // guarda la elección del usuario para que no se resetee en cada visita
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lifes_language',
    },
  });

export default i18n;
