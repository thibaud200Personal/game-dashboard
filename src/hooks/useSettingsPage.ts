import { useState } from 'react';
import { NavigationHandler } from '@/types';

export interface SettingsPageData {
  onNavigation: NavigationHandler;
  currentView?: string;
  darkMode?: boolean;
  setDarkMode?: (enabled: boolean) => void;
  onLogout?: () => void;
}

export const useSettingsPage = (data: SettingsPageData) => {
  const { onNavigation, currentView = 'settings', onLogout = () => {} } = data;

  // Local state for settings
  const [notifications, setNotifications] = useState(true);
  // Utilise le darkMode global si fourni
  const darkMode = data.darkMode ?? true;
  const setDarkMode = data.setDarkMode ?? (() => {});
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  // Navigation handlers
  const handleBackClick = () => {
    onNavigation('dashboard');
  };

  // Settings handlers
  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    // Here you would typically persist to storage or API
  };

  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    // Ici, on applique le thème global
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // Here you would apply language changes
  };

  const handleAutoSaveChange = (enabled: boolean) => {
    setAutoSave(enabled);
  };

  const handleShowTooltipsChange = (enabled: boolean) => {
    setShowTooltips(enabled);
  };

  const handleExportData = () => {
    // Implementation for data export would go here
  };

  const handleImportData = () => {
    // Implementation for data import would go here
  };

  const handleResetData = () => {
    // Implementation for data reset would go here
  };

  return {
    // Data
    currentView,

    // Settings state
    notifications,
    darkMode,
    language,
    autoSave,
    showTooltips,

    // Navigation handlers
    handleBackClick,
    onNavigation,

    // Settings handlers
    handleNotificationsChange,
    handleDarkModeChange,
    handleLanguageChange,
    handleAutoSaveChange,
    handleShowTooltipsChange,
    handleExportData,
    handleImportData,
    handleResetData,
    onLogout
  };
};