import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import translations from '../i18n/translations';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsContext = createContext({
  theme: 'light',
  language: 'es',
  showBadge: true,
  t: (key) => key,
  setTheme: () => {},
  setLanguage: () => {},
  setShowBadge: () => {},
  refreshSettings: () => {},
});

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguageState] = useState(() => localStorage.getItem('language') || 'es');
  const [showBadge, setShowBadgeState] = useState(true);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Load settings from API
  const refreshSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/settings`, { withCredentials: true });
      if (res.data) {
        if (res.data.theme) { setThemeState(res.data.theme); }
        if (res.data.language) { setLanguageState(res.data.language); }
        if (res.data.show_badge !== undefined) { setShowBadgeState(res.data.show_badge); }
      }
    } catch {
      // Not logged in or error - use defaults
    }
  }, []);

  useEffect(() => { refreshSettings(); }, [refreshSettings]);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['es']?.[key] || key;
  }, [language]);

  const setTheme = (val) => { setThemeState(val); };
  const setLanguage = (val) => { setLanguageState(val); };
  const setShowBadge = (val) => { setShowBadgeState(val); };

  return (
    <SettingsContext.Provider value={{ theme, language, showBadge, t, setTheme, setLanguage, setShowBadge, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
