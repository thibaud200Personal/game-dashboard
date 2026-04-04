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

  const [isDataExporting, setIsDataExporting] = useState(false);
  const [isDataImporting, setIsDataImporting] = useState(false);
  const [isDataResetting, setIsDataResetting] = useState(false);
  const [dataOpError, setDataOpError] = useState<string | null>(null);

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
    isDataExporting,
    isDataImporting,
    isDataResetting,
    dataOpError,
    handleExportData: async () => {
      setIsDataExporting(true);
      setDataOpError(null);
      try {
        const blob = await apiService.exportData();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `board-game-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        setDataOpError(err instanceof Error ? err.message : 'Erreur export');
      } finally {
        setIsDataExporting(false);
      }
    },
    handleImportData: async (file: File) => {
      setIsDataImporting(true);
      setDataOpError(null);
      try {
        await apiService.importData(file);
      } catch (err) {
        setDataOpError(err instanceof Error ? err.message : 'Erreur import');
      } finally {
        setIsDataImporting(false);
      }
    },
    handleResetData: async () => {
      setIsDataResetting(true);
      setDataOpError(null);
      try {
        await apiService.resetData();
      } catch (err) {
        setDataOpError(err instanceof Error ? err.message : 'Erreur reset');
      } finally {
        setIsDataResetting(false);
      }
    },
    handleImportBggCatalog,
    onLogout: logout,
    isAdmin: role === 'admin',
  };
};
