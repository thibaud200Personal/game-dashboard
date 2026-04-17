import { useState, useEffect } from 'react';
import { useNavigationAdapter } from '@/shared/hooks/useNavigationAdapter';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useDarkMode } from '@/shared/contexts/DarkModeContext';
import { request } from '@/shared/services/api/request';
import { useLocaleContext } from '@/shared/contexts/LocaleContext';
import { useApiReachable } from '@/shared/hooks/useApiReachable';
import { useLocales } from '@/shared/hooks/useLocales';

export const useSettingsPage = () => {
  const onNavigation = useNavigationAdapter();
  const { logout, role } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const { locale, setLocale } = useLocaleContext();
  const { isReachable, triggerRetry } = useApiReachable();
  const { locales } = useLocales(isReachable);
  const [showTooltips, setShowTooltips] = useState(true);

  const [bggCatalogImportedAt, setBggCatalogImportedAt] = useState<string | null>(null);
  const [bggCatalogCount, setBggCatalogCount] = useState<number | null>(null);
  const [isBggImporting, setIsBggImporting] = useState(false);
  const [bggImportError, setBggImportError] = useState<string | null>(null);

  const [isDataExporting, setIsDataExporting] = useState(false);
  const [isDataImporting, setIsDataImporting] = useState(false);
  const [isDataResetting, setIsDataResetting] = useState(false);
  const [dataOpError, setDataOpError] = useState<string | null>(null);

  const getBggCatalogStatus = () =>
    request<{ count: number; bgg_catalog_imported_at: string | null }>('/api/v1/bgg/import-status');

  useEffect(() => {
    getBggCatalogStatus().then(s => {
      setBggCatalogCount(s.count);
      setBggCatalogImportedAt(s.bgg_catalog_imported_at);
    }).catch(() => {});
  }, []);

  const handleImportBggCatalog = async (file: File) => {
    setIsBggImporting(true);
    setBggImportError(null);
    try {
      const text = await file.text();
      await request<{ count: number }>('/api/v1/bgg/import-catalog', {
        method: 'POST',
        body: text,
        headers: { 'Content-Type': 'text/plain' },
      });
      getBggCatalogStatus().then(s => {
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
    darkMode,
    locale,
    locales,
    isApiReachable: isReachable,
    showTooltips,
    bggCatalogImportedAt,
    bggCatalogCount,
    isBggImporting,
    bggImportError,
    handleBackClick: () => onNavigation('dashboard'),
    onNavigation,
    handleDarkModeChange: toggleDarkMode,
    handleLanguageChange: setLocale,
    handleRetryConnection: triggerRetry,
    handleShowTooltipsChange: setShowTooltips,
    isDataExporting,
    isDataImporting,
    isDataResetting,
    dataOpError,
    handleExportData: async () => {
      setIsDataExporting(true);
      setDataOpError(null);
      try {
        const res = await fetch('/api/v1/data/export', { credentials: 'include' });
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
        const blob = await res.blob();
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
        const text = await file.text();
        await request<{ ok: boolean }>('/api/v1/data/import', {
          method: 'POST',
          body: text,
          headers: { 'Content-Type': 'application/json' },
        });
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
        await request<{ ok: boolean }>('/api/v1/data/reset', { method: 'POST' });
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
