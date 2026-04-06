import { useState, useEffect } from 'react';
import { useNavigationAdapter } from './useNavigationAdapter';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/ApiService';

export const useSettingsPage = () => {
  const onNavigation = useNavigationAdapter();
  const { logout, role } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  const [bggCatalogImportedAt, setBggCatalogImportedAt] = useState<string | null>(null);
  const [bggCatalogCount, setBggCatalogCount] = useState<number | null>(null);
  const [isBggImporting, setIsBggImporting] = useState(false);
  const [bggImportError, setBggImportError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getBggCatalogStatus().then(s => {
      setBggCatalogCount(s.count);
      setBggCatalogImportedAt(s.bgg_catalog_imported_at);
    }).catch(() => {});
  }, []);

  const handleImportBggCatalog = async (file: File) => {
    setIsBggImporting(true);
    setBggImportError(null);
    try {
      const result = await apiService.importBggCatalog(file);
      setBggCatalogCount(result.count);
      apiService.getBggCatalogStatus().then(s => {
        setBggCatalogCount(s.count);
        setBggCatalogImportedAt(s.bgg_catalog_imported_at);
      }).catch(() => {});
    } catch (err) {
      setBggImportError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setIsBggImporting(false);
    }
  };

  return {
    currentView: 'settings',
    darkMode: true,
    notifications,
    language,
    autoSave,
    showTooltips,
    bggCatalogImportedAt,
    bggCatalogCount,
    isBggImporting,
    bggImportError,
    handleBackClick: () => onNavigation('dashboard'),
    onNavigation,
    handleNotificationsChange: setNotifications,
    handleDarkModeChange: (_enabled: boolean) => {},
    handleLanguageChange: setLanguage,
    handleAutoSaveChange: setAutoSave,
    handleShowTooltipsChange: setShowTooltips,
    handleExportData: () => {},
    handleImportData: () => {},
    handleResetData: () => {},
    handleImportBggCatalog,
    onLogout: logout,
    isAdmin: role === 'admin',
  };
};
