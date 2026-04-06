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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsPageViewProps {
  currentView: string;
  notifications: boolean;
  darkMode: boolean;
  language: string;
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
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-6 pb-32">
        {/* Preferences */}
        <div className={cardClass}>
          <h2 className={titleClass}>Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <div className={labelClass}>Notifications</div>
                  <div className={descClass}>Get notified about game updates</div>
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
                  <div className={labelClass}>Dark Mode</div>
                  <div className={descClass}>Use dark theme</div>
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
                  <div className={labelClass}>Language</div>
                  <div className={descClass}>Choose your language</div>
                </div>
              </div>
              <Select value={props.language} onValueChange={props.handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FloppyDisk className="w-5 h-5 text-orange-400" />
                <div>
                  <div className={labelClass}>Auto Save</div>
                  <div className={descClass}>Automatically save changes</div>
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
                  <div className={labelClass}>Show Tooltips</div>
                  <div className={descClass}>Display helpful tooltips</div>
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
          <h2 className={titleClass}>Data Management</h2>
          <div className="space-y-3">
            {/* Last operation dates */}
            <div className="space-y-1 pb-2 border-b border-white/10 text-xs text-white/40">
              <div className="flex justify-between">
                <span>BGG Catalog importé</span>
                <span>{props.bggCatalogImportedAt ? new Date(props.bggCatalogImportedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
            </div>

            <Button
              onClick={props.handleExportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button 
              onClick={props.handleImportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>

            <Button
              onClick={props.handleResetData}
              className="w-full justify-start"
              variant="destructive"
            >
              <Trash className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>

            {/* BGG Catalog */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">BGG Catalog</span>
                <span className="text-xs text-white/40">
                  {props.bggCatalogCount === null
                    ? '…'
                    : props.bggCatalogCount === 0
                      ? 'Non importé'
                      : `${props.bggCatalogCount.toLocaleString()} jeux`}
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
                    {props.isBggImporting ? 'Import en cours…' : 'Importer boardgames_ranks.csv'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>}

        {/* About */}
        <div className={cardClass}>
          <h2 className={titleClass}>About</h2>
          <div className={aboutTextClass}>
            <div>Board Game Dashboard v1.0.0</div>
            <div className={aboutDescClass}>
              A modern dashboard for tracking your board game sessions and player statistics.
            </div>
          </div>
        </div>

        {/* Session */}
        <div className={cardClass}>
          <h2 className={titleClass}>Session</h2>
          <Button
            onClick={props.onLogout}
            variant="outline"
            className="w-full justify-start border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500"
          >
            <SignOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </div>

    </div>
  );
}