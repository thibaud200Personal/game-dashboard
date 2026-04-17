import React from 'react';
import {
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  FloppyDisk,
  Info,
  Download,
  Upload,
  Trash,
  SignOut
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLabels } from '@/shared/hooks/useLabels';

interface SettingsPageViewProps {
  currentView: string;
  notifications: boolean;
  darkMode: boolean;
  locale: string;
  locales: Array<{ locale: string; name: string }>;
  isApiReachable: boolean;
  handleRetryConnection: () => void;
  autoSave: boolean;
  showTooltips: boolean;
  handleBackClick: () => void;
  onNavigation: (view: string) => void;
  handleNotificationsChange: (enabled: boolean) => void;
  handleDarkModeChange: (enabled: boolean) => void;
  handleLanguageChange: (lang: string) => void;
  handleAutoSaveChange: (enabled: boolean) => void;
  handleShowTooltipsChange: (enabled: boolean) => void;
  handleExportData: () => void;
  handleImportData: () => void;
  handleResetData: () => void;
  bggCatalogImportedAt: string | null;
  bggCatalogCount: number | null;
  isBggImporting: boolean;
  bggImportError: string | null;
  handleImportBggCatalog: (file: File) => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export function SettingsPageView(props: SettingsPageViewProps) {
  const { t } = useLabels();
  const mainClass = props.darkMode
    ? "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white"
    : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900";

  // Classes dynamiques pour les cards et textes
  const cardClass = props.darkMode
    ? "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl"
    : "bg-white rounded-2xl p-4 border border-slate-300 shadow-xl";
  const titleClass = props.darkMode
    ? "text-lg font-semibold mb-4 text-white"
    : "text-lg font-semibold mb-4 text-slate-900";
  const labelClass = props.darkMode
    ? "font-medium text-white"
    : "font-medium text-slate-900";
  const descClass = props.darkMode
    ? "text-white/60 text-sm"
    : "text-slate-500 text-sm";
  const aboutTextClass = props.darkMode
    ? "space-y-2 text-white/80"
    : "space-y-2 text-slate-800";
  const aboutDescClass = props.darkMode
    ? "text-sm text-white/60"
    : "text-sm text-slate-500";
  return (
  <div className={mainClass}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={props.handleBackClick}
            aria-label="Go back"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('settings.page.title')}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-6 pb-32">
        {/* Preferences */}
        <div className={cardClass}>
          <h2 className={titleClass}>{t('settings.section.preferences')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <div className={labelClass}>{t('settings.notifications.label')}</div>
                  <div className={descClass}>{t('settings.notifications.desc')}</div>
                </div>
              </div>
              <Switch 
                checked={props.notifications} 
                onCheckedChange={props.handleNotificationsChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <div className={labelClass}>{t('settings.dark_mode.label')}</div>
                  <div className={descClass}>{t('settings.dark_mode.desc')}</div>
                </div>
              </div>
              <Switch 
                checked={props.darkMode} 
                onCheckedChange={props.handleDarkModeChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-400" />
                <div>
                  <div className={labelClass}>{t('settings.language.label')}</div>
                  <div className={descClass}>{t('settings.language.desc')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!props.isApiReachable && (
                  <button
                    onClick={props.handleRetryConnection}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors underline"
                  >
                    {t('settings.language.retry')}
                  </button>
                )}
                <Select
                  value={props.locale}
                  onValueChange={props.handleLanguageChange}
                  disabled={props.locales.length === 0}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {props.locales.map(l => (
                      <SelectItem
                        key={l.locale}
                        value={l.locale}
                        disabled={l.locale !== 'en' && !props.isApiReachable}
                      >
                        {l.locale !== 'en' && !props.isApiReachable
                          ? `${l.name} (${t('settings.language.offline')})`
                          : l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FloppyDisk className="w-5 h-5 text-orange-400" />
                <div>
                  <div className={labelClass}>{t('settings.auto_save.label')}</div>
                  <div className={descClass}>{t('settings.auto_save.desc')}</div>
                </div>
              </div>
              <Switch 
                checked={props.autoSave} 
                onCheckedChange={props.handleAutoSaveChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className={labelClass}>{t('settings.tooltips.label')}</div>
                  <div className={descClass}>{t('settings.tooltips.desc')}</div>
                </div>
              </div>
              <Switch 
                checked={props.showTooltips} 
                onCheckedChange={props.handleShowTooltipsChange}
              />
            </div>
          </div>
        </div>

        {/* Data Management — admin only */}
        {props.isAdmin && <div className={cardClass}>
          <h2 className={titleClass}>{t('settings.section.data')}</h2>
          <div className="space-y-3">
            {/* Last operation dates */}
            <div className="space-y-1 pb-2 border-b border-white/10 text-xs text-white/40">
              <div className="flex justify-between">
                <span>{t('settings.data.bgg_imported')}</span>
                <span>{props.bggCatalogImportedAt ? new Date(props.bggCatalogImportedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
            </div>

            <Button
              onClick={props.handleExportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('settings.data.export')}
            </Button>

            <Button
              onClick={props.handleImportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('settings.data.import')}
            </Button>

            <Button
              onClick={props.handleResetData}
              className="w-full justify-start"
              variant="destructive"
            >
              <Trash className="w-4 h-4 mr-2" />
              {t('settings.data.reset')}
            </Button>

            {/* BGG Catalog */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">{t('settings.data.bgg_catalog')}</span>
                <span className="text-xs text-white/40">
                  {props.bggCatalogCount === null
                    ? '…'
                    : props.bggCatalogCount === 0
                      ? t('settings.data.bgg_not_imported')
                      : `${props.bggCatalogCount.toLocaleString()} ${t('settings.data.bgg_catalog_games')}`}
                </span>
              </div>
              {props.bggImportError && (
                <p className="text-xs text-red-400 mb-2">{props.bggImportError}</p>
              )}
              <label className="w-full cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  disabled={props.isBggImporting}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) props.handleImportBggCatalog(file);
                    e.target.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full justify-start pointer-events-none"
                  disabled={props.isBggImporting}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {props.isBggImporting ? t('settings.data.bgg_importing') : t('settings.data.bgg_import_file')}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>}

        {/* About */}
        <div className={cardClass}>
          <h2 className={titleClass}>{t('settings.section.about')}</h2>
          <div className={aboutTextClass}>
            <div>{t('settings.about.version')}</div>
            <div className={aboutDescClass}>{t('settings.about.desc')}</div>
          </div>
        </div>

        {/* Session */}
        <div className={cardClass}>
          <h2 className={titleClass}>{t('settings.section.session')}</h2>
          <Button
            onClick={props.onLogout}
            variant="outline"
            className="w-full justify-start border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500"
          >
            <SignOut className="w-4 h-4 mr-2" />
            {t('settings.logout')}
          </Button>
        </div>
      </div>

    </div>
  );
}