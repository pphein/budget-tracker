import React, { createContext, useContext, useState, useCallback } from 'react';
import { STRINGS } from './strings';

const LANG_KEY = 'language';
export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'my', label: 'မြန်မာ' },
];

export const getInitialLanguage = () => localStorage.getItem(LANG_KEY) || 'en';

const LanguageContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} });

// Deliberate, scoped exception to this codebase's "no Context" convention —
// a language toggle needs every component to re-render on change, which
// prop-drilling through ~50 components would make impractical.
export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitialLanguage);

  const setLang = useCallback((id) => {
    setLangState(id);
    localStorage.setItem(LANG_KEY, id);
  }, []);

  const t = useCallback((key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
