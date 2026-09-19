import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getLocalizedCrop } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('farmnexus_language') || 'en';
  });

  const [hasChosenLanguage, setHasChosenLanguageState] = useState(() => {
    return localStorage.getItem('farmnexus_lang_chosen') === 'true';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('farmnexus_language', lang);
  };

  const confirmLanguageSelection = (lang) => {
    setLanguage(lang);
    setHasChosenLanguageState(true);
    localStorage.setItem('farmnexus_lang_chosen', 'true');
  };

  const openLanguageSelection = () => {
    setHasChosenLanguageState(false);
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const translateCrop = (cropName) => {
    return getLocalizedCrop(cropName, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        hasChosenLanguage,
        confirmLanguageSelection,
        openLanguageSelection,
        t,
        translateCrop,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
