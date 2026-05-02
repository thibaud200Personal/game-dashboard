import React, { useRef } from 'react';
import {
  ArrowLeft,
  Moon,
  Globe,
  Info,
  Download,
  Upload,
  Trash,
  SignOut
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { useLabels } from '@/shared/hooks/useLabels';
import PageHeader from '@/shared/components/PageHeader';

interface SettingsPageViewProps {
  currentView: string;
  darkMode: boolean;
  locale: string;
  locales: Array<{ locale: string; name: string }>;
  isApiReachable: boolean;
  handleRetryConnection: () => void;
  showTooltips: boolean;
  handleBackClick: () => void;
  onNavigation: (view: string) => void;
  handleDarkModeChange: (enabled: boolean) => void;
  handleLanguageChange: (lang: string) => void;
  handleShowTooltipsChange: (enabled: boolean) => void;
  handleExportData: () => void;
  handleImportData: () => void;
  handleResetData: () => void;
  bggCatalogImportedAt: string | null;
  bggCatalogCount: number | null;
  isBggImporting: boolean;
  bggImportError: string | null;
  handleImportBggCatalog: (file: File) => void;
  isEnriching: boolean;
  handleEnrichNames: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export function SettingsPageView(props: SettingsPageViewProps) {
  const { t } = useLabels();
  const bggFileRef = useRef<HTMLInputElement>(null);
  const cardClass = "bg-white dark:bg-white/10 dark:backdrop-blur-md rounded-2xl p-4 border border-slate-300 dark:border-white/20 shadow-xl";
  const titleClass = "text-lg font-semibold mb-4 text-slate-900 dark:text-white";
  const labelClass = "font-medium text-slate-900 dark:text-white";
  const descClass = "text-slate-500 dark:text-white/60 text-sm";
  const aboutTextClass = "space-y-2 text-slate-800 dark:text-white/80";
  const aboutDescClass = "text-sm text-slate-500 dark:text-white/60";
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <PageHeader
          title={t('settings.page.title')}
          left={
            <button
              onClick={props.handleBackClick}
              aria-label="Go back"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          }
          className="mb-6"
        />
      </div>

      {/* Content */}
      <div className="px-4 space-y-6 pb-32">
        {/* Preferences */}
        <div className={cardClass}>
          <h2 className={titleClass}>{t('settings.section.preferences')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <div className={labelClass}>{t('settings.dark_mode.label')}</div>
                  <div className={descClass}>{t('settings.dark_mode.desc')}</div>
                </div>
              </div>
              <Switch
                checked={props.darkMode}
                disabled
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
                  <Button
                    variant="link"
                    size="sm"
                    onClick={props.handleRetryConnection}
                    className="text-xs text-orange-400 hover:text-orange-300 h-auto p-0"
                  >
                    {t('settings.language.retry')}
                  </Button>
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
            <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-white/10 text-xs text-slate-400 dark:text-white/40">
              <div className="flex justify-between">
                <span>{t('settings.data.bgg_imported')}</span>
                <span>{props.bggCatalogImportedAt ? new Date(props.bggCatalogImportedAt).toLocaleString(navigator.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full justify-start" variant="destructive">
                  <Trash className="w-4 h-4 mr-2" />
                  {t('settings.data.reset')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.data.reset.confirm.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.data.reset.confirm.desc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.data.reset.confirm.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={props.handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('settings.data.reset.confirm.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* BGG Catalog */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-white/70">{t('settings.data.bgg_catalog')}</span>
                <span className="text-xs text-slate-500 dark:text-white/40">
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
              <input
                ref={bggFileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) props.handleImportBggCatalog(file);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={props.isBggImporting}
                onClick={() => bggFileRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {props.isBggImporting ? t('settings.data.bgg_importing') : t('settings.data.bgg_import_file')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={props.isEnriching || props.isBggImporting}
                onClick={props.handleEnrichNames}
              >
                <Globe className="w-4 h-4 mr-2" />
                {props.isEnriching ? t('settings.data.bgg_enriching') : t('settings.data.bgg_enrich')}
              </Button>
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
            variant="destructive"
            className="w-full justify-start"
          >
            <SignOut className="w-4 h-4 mr-2" />
            {t('settings.logout')}
          </Button>
        </div>
      </div>

    </div>
  );
}