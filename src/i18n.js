import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translation from './translations/en.json'

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation } },
  interpolation: {
    escapeValue: false, // react already protects against xss
  },
})

export default i18n
