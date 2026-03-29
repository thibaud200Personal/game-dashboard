import { useState, useEffect } from 'react';
import { NavigationHandler } from '@/types';
import apiService from '@/services/ApiService';

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

  // Import log
  type ImportLog = { bgg_catalog_imported_at: string | null; data_exported_at: string | null; data_imported_at: string | null };
  const [importLog, setImportLog] = useState<ImportLog | null>(null);

  // BGG Catalog
  const [bggCatalogCount, setBggCatalogCount] = useState<number | null>(null);
  const [isBggImporting, setIsBggImporting] = useState(false);
  const [bggImportError, setBggImportError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getBggCatalogStatus()
      .then(s => setBggCatalogCount(s.count))
      .catch(() => {});
    apiService.getImportLog()
      .then(setImportLog)
      .catch(() => {});
  }, []);

  const handleImportBggCatalog = async (file: File) => {
    setIsBggImporting(true);
    setBggImportError(null);
    try {
      const result = await apiService.importBggCatalog(file);
      setBggCatalogCount(result.count);
      apiService.getImportLog().then(setImportLog).catch(() => {});
    } catch (err) {
      setBggImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsBggImporting(false);
    }
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

    // Import log
    importLog,

    // BGG Catalog
    bggCatalogCount,
    isBggImporting,
    bggImportError,
    handleImportBggCatalog,

    onLogout
  };
};