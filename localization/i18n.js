// localization/i18n.js
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import translations
import enTranslation from './translations/en.json';
import bnTranslation from './translations/bn.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Initialize i18n
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3', // Handle compatibility with Android
  resources: {
    en: {
      translation: enTranslation,
    },
    bn: {
      translation: bnTranslation,
    },
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Function to get the saved language
export const getSavedLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language || 'en'; // Default to English if nothing is saved
  } catch (error) {
    console.error('Error getting saved language:', error);
    return 'en';
  }
};

// Function to set the language
export const setLanguage = async language => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
    return true;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
};

// Load saved language on initialization
getSavedLanguage().then(language => {
  i18n.changeLanguage(language);
});

export default i18n;
